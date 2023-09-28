import { get } from "svelte/store";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { type Sensors, type ITiming, TestStates } from "../shared/types";
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
  if (state) {
    resetPoints(NAME);
    // сброс счётчика и старт таймера
    timings = get(SETTINGS).test[NAME];
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
    // остановка двигателя
    setMotorState(false);
  }
}
/** Выполнение тика испытания */
function doTest() {
  let result = true;
  switch (true) {
    case (test_tick === 1):
      // запуск двигателя
      setMotorState(true);
      break;
    case (test_tick > last_tick):
      // прекращение испытания
      result = false;
      break;
    case (test_tick <= last_tick):
      updateTime(NAME);
      if (test_tick % (last_tick / timings.points_count) === 0) {
        result = addPoint();
        if (!result) showMessage("Испытание закончено", NotifierKind.SUCCESS);
        console.log("fix point", test_tick);
      }
      break;
  }
  test_tick += 1;

  return result;
}

function addPoint() : boolean {
  let count = 0;
  const data : Sensors = get(SENSORS);
  POINTS_HIPOT.update(points => {
    if (!points) points = [];
    points.push({
      time   : +data.time.toFixed(1),
      volts  : +data.power.toFixed(4),
      amps : +data.temper.toFixed(4),
    });
    count = points.length;
    return points;
  });

  return count <= timings.points_count;
}