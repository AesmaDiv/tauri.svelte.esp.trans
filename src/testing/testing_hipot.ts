import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { appWindow } from "@tauri-apps/api/window";
import { get } from "svelte/store";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { type Sensors, type ITiming, TestStates } from "../shared/types";
import { bytes2string, string2bytes } from "../shared/funcs";
import { TEST_STATE, POINTS_HIPOT, resetPoints, updateTime } from "../stores/testing";
import { setMotorState, SENSORS } from "../stores/equipment";
import { SETTINGS } from "../stores/settings";


const NAME = TestStates.HIPOT;
let timings    : ITiming;
let test_timer : NodeJS.Timer;
let test_tick  : number = 0;
let last_tick  : number = 0;

export function switchTest() {
  let state = false;
  TEST_STATE.update(prev => {
    // получить состояние испытания
    state = prev === TestStates.IDLE;
    // изменить состояние испытания
    return prev === NAME ? TestStates.IDLE : NAME;
  });
  // если это начало ->
  console.log("HIPOT state", state);
  (async () => {
    let result = await runTest();
    console.log("HIPOT tests state is", result);
  })();
  // if (state) {
  //   resetPoints(NAME);
  //   // сброс счётчика и старт таймера
  //   timings = get(SETTINGS).test[NAME];
  //   test_tick = 0;
  //   last_tick = 1000 * timings.duration / timings.pulling_rate;
  //   test_timer = setInterval(() => {
  //     !doTest() && switchTest();
  //   }, timings.pulling_rate);
  // // если это окончание ->
  // } else {
  //   // сброс и уничтожение таймера
  //   clearTimeout(test_timer);
  //   test_timer = undefined;
  //   // остановка двигателя
  //   setMotorState(false);
  // }
}
async function runTest() {
  console.log("Running hipot");
  const unlisten = await listen('serial_incoming', onReceive);
  const params = { wnd: appWindow, name: "COM3", baudrate: 115200, doListen: false };
  if (await invoke("com_open", params)) {
    setTimeout(async () => await communicate(), 1000);
    return new Promise((resolve, reject) => {
      setTimeout(async() => {
        await stopTest();
        unlisten();
        resolve(true);
      }, 2000)
    });
  }
  return false;
}
async function stopTest() {
  console.log("Ending hipot");
  await invoke("com_close", {});
}
async function communicate() {
  console.log("Communicate");
  const bytes = string2bytes("#01\r");
  const respond = await invoke("com_request", { bytes })
  .then(result => bytes2string(result));
  console.log("Respond", respond);
}
/** Обработчик ответа от СОМ-порта */
function onReceive(event) {
  let bytes: number[] = event.payload['data'];
  if (bytes.length) {
    let respond = bytes2string(bytes).trimEnd();
    let value = parseFloat(respond);
    respond.includes("mOhm") && (value /= 1000);
    CURRENT_ROHM.update(rohm => {
      rohm[{
        0: "phase_a",
        1: "phase_b",
        2: "phase_c",
      }[phase_counter++]] = value;
      return rohm;
    });
    if (phase_counter === 3) phase_counter = 0;
  }
  console.log("DATA %o", get(CURRENT_ROHM));
}
// /** Выполнение тика испытания */
// function doTest() {
//   let result = true;
//   switch (true) {
//     case (test_tick === 1):
//       // запуск двигателя
//       setMotorState(true);
//       break;
//     case (test_tick > last_tick):
//       // прекращение испытания
//       result = false;
//       break;
//     case (test_tick <= last_tick):
//       updateTime(NAME);
//       if (test_tick % (last_tick / timings.points_count) === 0) {
//         result = addPoint();
//         if (!result) showMessage("Испытание закончено", NotifierKind.SUCCESS);
//         console.log("fix point", test_tick);
//       }
//       break;
//   }
//   test_tick += 1;

//   return result;
// }

// function addPoint() : boolean {
//   let count = 0;
//   const data : Sensors = get(SENSORS);
//   POINTS_HIPOT.update(points => {
//     if (!points) points = [];
//     points.push({
//       time   : +data.time.toFixed(1),
//       volts  : +data.power.toFixed(4),
//       amps : +data.temper.toFixed(4),
//     });
//     count = points.length;
//     return points;
//   });

//   return count <= timings.points_count;
// }