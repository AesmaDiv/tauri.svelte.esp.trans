import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { get, writable, type Writable } from "svelte/store";

import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { type ITiming, TestStates, PhasesPoint, Phases, type ROhmData, PhasesConnection } from "../shared/types";
import { bytes2string, sleep } from "../shared/funcs";
import { TEST_STATE } from "../stores/testing";
import { RECORD, POINTS_ROHMS, SWITCHES, CONNECTION, updatePoints, updateRecord } from "../stores/database";
import { SETTINGS } from "../stores/settings";
import { deserializePoints } from "../database/db_funcs";
import { switchDigital, resetDigital } from "./equipment/adam";


const NAME = TestStates.ROHMS;
let current_phase  : Phases  = Phases.NONE;
let com_unlisten   : UnlistenFn = undefined;
let is_interrupted : boolean = true;


/** Текущее положение анцапф */
export let SWITCH: Writable<string> = writable("");
/** Текущее омическое сопротивление */
export let ROHM: Writable<PhasesPoint> = writable(new PhasesPoint());

RECORD?.subscribe(_ => SWITCH.set(""));

export function currentClear() {
  ROHM.set(new PhasesPoint());
}

export async function switchTest() {
  if (!get(SWITCH)) {
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

/** Расчёт значений омического сопротивления для звезды */
export function calcStar(rohms: PhasesPoint) : PhasesPoint {
    let [x, y, z] = [rohms.phase_a, rohms.phase_b, rohms.phase_c];
    /*
    a + b = x
    b + c = y
    c + a = z

    b = x - a
    c = y - x + a
    y - x + 2a = z
    */
    const phase_a = (rohms.phase_c - rohms.phase_b + rohms.phase_a) / 2;
    const phase_b = rohms.phase_a - phase_a;
    const phase_c = rohms.phase_c - phase_a;

    return new PhasesPoint(phase_a, phase_b, phase_c)
}
/** Расчёт значений омического сопротивления для треугольника */
export function calcTriangle(rohms: PhasesPoint) : PhasesPoint {
  let aux = (-rohms.phase_a + rohms.phase_b + rohms.phase_c);
  let phase_a = 0.5 * (4 * rohms.phase_b * rohms.phase_c / aux - aux);
  aux = ( rohms.phase_a - rohms.phase_b + rohms.phase_c);
  let phase_b = 0.5 * (4 * rohms.phase_c * rohms.phase_a / aux - aux);
  aux = ( rohms.phase_a + rohms.phase_b - rohms.phase_c);
  let phase_c = 0.5 * (4 * rohms.phase_a * rohms.phase_b / aux - aux);

  return new PhasesPoint(phase_a, phase_b, phase_c);
}
async function startTest() {
  com_unlisten = await listen('serial_incoming', onReceive);
  const com = get(SETTINGS).com['rohms'];
  const star = [PhasesConnection.STAR, PhasesConnection.TRIANGLE].includes(get(RECORD)['n_connection']);
  const params = { wnd: appWindow, ...com, doListen: true }
  if (await invoke("com_open", params)) {
    TEST_STATE.set(TestStates.ROHMS);
    showMessage("Испытание запущено", NotifierKind.NORMAL);
    is_interrupted = false;
    current_phase = star ? Phases.AB : Phases.A0;
    await resetDigital(2);
    await sleep(500);
    await switchDigital("charge", true);
    await sleep(7000);
    await measure();
    if (!is_interrupted) {
      await sleep(2000);
      current_phase = star ? Phases.BC : Phases.B0;
      await measure();
    }
    if (!is_interrupted) {
      await sleep(2000);
      current_phase = star ? Phases.CA : Phases.C0;
      await measure();
    }
    syncPoints();
    stopTest();
  } else showMessage("Не удалось подключиться к микрометру", NotifierKind.ERROR);
}

async function stopTest() {
  is_interrupted = true;
  com_unlisten();
  await invoke("com_close", {});
  await resetDigital(2);
  await sleep(500);
  await switchDigital("charge", false);
  await sleep(1000);
  TEST_STATE.set(TestStates.IDLE);
}

async function measure() {
  if (current_phase === Phases.NONE) return;
  console.log("Measure %s started", current_phase);
  const duration: number = get(SETTINGS).test.rohms.duration;
  !!duration && // если продолжительность замера не верная - измерение не начнется
  !is_interrupted && await switchDigital(current_phase, true);
  !is_interrupted && await sleep(2000);
  !is_interrupted && await switchDigital("start", true);
  !is_interrupted && await switchDigital("start", false)
  !is_interrupted && await sleep(duration * 1000);
  !is_interrupted && await switchDigital("start", true)
  !is_interrupted && await switchDigital("start", false)
  !is_interrupted && await sleep(1000);
  !is_interrupted && await switchDigital("print", true)
  !is_interrupted && await switchDigital("print", false)
  !is_interrupted && await sleep(2000);
  !is_interrupted && await switchDigital(current_phase, false)
  console.log("Measure %s complete", current_phase);
  current_phase = Phases.NONE;
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
    [Phases.A0]: 'phase_a',
    [Phases.B0]: 'phase_b',
    [Phases.C0]: 'phase_c',
  }[current_phase];
  ROHM.update(rohm => {
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
  console.log("POINTS_ROHMS %o", get(ROHM));
}

function syncPoints() {
  const is_star = get(RECORD)['n_connection'] === PhasesConnection.STAR;
  const cur_rohm = get(ROHM);
  const cur_switch = get(SWITCH);
  POINTS_ROHMS.update(rohms => {
    switch (get(CONNECTION)) {
      case PhasesConnection.STAR: rohms[cur_switch] = calcStar(cur_rohm); break;
      case PhasesConnection.TRIANGLE: rohms[cur_switch] = calcTriangle(cur_rohm); break;
      default: rohms[cur_switch] = cur_rohm;
    }
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
