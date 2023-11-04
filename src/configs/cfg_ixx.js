/** Максимальнойе количество точек измерения давления диафрагм */
export const POINTS_MAX = 30;
/** Свойства полей формы измерения давления диафрагм */
export const DATANAMES_TRANS = [
  { name: 'time', fixed: 0, label: 'Время испытания' },
  { name: 'volts_hi_ab',  fixed: 4, label: 'ВВ напряжение AB, В' },
  { name: 'volts_hi_bc',  fixed: 4, label: 'ВВ напряжение BC, В' },
  { name: 'volts_hi_ca',  fixed: 4, label: 'ВВ напряжение CA, В' },
  { name: 'volts_lo_ab',  fixed: 4, label: 'ВH напряжение AB, В' },
  { name: 'volts_lo_bc',  fixed: 4, label: 'ВH напряжение BC, В' },
  { name: 'volts_lo_ca',  fixed: 4, label: 'ВH напряжение CA, В' },
];
export const DATANAMES_IXX = [
  { name: 'time', fixed: 0, label: 'Время испытания' },
  { name: 'amps_a',  fixed: 4, label: 'Ток A, А' },
  { name: 'amps_b',  fixed: 4, label: 'Ток B, А' },
  { name: 'amps_c',  fixed: 4, label: 'Ток C, А' },
];