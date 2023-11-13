import { COMBOS } from "../configs/cfg_localization";


/** Поля поиска для фильтрации списка записей */
export const RECORD_SEARCH_COLUMNS = [
  { col: 1, row: 1, name: "datetest",                  label: "Дата испытания"},
  { col: 2, row: 1, name: "customer", required: true,  label: "Заказчик"},
  { col: 3, row: 1, name: "owner",    required: false, label: "Собственник"},
  { col: 4, row: 1, name: "ordernum", required: true,  label: "Наряд-заказ" },
  { col: 2, row: 4, name: "serial",   required: true,  label: "Заводской номер" },
]
/** Поля поиска для фильтрации списка записей */
export const TRANS_COLUMNS = [
  { col: 1, row: 4, name: "name",         label: "Тип трансформатора" },
  { col: 1, row: 5, name: "f_nom_u_hi",   label: "Ном.напряжение UНВ, В"},
  { col: 2, row: 5, name: "f_nom_u_lo",   label: "Ном.напряжение Uнн, В"},
  { col: 3, row: 5, name: "f_power",      label: "Мощность, кВт" },
  { col: 1, row: 6, name: "f_nom_i_hi",   label: "Ном.ток IНВ, А"},
  { col: 2, row: 6, name: "f_nom_i_lo",   label: "Ном.ток Iнн, А"},
  { col: 3, row: 6, name: "f_eds",        label: "ЭДС, %"},
  { col: 3, row: 4, name: "f_coef_tabl",  label: "Коэф.трансформации"},
  { col: 4, row: 5, name: "f_t_trans",    label: "Температура, °C"},
  { col: 4, row: 6, name: "f_humidity",   label: "Влажность, %"},
  // { col: 3, row: 3,  name: "f_ixx",    label: "Ixx, %"},
  // { col: 4, row: 8,  name: "t_trans",  label: "Температура, трансф."},
  // { col: 1, row: 8,  name: "switches", label: "Кол-во отпаек"},
]
/** Дополнительные поля со списками, для отображения в форме */
export const RECORD_COMBO_COLUMNS = [
  { col: 4, row: 4, name: "n_connection", label: "Соединение",     items: COMBOS[false].connection},
  { col: 4, row: 8, name: "n_oil_admix",  label: "Масло, примеси", items: COMBOS[false].presence},
]
/** Поля полной информации о записи, для отображения в форме */
export const RECORD_COLUMNS = [
  ...RECORD_SEARCH_COLUMNS,
  ...RECORD_COMBO_COLUMNS,
  ...TRANS_COLUMNS,
  // Если col = 0 -> элемент будет присутствовать на форме, но не будет отображаться (display: none)
  // Ecли row = 0 -> элемент будет пропущен и не помещен на форму
  { col: 0, row: 1,  name: "id",        label: "Номер записи"},
  { col: 1, row: 2,  name: "field",     label: "Месторождение" },
  { col: 2, row: 2,  name: "cluster",   label: "Куст" },
  { col: 3, row: 2,  name: "well",      label: "Скважина" },
  { col: 1, row: 8,  name: "oil_level", label: "Масло, уровень" },
  { col: 2, row: 8,  name: "oil_color", label: "Масло, цвет" },
  { col: 3, row: 8,  name: "oil_kvolt", label: "Масло, диэл.прочность" },


  // { col: 4, row: 9,  name: "t_air",  label: "Температура, окр.среды"},
  // { col: 0, row: 0,  name: "humidity",  label: "Давление диафрагм"},
  { col: 1, row: 9, name: "comments",  label: "Примечания"},
];
/** Структура словаря для комбобоксов */
export const DICT_COLUMNS = {
  id: "Номер",
  name: "Имя",
};
