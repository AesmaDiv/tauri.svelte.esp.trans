import { invoke } from "@tauri-apps/api/tauri";
import { type Writable, writable, get } from "svelte/store";
import { RECORD, updatePoints as updateDbPoints} from "./database";
import { SENSORS, ADAM_READING } from "./equipment";
import { sleep } from "../shared/funcs";
import type { HipotPoint, HipotData, ITiming } from "../shared/types";
import { TestStates } from "../shared/types";
import { showMessage, NotifierKind } from "../lib/Notifier/notifier";
import { switchTest as switchTestROhms } from "../testing/testing_rohms";
import { switchTest as switchTestHipot } from "../testing/testing_hipot";
import { SETTINGS } from "./settings";


/** Текущее испытание */
export let TEST_STATE: Writable<TestStates> = writable(TestStates.IDLE);

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
    [TestStates.ROHMS] : switchTestROhms,
    [TestStates.HIPOT] : switchTestHipot,
  })[test_state]();
}
/** Проверка состояния испытания */
export function isTestRunning() : boolean {
  return get(TEST_STATE) !== TestStates.IDLE;
}
/** Проверка состояния другого испытания */
export function isOtherTestRunning (test_state: TestStates) {
  return isTestRunning() && get(TEST_STATE) !== test_state;
  // ![TestStates.IDLE, test_state].includes(get(TEST_STATE))
}

/** Очистка точек графика испытания */
export function resetPoints(test_state: TestStates = TestStates.IDLE) {
  // // если тест для которого нужно очистить точки не указан ->
  // if (test_state === TestStates.IDLE) {
  //   // очистить все несохраненные точки
  //   resetPoints(TestStates.ROHMS);
  //   resetPoints(TestStates.HIPOT);
  //   return;
  // };
  // console.log("Очистка точек испытания %o", test_state);
  // // сброс значения пройденого времени испытания
  // SENSORS.update(data => { data.time = 0; return data });
  // // очистка данных об испытании
  // let points = ({
  //   [TestStates.HIPOT]: POINTS_HIPOT,
  //   [TestStates.ROHMS]: POINTS_ROHMS,
  // })[test_state];
  // points.set({});
}

/** Сохранение точек графика испытания в БД */
export function savePoints(test_state: TestStates) {
  // if (test_state === TestStates.IDLE) return;
  // let points = ({
  //   [TestStates.HIPOT]: get(POINTS_HIPOT),
  //   [TestStates.ROHMS]: get(POINTS_ROHMS),
  // })[test_state];
  // let check_sum = Object.values(points)
  // .flatMap(v => Object.values(v).flat())
  // .reduce((a: number, c: number) => a + c, 0);
  // console.log(check_sum);
  // if (check_sum) {
  //   updateDbPoints(test_state, points);
  //   resetPoints(test_state);
  //   return;
  // };
  // showMessage("Нет данных для сохранения", NotifierKind.WARNING);
}

/** Добавление точки испытания  */
export function updateTime(test_state: TestStates) {
  const timings : ITiming = get(SETTINGS).test[test_state];
  SENSORS.update(data => {
    data.time += timings.pulling_rate / 1000;
    return data;
  });
}


