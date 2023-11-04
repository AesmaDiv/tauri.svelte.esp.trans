import { HipotModes } from "../shared/types";

/** Максимальнойе количество точек измерения потребляемой мощности */
export const POINTS_MAX = 6;
/** Свойства для закладки испытания потребляемой мощности*/
export const PowerProps = {
  NAME: "Power Consumption",
  TRACKED_STATE: 'hipot',
}
/** Свойства полей формы измерения потребляемой мощности */
export const DATANAMES = [
  {name: 'time',    fixed: 0, label: 'Время испытания'},
  {name: 'voltage', fixed: 3, label: 'Напряжение, кВ'},
  {name: 'current', fixed: 3, label: 'Ток утечки, мА'},
  {name: 'resist',  fixed: 3, label: 'Сопротивление, МОм'},
]
/** Параметры осей графика потребляемой мощности по умолчанию */
export const AXIES = {
  time:   { minimum: 0, maximum: 20, ticks: 4, },
  resist: { minimum: 0, maximum: 10000000, ticks: 6, },
}
