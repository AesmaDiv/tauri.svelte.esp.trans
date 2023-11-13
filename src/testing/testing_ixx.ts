import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { get, writable, type Writable } from "svelte/store";

import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { PhasesPoint, TestStates } from "../shared/types";
import type { ITiming, IAdamData, IAdamSource, IAdamSourceParams } from "../shared/types";
import { bytes2string, sleep, roundValue } from "../shared/funcs";
import { RECORD, updatePoints, updateRecord } from "../stores/database";
import { SETTINGS } from "../stores/settings";
import { deserializePoints } from "../database/db_funcs";
import { switchDigital, resetDigital, readAll, getAnalogValue } from "./equipment/adam";


let init_amps: PhasesPoint = {phase_a: 1.1, phase_b: 1.2, phase_c: 1.3}
let init_volts_xx: PhasesPoint = {phase_a: 2.1, phase_b: 2.2, phase_c: 2.3}
let init_volts_hi: PhasesPoint = {phase_a: 3.1, phase_b: 3.2, phase_c: 3.3}
let init_volts_lo: PhasesPoint = {phase_a: 4.1, phase_b: 4.2, phase_c: 4.3}
const NAMES_I_XX = {
  'i_xx_a': 'phase_a',
  'i_xx_b': 'phase_b',
  'i_xx_c': 'phase_c',
};
const NAMES_U_XX = {
  'u_xx_a': 'phase_a',
  'u_xx_b': 'phase_b',
  'u_xx_c': 'phase_c',
};
const NAMES_U_LO = {
  'u_lo_a': 'phase_a',
  'u_lo_b': 'phase_b',
  'u_lo_c': 'phase_c',
};
const NAMES_U_HI = {
  'u_hi_a': 'phase_a',
  'u_hi_b': 'phase_b',
  'u_hi_c': 'phase_c',
};


/** Текущее измерение */
export let STATE: Writable<TestStates> = writable(TestStates.IDLE);
/** Время (обратный отсчет) */
export let TIME: Writable<number> = writable(120);
/** Текущий ток хх по фазам*/
export let AMPRS: Writable<PhasesPoint> = writable(init_amps);
/** Текущее напряжение по фазам НН для ХХ */
export let VOLTS_XX: Writable<PhasesPoint> = writable(init_volts_xx);
/** Текущее напряжение по фазам ВН*/
export let VOLTS_HI: Writable<PhasesPoint> = writable(init_volts_hi);
/** Текущее напряжение по фазам НН*/
export let VOLTS_LO: Writable<PhasesPoint> = writable(init_volts_lo);
/** Коэфициент трансформации */
export let COEFF: Writable<[number, number]> = writable([1,1]);


RECORD.subscribe(_ => readTest());


/** Переключение испытания */
export function switchTest(state: TestStates) {
  if ([TestStates.AMPXX, TestStates.COEFF].includes(state)) {
    switch (get(STATE)) {
      // если измерение не идёт -> запускаем
      case TestStates.IDLE: startTest(state); break;
      // если запущено - останавливаем
      case state: stopTest(); break;
    }
  }
}
/** Сохранение результатов измерений */
export async function saveTest() {
  if (get(STATE) === TestStates.IDLE) {
    // берем текущую запись без rawdata (с ней не сохраняется - no such column)
    const record = get(RECORD);
    delete record['rawdata'];
    // записываем измеренные значения
    Object.entries(NAMES_I_XX).forEach(entry => record[`f_${entry[0]}`] = get(AMPRS)[entry[1]]);
    Object.entries(NAMES_U_XX).forEach(entry => record[`f_${entry[0]}`] = get(VOLTS_XX)[entry[1]]);
    Object.entries(NAMES_U_HI).forEach(entry => record[`f_${entry[0]}`] = get(VOLTS_HI)[entry[1]]);
    Object.entries(NAMES_U_LO).forEach(entry => record[`f_${entry[0]}`] = get(VOLTS_LO)[entry[1]]);
    [record['f_coef_tab'], record['f_coef_real']] = get(COEFF);
    // пишем в БД
    await updateRecord(record);
  } else showMessage("Дождитесь окончания измерения.", NotifierKind.WARNING);
}
/** Чтение результатов измерений */
function readTest() {
  const record = get(RECORD);
  AMPRS.set(new PhasesPoint(...Object.keys(NAMES_I_XX).map(name => record[`f_${name}`])));
  VOLTS_HI.set(new PhasesPoint(...Object.keys(NAMES_U_HI).map(name => record[`f_${name}`])));
  VOLTS_LO.set(new PhasesPoint(...Object.keys(NAMES_U_LO).map(name => record[`f_${name}`])));
  COEFF.set([record['f_coef_tabl'], record['f_coef_real']]);
}

/** таймер измерения */
let timer: NodeJS.Timer;
/** Запуск цикла измерений */
async function startTest(state: TestStates) {
  const timing: ITiming = ({
    [TestStates.AMPXX]: get(SETTINGS).test.ampxx,
    [TestStates.COEFF]: get(SETTINGS).test.coeff
  }[state]);
  // установка времени измерения для обратного таймера
  TIME.set(timing.duration);
  if (!await switchState(state)) return;
  // запуск таймера
  timer = setInterval(
    async () => await measure(timing.pulling_rate),
    timing.pulling_rate
  );
}
/** Прекращение цикла измерений */
async function stopTest() {
  // удаление таймера
  clearInterval(timer); 
  // сброс времени и состояния
  TIME.set(0);
  await switchState(TestStates.IDLE);
}
async function switchState(state: TestStates) {
  let result = true;
  switch (state) {
    case TestStates.AMPXX:
      result &&= await switchDigital("i_xx", true);
      break;
    case TestStates.COEFF:
      result &&= await switchDigital("k_trans", true);
      break;
    default:
      result &&= await switchDigital("i_xx", false);
      result &&= await switchDigital("k_trans", false);
      break;
  }
  if (result) STATE.set(state);
  else showMessage("Не удалось переключить рэле.", NotifierKind.ERROR);

  return result;
}
/** Измерение токов и напряжений */
async function measure(rate: number) {
  const data: IAdamData = await readAll();
  const settings = get(SETTINGS).adam.analog;
  switch (get(STATE)) {
    case TestStates.AMPXX:
      fillPoint(AMPRS, settings, data, NAMES_I_XX);
      break;
    case TestStates.COEFF:
      fillPoint(VOLTS_HI, settings, data, NAMES_U_HI);
      fillPoint(VOLTS_LO, settings, data, NAMES_U_LO);
      break;
  }
  // обновление времени
  TIME.update(value => {
    value -= rate / 1000;
    if (value <= 0) { stopTest(); value = 0; }
    return value;
  });
}
/** Парсинг данных из Adam в точки */
function fillPoint(dest: Writable<PhasesPoint>, settings: any, data: IAdamData, names: any) {
  dest.update((point: PhasesPoint) => {
    Object.entries(names)
    .forEach((entry: [string, string]) => 
      point[entry[1]] = roundValue(getAnalogValue(data.analog, settings[entry[0]]), 3)
    );
    return point;
  })
}