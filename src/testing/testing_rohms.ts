import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { get, writable, type Writable } from "svelte/store";

import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { type ITiming, TestStates, ROhmPoint, Phases, type ROhmData, PhasesConnection } from "../shared/types";
import { bytes2string, sleep } from "../shared/funcs";
import { TEST_STATE } from "../stores/testing";
import { RECORD, updatePoints, updateRecord } from "../stores/database";
import { SETTINGS } from "../stores/settings";
import { deserializePoints } from "../database/db_funcs";


const NAME = TestStates.ROHMS;
let current_phase  : Phases  = Phases.NONE;
let com_unlisten   : UnlistenFn = undefined;
let is_interrupted : boolean = true;


export let SWITCHES: Writable<[number, number]> = writable([0,0]);
/** Текущее положение анцапф */
export let CURRENT_SWITCH: Writable<string> = writable("");
/** Текущее омическое сопротивление */
export let CURRENT_ROHM: Writable<ROhmPoint> = writable(new ROhmPoint());
export let POINTS_ROHMS: Writable<ROhmData> = writable({} as ROhmData);

RECORD.subscribe(record => {
  let rohms = deserializePoints(record[TestStates.ROHMS]);
  POINTS_ROHMS.set(rohms);
  let last_switch = Object.keys(rohms).sort().pop()
  if (last_switch) {
    let switches = last_switch.split("-").map(x => parseInt(x));
    SWITCHES.set(switches ? [switches[0], switches[1]] : [0,0]);
  }
  console.warn("Таблица омического сопротивления %o", rohms);
})

export function currentClear() {
  CURRENT_ROHM.set(new ROhmPoint());
}

export async function switchTest() {
  if (!get(CURRENT_SWITCH)) {
    showMessage("Не указаны положения анцапф", NotifierKind.ERROR);
    return;
  }

  // если это начало -> т.е. не запущено никакое испытание
  if (get(TEST_STATE) === TestStates.IDLE) {
    currentClear();
    await startTest();
  // если это окончание ->
  } else stopTest();
}

/** Расчёт значений омического сопротивления для каждой фазы из пар фаз */
export function recalculate(rohms: ROhmPoint) : ROhmPoint {
    let [x, y, z] = [rohms.phase_a, rohms.phase_b, rohms.phase_c];
    /*
    a + b = x
    b + c = y
    c + a = z

    b = x - a
    c = y - x + a
    y - x + 2a = z
    */
    const phase_a = (z - y + x) / 2;
    const phase_b = x - phase_a;
    const phase_c = z - phase_a;

    return {phase_a, phase_b, phase_c}
}

async function startTest() {
  com_unlisten = await listen('serial_incoming', onReceive);
  const com = get(SETTINGS).com['rohms'];
  const params = { wnd: appWindow, ...com, doListen: true }
  if (await invoke("com_open", params)) {
    TEST_STATE.set(TestStates.ROHMS);
    showMessage("Испытание запущено", NotifierKind.NORMAL);
    is_interrupted = false;
    current_phase = Phases.AB;
    await switchDigital("charge", true, 7000);
    await measure();
    if (!is_interrupted) {
      await sleep(2000);
      current_phase = Phases.BC;
      await measure();
    }
    if (!is_interrupted) {
      await sleep(2000);
      current_phase = Phases.CA;
      await measure();
    }
    syncPoints();
    stopTest();
  } else showMessage("Не удалось подключиться к микрометру", NotifierKind.ERROR);
}

async function stopTest() {
  is_interrupted = true;
  await invoke("com_close", {});
  await switchDigital("start",   false, 100);
  await switchDigital("print",   false, 100);
  await switchDigital("charge",  false, 100);
  await switchDigital("rohm_ab", false, 100);
  await switchDigital("rohm_bc", false, 100);
  await switchDigital("rohm_ca", false, 100);
  com_unlisten();
  showMessage("Испытание закончено", NotifierKind.SUCCESS);
  TEST_STATE.set(TestStates.IDLE);
}

async function measure() {
  if (current_phase === Phases.NONE) return;
  console.log("Measure %s started", current_phase);
  !is_interrupted && await switchDigital(current_phase,  true, 3000);
  !is_interrupted && await switchDigital("start",  true,   100);
  !is_interrupted && await switchDigital("start",  false,  7000);
  !is_interrupted && await switchDigital("start",  true,   100);
  !is_interrupted && await switchDigital("start",  false,  3000);
  !is_interrupted && await switchDigital("print",  true,   100);
  !is_interrupted && await switchDigital("print",  false,  1000);
  !is_interrupted && await switchDigital(current_phase,  false,  500);
  console.log("Measure %s complete", current_phase);
  current_phase = Phases.NONE;
}

async function switchDigital(name: string, state: boolean, timeout=undefined) {
  console.log("Switching channel", name, state);
  const settings = get(SETTINGS);
  const address = settings.adam.ip;
  const {slot, channel} = settings.adam.digital[name];
  const data = {
    slot,
    channel,
    value: state ? 0xff00 : 0x0000
  };
  const slottype = "digital";

  // отправка команды
  const result = await invoke('adam_write', { address, data, slottype });
  // вывод сообщения
  if (!result) showMessage(`Не переключить фазу ${name}`, NotifierKind.ERROR);
  // задержка
  timeout && await sleep(timeout);
}

function onReceive(event: any) {
  let bytes: number[] = event.payload['data'];
  console.log("Bytes received %o", bytes);

  if (current_phase === Phases.NONE) return;
  if (bytes.length === 0) return;

  let respond = bytes2string(bytes).trimEnd();
  console.log(respond);
  const phase = {
    [Phases.AB]: 'phase_a',
    [Phases.BC]: 'phase_b',
    [Phases.CA]: 'phase_c',
  }[current_phase];
  CURRENT_ROHM.update(rohm => {
    let value = parseFloat(respond);
    if (isNaN(value) && !rohm[phase]) {
      showMessage("Измерение прервано", NotifierKind.WARNING);
      console.log("Test interrupted on phase", current_phase);
      stopTest();
    } else {
      respond.includes("mOhm") && (value /= 1000);
      rohm[phase] = value;
      return rohm;
    }
  });
  console.log("DATA %o", get(CURRENT_ROHM));
}

function syncPoints() {
  const is_star = get(RECORD)['n_connection'] === PhasesConnection.STAR;
  const cur_rohm = get(CURRENT_ROHM);
  const cur_switch = get(CURRENT_SWITCH);
  POINTS_ROHMS.update(rohms => {
    rohms[cur_switch] = is_star ? recalculate(cur_rohm) : cur_rohm;
    return rohms;
  });
  console.log(is_star, cur_rohm, cur_switch, get(POINTS_ROHMS));
}

export function sortPoints(names: string[] = undefined) {
  POINTS_ROHMS.update(rohms => Object.keys(rohms)
    .filter(key => names ? names.includes(key) : true)
    .sort()
    .reduce((obj, key) => {
      obj[key] = rohms[key]; 
      return obj;
    },{})
  );
}

/** Сохранение таблицы омического сопротивления фаз */
export function savePoints() {
  let record = get(RECORD);
  record['switches'] = get(SWITCHES).join(';');
  updateRecord(record);
  updatePoints(TestStates.ROHMS, get(POINTS_ROHMS));
}
