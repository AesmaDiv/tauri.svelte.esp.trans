import { get, writable, type Writable } from "svelte/store";
import { DBHelper} from "../database/DatabaseHelper";
import { deserializePoints, getTestData, serializePoints } from "../database/db_funcs";
import type { Limits } from "../lib/Chart/chart";
import { getCurrentDate } from "../shared/funcs";
import { TestStates, type TestData, type ROhmData, type HipotData } from "../shared/types";
import { SETTINGS } from "./settings";
import { NotifierKind, showMessage } from "../lib/Notifier/notifier";


export let TESTLIST: Writable<any[]> = writable([]);
export let RECORD: Writable<{}> = writable({});
/** Результат измерения омического сопротивления из БД */
export let POINTS_ROHMS: Writable<ROhmData> = writable({});
/** Результат высоковольтного испытания из БД */
export let POINTS_HIPOT: Writable<HipotData> = writable({});
export let TESTDATA: Writable<TestData> = writable(undefined);
export let LIMITS_PRESS: Writable<Limits[]> = writable([]);


let db_path = "";
SETTINGS.subscribe(async (settings) => {
  // при изменении настроек ->
  // перечитать типы и список тестов
  console.log(settings);
  if (db_path = settings.db?.path) {
    await readTestList({select_first: true});
  }
});

/** Чтение списка тестов */
export async function readTestList({condition="ID > 0", select_first=false}={}) {
  let testlist: any[] = await DBHelper.readRecordList(db_path, `${condition} Order By ID Desc Limit 100`);
  TESTLIST.set(testlist);
  console.warn('СПИСОК ТЕСТОВ обновлён');

  // если указан выбор первого в списке и список не пуст ->
  // загрузить первую запись
  if (select_first && testlist.length) readRecord(testlist[0].id);
}

/** Чтение записи из БД */
export async function readRecord(id: number) {
  // собственно..
  let record = await DBHelper.readRecord(db_path, id);
  RECORD.set(record);
  console.warn('ЗАПИСЬ загружена\n%o', record);
  
  // получение точек испытаний
  let points = getTestData(record);
  TESTDATA.set(points);
  POINTS_ROHMS.set(deserializePoints(record[TestStates.ROHMS]));
  console.warn('ТОЧКИ ИСПЫТАНИЙ загружены\n%o', points);
}
/** Запись данных о точках в БД */
export async function updatePoints(test_state: TestStates, points_data: ROhmData | HipotData) {
  if (!points_data) { console.warn('Отсутствуют данные для записи'); return; }
  let id : number;
  if (id = get(RECORD)['id']) {
    let record = { id, [test_state]: serializePoints(points_data), datetest: getCurrentDate() };
    await DBHelper.updateRecord(db_path, record);
    showMessage(`Точки для записи ${id} успешно сохранены`, NotifierKind.SUCCESS)
    await readRecord(id);
  } else { console.warn('Отсутствует ID записи') }
}
/** Запись данный об объекте в БД */
export async function updateRecord(record: Object) {
  // обновление даты на текущую
  if (!record['datetest']) record['datetest'] = getCurrentDate();
  // если номер наряд-заказа изменен ->
  // удалить ID записи, для того чтобы добавилась новая
  if (get(RECORD)['ordernum'] !== record['ordernum']) record['id'] = undefined;
  let id = await DBHelper.updateRecord(db_path, record);
  showMessage(`Запись ${id} успешно сохранена`, NotifierKind.SUCCESS)
  console.log('Информации об объекте сохранена\n%o', record);
  // перечитать список и запись
  await readTestList();
  await readRecord(id);
}
/** Полная очистка данных о записи */
export function resetRecord() {
  RECORD.set({});
};
/** Обновление пределов давления диафрагм */
function updateLimitsPress(sealtype) {
  if (!sealtype) return;
  let press_top = sealtype['limit_top']?.split(";").map(parseFloat);
  let press_btm = sealtype['limit_btm']?.split(";").map(parseFloat);
  let limit_top = press_top && { lo: press_top[0], hi: press_top[1] }
  let limit_btm = press_btm && { lo: press_btm[0], hi: press_btm[1] }
  LIMITS_PRESS.set([limit_top, limit_btm]);
}

