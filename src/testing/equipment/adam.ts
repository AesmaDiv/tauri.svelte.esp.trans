import { invoke } from "@tauri-apps/api";
import { get } from "svelte/store";
import { SETTINGS } from "../../stores/settings";
import { showMessage, NotifierKind } from "../../lib/Notifier/notifier";
import { sleep } from "../../shared/funcs";
import type { IAdamData, IAdamSourceParams, IAnalog } from "src/shared/types";


/** Переключение дискретного выхода на Adam */
export async function switchDigital(name: string, state: boolean, timeout: number = 100) : Promise<boolean> {
  await sleep(100);
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
  const result: boolean = await invoke('adam_write', { address, data, slottype });
  // вывод сообщения
  if (!result) showMessage(`Не удалось переключить фазу ${name}`, NotifierKind.ERROR);
  // задержка
  await sleep(100);
  await sleep(timeout);

  return result;
}
/** Переключение слота дискретных выходов */
export async function resetDigital(slot: number) : Promise<boolean> {
  console.log("Reseting slot", slot);
  const address = get(SETTINGS).adam.ip;
  const bytes = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x08,
    0x01, 0x0F, 0x00, slot * 0x10, 0x00, 0x0F,
    0x02, 0x00, 0x00
  ];
  // отправка команды
  const result: boolean = await invoke('adam_write_bytes', { address, bytes });
  // вывод сообщения
  if (!result) showMessage(`Не удалось сбросить слот ${slot}`, NotifierKind.ERROR);
  // задержка

  return result;
}
/** Чтение всех аналоговых и дискретных значений */
export async function readAll(): Promise<IAdamData> {
  console.log("Reading all data");
  const address = get(SETTINGS).adam.ip;
  const data: IAdamData = await invoke('adam_read', { address });

  return data;
}

export function getAnalogValue(analog: IAnalog, src: IAdamSourceParams): number {
  return (analog.slot[src.slot][src.channel] - src.offset) * src.coeff * src.v_range / src.d_range;
}