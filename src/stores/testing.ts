import { ask } from "@tauri-apps/api/dialog";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { type Writable, writable, get } from "svelte/store";
import { SETTINGS } from "./settings";
import { RECORD, updatePoints as updateDbPoints} from "./database";
import { SENSORS, ADAM_READING } from "./equipment";
import type { HipotPoint, ITiming, ROhmData, HipotData } from "../shared/types";
import { TestStates } from "../shared/types";
import { SerialPort } from "../shared/serialPort";
import type { AxisInfo } from "../lib/Chart/chart";
import { showMessage, NotifierKind } from "../lib/Notifier/notifier";
import { switchTest as switchPressTest } from "../testing/testing_press";
import { switchTest as switchPowerTest } from "../testing/testing_power";
import { AXIES as AXIES_HIPOT_INIT } from "../configs/cfg_hipot";


let rohm_timer: NodeJS.Timer;
let hipot_init: {[name: string]: HipotPoint[]} = {
  h0: [
    {time: 0,  voltage: 380, current: 0.1},
    {time: 4,  voltage: 380, current: 0.2},
    {time: 8,  voltage: 380, current: 0.3},
    {time: 12, voltage: 380, current: 0.4},
    {time: 16, voltage: 380, current: 0.5},
    {time: 20, voltage: 380, current: 0.6},
  ],
  l0: [
    {time: 0,  voltage: 380, current: 1.1},
    {time: 4,  voltage: 380, current: 1.2},
    {time: 8,  voltage: 380, current: 1.3},
    {time: 12, voltage: 380, current: 1.4},
    {time: 16, voltage: 380, current: 1.5},
  ],
  hl: [
    {time: 0,  voltage: 380, current: 2.1},
    {time: 4,  voltage: 380, current: 2.2},
    {time: 8,  voltage: 380, current: 2.3},
    {time: 12, voltage: 380, current: 2.4},
  ],
}



/** Текущее испытание */
export let TEST_STATE: Writable<TestStates> = writable(TestStates.IDLE);
/** Маркер графика портребляемой мощности */
export let MARKER_HIPOT: Writable<HipotPoint> = writable({} as HipotPoint);
/** Точки графиков измерения потребляемой мощности c ADAM */
export let POINTS_HIPOT: Writable<HipotData> = writable(hipot_init);
/** Параметры осей графика потребляемой мощности */
export let AXIS_HIPOT: Writable<{[name: string]: AxisInfo}> = writable(AXIES_HIPOT_INIT);


/** Проверка состояния испытания */
export function isTestRunning() : boolean {
  return get(TEST_STATE) !== TestStates.IDLE;
}
/** Проверка состояния другого испытания */
export function isOtherTestRunning (test_state: TestStates) {
  return isTestRunning() && get(TEST_STATE) !== test_state;
  // ![TestStates.IDLE, test_state].includes(get(TEST_STATE))
}
/** Проверка несохраненных точек */
export async function haveUnsavedData() {
    if (get(POINTS_HIPOT)) {
      let answer = await ask(
      "Имеются несохраненные данные.\n" +
      "Вы уверены, что хотите выбрать другую запись?",
      "Внимание");
      if (answer) resetPoints();
      return !answer;
    }
    return false;
}
/** Очистка точек графика испытания */
export function resetPoints(test_state: TestStates = TestStates.IDLE) {
  // если тест для которого нужно очистить точки не указан ->
  if (test_state === TestStates.IDLE) {
    // очистить все несохраненные точки
    resetPoints(TestStates.ROHMS);
    resetPoints(TestStates.HIPOT);
    return;
  };
  console.log("Очистка точек испытания %o", test_state);
  // сброс значения пройденого времени испытания
  SENSORS.update(data => { data.time = 0; return data });
  // очистка данных об испытании
  let points = ({
    [TestStates.HIPOT]: POINTS_HIPOT,
  })[test_state];
  points.set({});
}
/** Сохранение точек графика испытания в БД */
export function savePoints(test_state: TestStates) {
  if (test_state === TestStates.IDLE) return;
  let points = ({
    [TestStates.HIPOT]: get(POINTS_HIPOT),
  })[test_state];
  let pp = Object.values(points);
  console.log(pp);
  pp = pp.flat();
  console.log(pp);
  let check_sum = Object.values(points)
  .flatMap(v => Object.values(v).flat())
  .reduce((a: number, c: number) => a + c, 0);
  console.log(check_sum);
  if (check_sum) {
    updateDbPoints(test_state, points);
    resetPoints(test_state);
    return;
  };
  showMessage("Нет данных для сохранения", NotifierKind.WARNING);
}
/** Добавление точки испытания  */
export function updateTime(test_state: TestStates) {
  const timings : ITiming = get(SETTINGS).test[test_state];
  SENSORS.update(data => {
    data.time += timings.pulling_rate / 1000;
    return data;
  });
}
/** Переключение состояния испытаний */
export function switchTest(test_state: TestStates) {
  if (!get(ADAM_READING)) {
    showMessage("Не запущен опрос Adam", NotifierKind.ERROR);
    return;
  }
  // если идёт другое испытание ->
  // выход из функции
  if (isOtherTestRunning(test_state)) {
    showMessage("Выполняется другое испытание", NotifierKind.ERROR);
    return;
  }
  // запуск/остановка испытания
  ({
    [TestStates.ROHMS] : switchPressTest,
    [TestStates.HIPOT] : switchPowerTest,
  })[test_state]();
}

export async function micrometerStart() {
  const unlisten = await listen('rohm_measured', (event) => {
    let data: number[] = event.payload['data'];
    console.log("EVENT %o", data);
    console.log("STRING:", String.fromCharCode.apply(null, data))
    console.log("STRING:", Buffer.from(data).toString())
  });
  await invoke("serial_open", { wnd: appWindow, doListen: false });
  let count = 0;
  let tmr = setInterval(async() => {
    if (++count === 10) {
      await micrometerStop();
      clearInterval(tmr);
    }
    else {
      let respond = await invoke("serial_request", { bytes: [0x40, 0x30, 0x31, 0x0D]});
      console.log("Respond %o", respond);
    } 
  }, 1000);
}
export async function micrometerStop() {
  await invoke("serial_close", {});
}



// при изменении средних значений с ADAM ->
SENSORS.subscribe(data => {
  // // изменить маркер времени только для активного испытания
  // const test = get(TEST_STATE);
  // const press_time = test === TestStates.ROHMS ? data.time : 0;
  // const power_time = test === TestStates.HIPOT ? data.time : 0;
  // // обновить положение маркеров графиков
  // MARKER_PRESS.set({
  //   press_top: { x: press_time, y: data.press_top},
  //   press_btm: { x: press_time, y: data.press_btm},
  // });
  // MARKER_HIPOT.set({
  //   power : { x: power_time, y: data.power},
  //   temper: { x: power_time, y: data.temper},
  // });
});

// при изменении настроек ->
SETTINGS.subscribe(settings => {
  if (!settings.test) return;
  // обновить параметры оси времени для графиков испытаний
  AXIS_HIPOT.update(axis => {
    axis.time = { minimum: 0, maximum: settings.test.test_power.duration, ticks: 5, coef: 1/60 };
    return axis;
  });
});