import { invoke } from "@tauri-apps/api/tauri";
import { type Writable, writable, get } from "svelte/store";
import { Sensors, SensorsBuffers, type IAdamData, VBuffer, type IAdamSource, DigitalStates, type ISettings } from "../shared/types";
import { SETTINGS } from "./settings";
import { RECORD } from "./database";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { string2bytes, bytes2string, sleep } from "../shared/funcs";


/** Состояние чтения с ADAM */
export let ADAM_READING: Writable<boolean> = writable(false);
/** Показания датчиков */
export let SENSORS: Writable<Sensors> = writable(new Sensors());
/** Дискретные состояния */
export let DSTATES: Writable<DigitalStates> = writable(new DigitalStates());

/** таймер опроса Adam */
let tmr_adam : NodeJS.Timer;
/** Переключение опроса Adam */
export function switchAdamReading() {
  const rate = get(SETTINGS).adam.rate;
  if (!tmr_adam) tmr_adam = setInterval(() => updateAdamData(), rate);
  else {
    clearInterval(tmr_adam);
    tmr_adam = undefined;
  }

  showMessage(
    !!tmr_adam ? "Опрос ADAM запущен" : "Опрос ADAM прекращён",
    !!tmr_adam ? NotifierKind.NORMAL : NotifierKind.WARNING,
  );
  ADAM_READING.set(!!tmr_adam);
}

/** Обновление данных с Adam */
function updateAdamData() {
  const settings = get(SETTINGS);
  invoke("adam_read", { address: settings.adam.ip })
  .then((adam_data : IAdamData) => {
    if (!adam_data.analog && !adam_data.digital) throw "Ошибка подключения к ADAM";
    updateDStates(adam_data, settings);
    updateSensors(adam_data, settings);
    
  })
  .catch(reason => showMessage(reason, NotifierKind.ERROR));
}

/** Обновление дискретных состояний */
function updateDStates(adam_data: IAdamData, settings: ISettings) {
  DSTATES.update(dstates => {
    Object.entries(settings.adam.digital)
    .forEach(
      ([key, item]) => dstates[key] = !!(adam_data.digital.slot[item.slot] &(2 ** item.channel << 8))
    );
    return dstates;
  });
}

/** Буфферы для усреднения значений с Adam */
const buffers = new SensorsBuffers(5);
/** Обновление показаний датчиков */
function updateSensors(adam_data: IAdamData, settings: ISettings) {
  for (const [key, item] of Object.entries(settings.adam.analog)) {
    buffers[key].add(
      (adam_data.analog.slot[item.slot][item.channel] - item.offset) *
      item.v_range / item.d_range *
      item.coeff
    )
  }
  // SENSORS.update(getAverage);
}

