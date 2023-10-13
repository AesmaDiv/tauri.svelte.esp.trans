/** Максимальнойе количество точек измерения давления диафрагм */
export const POINTS_MAX = 30;
/** Свойства для закладки испытания давления диафрагм*/
export const PressProps = {
  NAME: "Pressure",
  TRACKED_STATE: 'test_press',
}
/** Свойства полей формы измерения давления диафрагм */
export const DATANAMES = [
  { name: 'time', fixed: 0, label: 'Время испытания' },
  { name: 'press_sys',  fixed: 4, label: 'Давление в системе, кгс/м2' },
  { name: 'press_top',  fixed: 4, label: 'Давление верхней диафрагмы, кгс/м2' },
  { name: 'press_btm',  fixed: 4, label: 'Давление нижней диафрагмы, кгс/м2' }
];
/** Пределы допуска для измерения давления диафрагм */
export const LIMITS = {
  top: [0.5, 2],
  btm: [1,   3],
}
/** Параметры осей графика давления диафрагм по умолчанию */
export const AXIES = {
  time : { minimum: 0, maximum: 180, ticks: 6, },
  press_top  : { minimum: 0, maximum: 2.5, ticks: 5, },
  press_btm  : { minimum: 0, maximum: 3.5, ticks: 7, },
};