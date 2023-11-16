/*
  [TODO:] !!!ВАЖНО:
  После изменения тут внести правки в описании
  интерфейса ISettings в файле shared\types.ts
*/

/** Описание таблицы параметров испытаний */
export const TEST = {
  ROWS: [
    { name: "test.hipot",   label: "Высоковольтное испытание"},
    { name: "test.rohms",   label: "Омическое сопротивление"},
    { name: "test.ampxx",   label: "Ток холостого хода"},
    { name: "test.coeff",   label: "Коэффициент трансформации"},
  ],
  COLUMNS: [
    { name: "duration",     label: "T, сек", parse_func: parseInt},
    { name: "pulling_rate", label: "Δt, мс", parse_func: parseInt},
    { name: "points_count", label: "N, тчк", parse_func: parseInt},
  ],
};
/** Коэфициенты значений Di30R */
export const DI30R = {
  ROWS: [
    { name: "di30r",        label: "Коэффициенты"},
  ],
  COLUMNS: [
    { name: "control",     label: "U упр", parse_func: parseFloat},
    { name: "voltage",     label: "U вых", parse_func: parseFloat},
    { name: "amps_hi",     label: "I выс", parse_func: parseFloat},
    { name: "amps_lo",     label: "I низ", parse_func: parseFloat},
  ],

}
/** Описание таблицы параметров аналоговых слотов */
export const ANALOG = {
  ROWS: [
    { name: 'adam.analog.i_xx_a', label: 'I хх A' },
    { name: 'adam.analog.i_xx_b', label: 'I хх B' },
    { name: 'adam.analog.i_xx_c', label: 'I хх C' },
    { name: 'adam.analog.u_hi_a', label: 'U ВВ A' },
    { name: 'adam.analog.u_hi_b', label: 'U ВВ B' },
    { name: 'adam.analog.u_hi_c', label: 'U ВВ C' },
    { name: 'adam.analog.u_lo_a', label: 'U НВ A' },
    { name: 'adam.analog.u_lo_b', label: 'U НВ B' },
    { name: 'adam.analog.u_lo_c', label: 'U НВ C' },
    { name: 'adam.analog.temper', label: 'Температура' },
    { name: 'adam.analog.humid',  label: 'Влажность' },
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