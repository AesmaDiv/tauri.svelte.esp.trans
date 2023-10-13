/*
  !!!ВАЖНО:
  После изменения тут внести правки в описании
  интерфейса ISettings в файле shared\types.ts
*/

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
    { name: 'slot',    label: 'слот',     parse_func: parseInt },
    { name: 'channel', label: 'канал',    parse_func: parseInt },
    { name: 'd_range', label: 'цфр.диап', parse_func: parseInt },
    { name: 'offset',  label: 'цфр.смещ', parse_func: parseInt },
    { name: 'v_range', label: 'диап.знч', parse_func: parseFloat },
    { name: 'coeff',   label: 'коэф' ,    parse_func: parseFloat },
  ],
};
/** Описание таблицы параметров дискретный слотов */
export const DIGITAL = {
  ROWS: [
    { name: 'adam.digital.rohm_ab', label: 'ROhm AB' },
    { name: 'adam.digital.rohm_bc', label: 'ROhm BC' },
    { name: 'adam.digital.rohm_ca', label: 'ROhm CA' },
    { name: 'adam.digital.rohm_a0', label: 'ROhm A0' },
    { name: 'adam.digital.rohm_b0', label: 'ROhm B0' },
    { name: 'adam.digital.rohm_c0', label: 'ROhm C0' },
    { name: 'adam.digital.print',   label: 'PRINT' },
    { name: 'adam.digital.start',   label: 'START' },

    { name: 'adam.digital.charge',  label: 'Charge' },
    { name: 'adam.digital.k_trans', label: 'K trans' },
    { name: 'adam.digital.i_xx',    label: 'I xx' },
    { name: 'adam.digital.lamp',    label: 'Lamp' },
    { name: 'adam.digital.alarm',   label: 'Alarm' },
    
    { name: 'adam.digital.k4',      label: 'K4' },
    { name: 'adam.digital.k5',      label: 'K5' },
    { name: 'adam.digital.k6',      label: 'K6' },
    { name: 'adam.digital.k7',      label: 'K7' },
  ],
  COLUMNS: [
    { name: 'slot',    label: 'слот',   parse_func: parseInt},
    { name: 'channel', label: 'канал',  parse_func: parseInt},
  ],
};