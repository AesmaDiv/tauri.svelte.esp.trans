import { ask } from "@tauri-apps/api/dialog";
import { get, writable, type Writable } from "svelte/store";

import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import type { AxisInfo } from "../lib/Chart/chart";
import { type ITiming, TestStates, HipotModes, HipotPoint, type HipotData, Point } from "../shared/types";
import { sleep } from "../shared/funcs";
import { POINTS_HIPOT, updatePoints, updateRecord } from "../stores/database";
import { TEST_STATE } from "../stores/testing";
import { Di30R, Di30R_Flags, type Di30R_Values } from "./equipment/di30r";
import { switchDigital } from "./equipment/adam";
import { SETTINGS } from "../stores/settings";
import { AXIES as AXIES_HIPOT_INIT } from "../configs/cfg_hipot";
import { HIPOT_INIT } from "./temp";


/** Интерфейс высоковольтного блока Di30R */
let di30r      : Di30R = undefined;
/** Таймер испытания */
let test_timer : NodeJS.Timer;
/** Состояние испытания */
let is_running : boolean = false;
/** Текущий режим (ВВ-НВ, ВВ-0, НВ-0)*/
export let MODE   : Writable<HipotModes>   = writable(undefined);
/** Текущие значения */
export let POINTS : Writable<HipotPoint> = writable(new HipotPoint());
/** Маркер графика портребляемой мощности */
export let MARKER: Writable<Point> = writable(new Point());
/** Параметры осей графика потребляемой мощности */
export let AXIES: Writable<{[name: string]: AxisInfo}> = writable(AXIES_HIPOT_INIT);


// при изменении настроек ->
SETTINGS.subscribe(settings => {
  if (!settings.test) return;
  // обновить параметры оси времени для графиков испытаний
  AXIES.update(axis => {
    axis.time = { minimum: 0, maximum: settings.test.hipot.duration, ticks: 5, coef: 1/* / 60*/ };
    // axis.resist = { minimum: 1, maximum: 10000000, ticks: 5, coef: 1 };
    return axis;
  });
});


/** Проверка несохраненных точек */
export async function haveUnsavedData() {
    if (get(POINTS_HIPOT)) {
      let answer = await ask(
      "Имеются несохраненные данные.\n" +
      "Вы уверены, что хотите выбрать другую запись?",
      "НВимание");
      if (answer) resetPoints();
      return !answer;
    }
    return false;
}
export function savePoints() {
  updatePoints(TestStates.HIPOT, get(POINTS_HIPOT));
}
/** Очистка точек графика испытания */
export function resetPoints() {
  console.log("Очистка точек высоковольтного испытания");
  POINTS_HIPOT.set({});
}
/** Переключение состояния испытания */
export async function switchTest() {
  // если не указан режим испытания
  if (get(MODE) !== undefined) {
    ({
      [TestStates.ROHMS]: () => showMessage("Идёт измерение омического сопротивления", NotifierKind.WARNING),
      [TestStates.HIPOT]: stopTest,
      [TestStates.IDLE]: startTest
    }[get(TEST_STATE)])();
  } else showMessage("Выберите режим испытания", NotifierKind.WARNING);
}
/** Запуск испытания */
async function startTest() {
  console.log("startTest");
  di30r = di30r ?? new Di30R();
  TEST_STATE.set(TestStates.HIPOT);
  const mode = get(MODE);
  if (await di30r.connect(get(SETTINGS).com['hipot'])) {
    await switchMode(mode);
    // сброс по умолчанию
    let stage = await di30r.setDefaults();
    console.log(stage);
    // отключение реле ступеней разрядки
    stage &&= await di30r.switchDischarge(Di30R_Flags.Stage1, true, 500);
    stage &&= await di30r.switchDischarge(Di30R_Flags.Stage2, true, 500);
    stage &&= await di30r.switchDischarge(Di30R_Flags.Stage3, true, 500);
    stage &&= await di30r.switchDischarge(Di30R_Flags.HiVols, true, 500);
    // если реле отработали нормально
    if (stage) {
      // запускаем таймер измерений
      is_running = true;
      // очищаем точки
      POINTS_HIPOT.update((points: HipotData) => {
        points[mode] = [];
        return points;
      })
      test_timer = setInterval(
        async() => await measure(),
        get(SETTINGS).test.hipot.pulling_rate
      );
      showMessage("Высоковольтное испытание запущено.", NotifierKind.SUCCESS)
      return;
    } else showMessage("Ошибка управления реле разрядки.", NotifierKind.ERROR);
  } else showMessage("Не удалось подключиться в ВВ блоку.", NotifierKind.ERROR);
  await switchMode(undefined);
  TEST_STATE.set(TestStates.IDLE);
}
/** Остановка испытания */
async function stopTest() {
  console.log("stopTest")
  is_running = false;
  try {
    await di30r.dropVoltage();
    clearInterval(test_timer);
  } finally {
    await di30r.disconnect();
    await switchMode(undefined);
    di30r = undefined;
    POINTS.set(new HipotPoint());
    TEST_STATE.set(TestStates.IDLE);
    showMessage("Испытание закончено", NotifierKind.SUCCESS);
  }
}
/** Измерение */
async function measure() {
  const values: Di30R_Values = await di30r.getValues();
  const timing: ITiming = get(SETTINGS).test.hipot;
  const coeffs = get(SETTINGS).di30r;
  POINTS.update(point => {
    if (is_running) point.time += timing.pulling_rate / 1000.0;
    // проверяем время для окончания испытания
    if (point.time > timing.duration && is_running) stopTest();

    point.voltage = values.volts * coeffs.voltage;
    point.current = values.ampHi >= 50 ?
      values.ampLo * coeffs.amps_lo :
      values.ampHi * coeffs.amps_hi;
    point.resist  = 1234 + (point.current > 0 ?
      point.voltage / point.current :
      1);

    MARKER.set({x: point.time, y: point.resist});
    // проверяем условие добавления точки
    if (point.time % (timing.duration / timing.points_count) === 0) addPoint(point);

    return point;
  })
}
/** Установка режима испытания */
async function switchMode(mode: HipotModes) {
  // переключение реле для выбранного режима
  switch (mode) {
    // высокая - земля
    case HipotModes.H0:
      await switchDigital("k4", false);
      await switchDigital("k5", true);
      await switchDigital("k6", true);
      await switchDigital("k7", true);
      break;
    // низкая - земля
    case HipotModes.L0:
      await switchDigital("k4", true);
      await switchDigital("k5", true);
      await switchDigital("k6", true);
      await switchDigital("k7", true);
      break;
    // высокая - низкая
    case HipotModes.HL:
      await switchDigital("k4", false);
      await switchDigital("k5", true);
      await switchDigital("k6", true);
      await switchDigital("k7", false);
      break;
    // выключено
    default: 
      await switchDigital("k4", false);
      await switchDigital("k5", false);
      await switchDigital("k6", false);
      await switchDigital("k7", false);
  }
}

function addPoint(point: HipotPoint) : boolean {
  console.log("Добавление точки");
  let count = 0;
  const timings = get(SETTINGS).test.hipot;
  const mode = get(MODE);
  if (mode !== undefined) {
    POINTS_HIPOT.update(points => {
      if (!points) points = {};
      points[mode].push({...point});
      count = points[mode].length;
      return points;
    });
  }

  return count <= timings.points_count;
}


export function fillPointsRandom() {
  POINTS_HIPOT.update((data: HipotData) => {
    data[HipotModes.H0] = [...Array(61)].map((_, i) => {
      let point = new HipotPoint();
      point.time = i;
      point.voltage = 15000.0;
      point.current = (i + 1) * 10.001;
      point.resist = point.voltage / point.current;
      return point;
    });
    data[HipotModes.L0] = [...Array(61)].map((_, i) => {
      let point = new HipotPoint();
      point.time = i;
      point.voltage = 15000.0;
      point.current = (i + 1) * 10.002;
      point.resist = point.voltage / point.current;
      return point;
    });
    data[HipotModes.HL] = [...Array(61)].map((_, i) => {
      let point = new HipotPoint();
      point.time = i;
      point.voltage = 15000.0;
      point.current = (i + 1) * 10.003;
      point.resist = point.voltage / point.current;
      return point;
    });
    return data;
  })
  console.log(get(POINTS_HIPOT));
}