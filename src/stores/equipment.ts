import { invoke } from "@tauri-apps/api/tauri";
import { type Writable, writable, get } from "svelte/store";
import { Sensors, SensorsBuffers, type IAdamData, DigitalStates, type ISettings } from "../shared/types";
import { SETTINGS } from "./settings";
import { RECORD } from "./database";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";


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
  if (!tmr_adam) tmr_adam = setInterval(async() => await updateAdamData(), 5000);
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
async function updateAdamData() {
  const settings = get(SETTINGS);
  const adam_data : IAdamData = await invoke("adam_read", { address: settings.adam.ip })
  console.log(adam_data)
  if (!adam_data.analog && !adam_data.digital) showMessage("Ошибка подключения к ADAM", NotifierKind.ERROR);
  else {
    updateDStates(adam_data, settings);
    // updateSensors(adam_data, settings);
  }
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

