/** Описание таблицы параметров испытаний */
export const TEST = {
  ROWS: [
    { name: "test.test_press", label: "Давление диафрагм"},
    { name: "test.test_power", label: "Потребляемая мощность"},
  ],
  COLUMNS: [
    { name: "duration",     label: "T, сек", parse_func: parseInt},
    { name: "pulling_rate", label: "Δt, мс", parse_func: parseInt},
    { name: "points_count", label: "N, тчк", parse_func: parseInt},
  ],
};
/** Описание таблицы параметров аналоговых слотов */
export const ANALOG = {
  ROWS: [
    { name: 'adam.analog.press_sys', label: 'Давление в системе' },
    { name: 'adam.analog.press_top', label: 'Давление верхней диаф' },
    { name: 'adam.analog.press_btm', label: 'Давление нижней диаф' },
    { name: 'adam.analog.torque',    label: 'Момент' },
    { name: 'adam.analog.temper',    label: 'Температура' },
    { name: 'adam.analog.speed',     label: 'Скорость' },
  ],
  COLUMNS: [
    { name: 'slot',    label: 'слот',    parse_func: parseInt },
    { name: 'channel', label: 'канал',   parse_func: parseInt },
    { name: 'd_range', label: 'цфр.диап', parse_func: parseInt },
    { name: 'offset',  label: 'цфр.смещ', parse_func: parseInt },
    { name: 'v_range', label: 'диап.знч', parse_func: parseFloat },
    { name: 'coeff',   label: 'коэф' , parse_func: parseFloat },
  ],
};
/** Описание таблицы параметров дискретный слотов */
export const DIGITAL = {
  ROWS: [
    { name: 'adam.digital.lamp',     label: 'Маяк' },
    { name: 'adam.digital.engine_r', label: 'Гл.привод - вправо' },
    { name: 'adam.digital.engine_l', label: 'Гл.привод - влево' },
    { name: 'adam.digital.thrust',   label: 'Клапан давления' },
    { name: 'adam.digital.valve',    label: 'Перепускной клапан' },
    { name: 'adam.digital.alarm',    label: 'Аварийный стоп' },
  ],
  COLUMNS: [
    { name: 'slot',    label: 'слот',   parse_func: parseInt},
    { name: 'channel', label: 'канал',  parse_func: parseInt},
  ],
};