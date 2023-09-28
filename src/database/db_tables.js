import { COMBOS } from "../configs/cfg_localization";


/** Поля поиска для фильтрации списка записей */
export const RECORD_SEARCH_COLUMNS = [
  { col: 1, row: 1, name: "datetest",                 label: "Дата испытания"},
  { col: 1, row: 2, name: "customer", required: true, label: "Заказчик"},
  { col: 1, row: 3, name: "ordernum", required: true, label: "Наряд-заказ" },
  { col: 1, row: 6, name: "serial",   required: true, label: "Заводской номер" },
]
/** Поля поиска для фильтрации списка записей */
export const TRANS_COLUMNS = [
  { col: 1, row: 5,  name: "name",   label: "Тип трансформатора" },
  { col: 2, row: 5,  name: "f_u_high", label: "Ном.напряжение Uвн"},
  { col: 2, row: 6,  name: "f_u_low",  label: "Ном.напряжение Uнн"},
  { col: 2, row: 7,  name: "f_i_high", label: "Ном.ток Iвн"},
  { col: 2, row: 8,  name: "f_i_low",  label: "Ном.ток Iнн"},
  { col: 3, row: 5,  name: "f_power",  label: "Мощность" },
  { col: 3, row: 6,  name: "f_eds",    label: "ЭДС, %"},
  { col: 3, row: 7,  name: "f_ixx",    label: "Ixx, %"},
  // { col: 4, row: 8,  name: "t_trans",  label: "Температура, трансф."},
  // { col: 1, row: 8,  name: "switches", label: "Кол-во позиций анцапф"},
]
/** Дополнительные поля со списками, для отображения в форме */
export const RECORD_COMBO_COLUMNS = [
  { col: 1, row: 8, name: "n_connection", label: "Соединение",     items: COMBOS[false].connection},
  { col: 3, row: 2, name: "oil_admix",  label: "Масло, примеси", items: COMBOS[false].presence},
]
/** Поля полной информации о записи, для отображения в форме */
export const RECORD_COLUMNS = [
  ...RECORD_SEARCH_COLUMNS,
  ...RECORD_COMBO_COLUMNS,
  ...TRANS_COLUMNS,
  // Если col = 0 -> элемент будет присутствовать на форме, но не будет отображаться (display: none)
  // Ecли row = 0 -> элемент будет пропущен и не помещен на форму
  { col: 0, row: 1,  name: "id",        label: "Номер записи"},
  { col: 2, row: 1,  name: "field",     label: "Месторождение" },
  { col: 2, row: 2,  name: "cluster",   label: "Куст" },
  { col: 2, row: 3,  name: "well",      label: "Скважина" },
  { col: 3, row: 1,  name: "oil_color", label: "Масло, цвет" },
  { col: 3, row: 3,  name: "oil_kvolt", label: "Масло, диэл.прочность" },


  // { col: 4, row: 9,  name: "t_air",  label: "Температура, окр.среды"},
  // { col: 0, row: 0,  name: "humidity",  label: "Давление диафрагм"},
  { col: 1, row: 9, name: "comments",  label: "Примечания"},
];
/** Структура словаря для комбобоксов */
export const DICT_COLUMNS = {
  id: "Номер",
  name: "Имя",
};
