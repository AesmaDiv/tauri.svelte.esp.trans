import { get } from "svelte/store";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { type Sensors, type ITiming, TestStates } from "../shared/types";
import { TEST_STATE, resetPoints, updateTime } from "../stores/testing";
import { SENSORS } from "../stores/equipment";
import { SETTINGS } from "../stores/settings";


const NAME = TestStates.ROHMS;
let timings    : ITiming;
let test_timer : NodeJS.Timer;
let test_time  : number = 0;
let test_tick  : number = 0;
let last_tick  : number = 0;

export function switchTest() {
  // изменить состояние испытания
  let state = false;
  TEST_STATE.update(prev => {
    // получить состояние испытания
    state = prev === TestStates.IDLE;
    // изменить состояние испытания
    return prev === NAME ? TestStates.IDLE : NAME;
  });
  // если это начало ->
  if (state) {
    resetPoints(NAME);
    // сброс счётчика и старт таймера
    timings = get(SETTINGS).test[NAME];
    test_time = 0;
    test_tick = 0;
    last_tick = 1000 * timings.duration / timings.pulling_rate;
    test_timer = setInterval(() => {
      !doTest() && switchTest();
    }, timings.pulling_rate);
  // если это окончание ->
  } else {
    // сброс и уничтожение таймера
    clearTimeout(test_timer);
    test_timer = undefined;
  }
}
function doTest() {
  let result = true;
  switch (true) {
    case (test_tick <= 20):
      console.log("Waiting...");
      break;
    // case (test_tick >= last_tick):
    //   // прекращение испытания
    //   result = false;
    //   break;
    case (test_tick <= (last_tick + 100)):
      updateTime(NAME);
      if (test_tick % (last_tick / timings.points_count) === 0) {
        result = addPoint();
        if (!result) showMessage("Испытание закончено", NotifierKind.SUCCESS);
      }
      break;
  }
  test_tick += 1;

  return result;
}

function addPoint() : boolean {
  let count = 0;
  const data : Sensors = get(SENSORS);
  // POINTS_ROHMS.update(points => {
  //   if (!points) points = [];
  //   points.push({
  //     time      : +test_time.toFixed(1),//+data.time.toFixed(1),
  //     press_top : +data.press_top.toFixed(4),
  //     press_btm : +data.press_btm.toFixed(4),
  //   });
  //   count = points.length;
  //   test_time += timings.pulling_rate / 1000;
  //   console.log(points);
  //   return points;
  // });
  return count < timings.points_count;
}