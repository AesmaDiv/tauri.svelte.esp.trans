import { invoke } from '@tauri-apps/api/tauri';
import { SETTINGS, readSettings } from '../stores/settings';
import { get } from 'svelte/store';


export const DBHelper = {
  /** Запрос в бэкэнду - чтение списка записей */
  readRecordList: async function(db_path, condition) {
    let result = [];
    const object = await invoke('read_testlist', {dbPath: db_path, condition: condition});
    if (Array.isArray(object)) result.push(...object);

    return result;
  },
  /** Запрос в бэкэнду - чтение таблицы типоразмеров */
  readSealTypes: async function(db_path) {
    let result = [];
    const object = await invoke('read_types', {dbPath: db_path, table: "SealTypes"});
    if (Array.isArray(object)) result.push(...object);

    return result;
  },
  /** Запрос в бэкэнду - чтение таблицы типа [ID, Name] */
  readDictionary: async function(db_path, table) {
    let result = [];
    const object = await invoke('read_dictionary', {dbPath: db_path, table: table});
    if (Array.isArray(object)) result.push(...object);

    return result;
  },
  /** Запрос в бэкэнду - чтение записи */
  readRecord: async function(db_path, rec_id) {
    const object = await invoke('read_record', {dbPath: db_path, recId: rec_id});

    return object.length ? object[0] : {};
  },
  /** Запрос в бэкэнду - обновление записи */
  updateRecord: async function(db_path, record) {
    const result = await invoke('write_record', {dbPath: db_path, record: record});

    return result;
  },
  /** Запрос в бэкэнду - удаление записи */
  deleteRecord: async function(db_path, record) {
    const result = await invoke('delete_dictionary', {dbPath: db_path, table: "Records", dict: record});

    return result ? record.id : 0;
  },
}