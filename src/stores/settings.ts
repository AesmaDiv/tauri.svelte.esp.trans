import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { type Writable, writable, get } from "svelte/store";
import { assign } from "../shared/funcs";
import type { ISettings } from "../shared/types";
import { to_number } from "svelte/internal";


/** Путь к файлу настроек TODO: поменять */
const SETTINGS_PATH : string = "D:\\Projects\\Tauri\\tauri.svelte.esp.seal\\resources\\settings.json";
/** Настройки программы */
export let SETTINGS : Writable<ISettings> = writable({} as ISettings);


/** Чтение настроек программы */
export async function readSettings() {
  readTextFile(SETTINGS_PATH)
  .then(text => {
    const settings = JSON.parse(text);
    SETTINGS.set(settings);
    console.log("Файл конфигурации загружен. %o", get(SETTINGS));
  })
  .catch(reason => console.error("Ошибка чтения файла конфигурации: %o", reason));
}
/** Сохранение настроек программы */
export async function saveSettings(form: FormData, refresh: boolean = false) {
  let settings = {};
  form.forEach((v, k) => {
    const value = ["adam.ip", "db.path"].includes(k) ? v.toString() : to_number(v);
    assign(settings, k.split("."), value)
  });
  writeTextFile(SETTINGS_PATH, JSON.stringify(settings, null, 2))
  .then(() => {
    console.log("Файл конфигурации сохранён.");
    if (refresh) readSettings();
  })
  .catch(reason => console.error("Ошибка записи файла конфигурации: %o", reason));
}