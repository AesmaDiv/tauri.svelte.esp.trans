/** транслитерировать текст */
export function transliterate(text) {
  if (!text) return '';
  const rusLowercase = ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'];
  const rusUppercase = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
  const engLowercase = ['a', 'b', 'v', 'g', 'd', 'e', 'yo', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'kh', 'ts', 'ch', 'sh', 'shch', "'", 'y', '"', 'e', 'yu', 'ya'];
  const engUppercase = ['A', 'B', 'V', 'G', 'D', 'E', 'Yo', 'Zh', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'Kh', 'Ts', 'Ch', 'Sh', 'Shch', "'", 'Y', '"', 'E', 'Yu', 'Ya'];

  let index = 1;
  let result = text.split('').map(ch => {
    if (index = ~rusLowercase.indexOf(ch)) return engLowercase[-index - 1];
    if (index = ~rusUppercase.indexOf(ch)) return engUppercase[-index - 1];
    return ch;
  })

  return result;
}

export const HDR_PROTOCOL = {
  false: {
    title:        "ООО «ЭПУ СЕРВИС»",
    town:         "г.Когалым",
    title_info:   "Информация по трансформатору :",
    producer:     "Производитель :",
    trans_type:   "Тип трансформатора :",
    serial:       "Заводской номер :",
    nom_i_hi:     "Ном.ток ВВ, А:",
    nom_i_lo:     "Ном.ток НВ, А:",
    nom_u_hi:     "Ном.напряжение ВВ, В:",
    nom_u_lo:     "Ном.напряжение НВ, В:",
    power:        "Мощность, кВт:",
    eds:          "ЭДС, %:",
    connect:      "Тип соединения :",
    title_test:   "Информация по испытанию :",
    datetest:     "Дата испытания :",
    daterecv:     "Дата поступления :",
    customer:     "Заказчик :",
    ordernum:     "Наряд-заказ № :",
    field:        "Месторождение :",
    lease:        "Куст :",
    well:         "Скважина :",
    daysrun:      "Пробег, сут :",
    oil_level:    "Масло: уровень :",
    oil_color:    "Масло: цвет :",
    oil_kvolt:    "Масло: проводимость :",
    oil_admix:    "Масло: примеси :",
    title_result: "Результаты испытаний :",
    note:         "Гидрозащита обкатывалась в течении 15 минут, при частоте вращения вала 2910 об/мин.",
    comments:     "Примечания :",
    operator:     "Испытатель :",
    foreman:      "Мастер :",



    mms:          "мм",
    kgf:          "кгс/см²",
  },
  true: {
    title:        "LLC «ESP Service»",
    town:         "Kogalym",
    title_info:   "Seal section information :",
    producer:     "Manufacturer :",
    sealtype:     "Seal type :",
    serial:       "Factory number :",
    lmt_pwr:      "Power limit :",
    lmt_tmp:      "Temperature limit :",
    lmt_thr:      "Thrust limit :",
    connect:      "Connection type :",
    rotation:     "Rotation :",
    exten_top:    "Extention top :",
    exten_btm:    "Extension bottom :",
    shaft_yeild:  "Shaft yeild :",
    shaft_diam:   "Shaft diameter :",
    runout_rad:   "Radial runout :",
    runout_end:   "End runout :",
    axial_play:   "Axial play :",
    momentum:     "Crank moment :",
    title_test:   "Testing information: :",
    datetest:     "Date tested :",
    daterecv:     "Date received :",
    customer:     "Customer :",
    ordernum:     "Order № :",
    field:        "Field :",
    lease:        "Multiwell pad :",
    well:         "Well :",
    daysrun:      "Daysrun :",
    head:         "Head state :",
    base:         "Base state :",
    coupling:     "Coupling :",
    pressure:     "Crimping pressure, atm :",
    oil_color:    "Oil color :",
    oil_water:    "Water in oil :",
    oil_shavs:    "Shavings in oil :",
    oil_kvolt:    "Dielectric conductivity :",
    title_result: "Testing results :",
    note:         "The hydroprotection was run in for 15 minutes, at a shaft speed of 2910 rpm.",
    comments:     "Note: :",
    operator:     "Operator :",
    foreman:      "Foreman :",

  

    mms:          "mm",
    kgf:          "kgf/sm²",
  }
}
export const HDR_ROHMS = {
  false: {
    tab_rohm_header: "Измерение омического сопротивления",
    tab_switch: "отпайки",
    tab_rohm_a: "фаза A, Ω",
    tab_rohm_b: "фаза В, Ω",
    tab_rohm_c: "фаза С, Ω",
    tab_disbal: "небаланс, %",
  },
  true: {
    tab_rohm_header: "Ohmic resistance measurement",
    tab_switch: "taps",
    tab_rohm_a: "phase A, Ω",
    tab_rohm_b: "phase В, Ω",
    tab_rohm_c: "phase С, Ω",
    tab_disbal: "disbalance, %",
  }
}
export const HDR_HIPOT = {
  false: {
    tab_hipot_header: "Измерение сопротивления изоляции",
    tab_rohms_header: "Измерение омического сопротивления",
    tab_volt:  "U, В",
    tab_amps:  "I, мА",
    tab_ohms:  "R, МΩ",
    tab_time:  "Время",
    h0: 'ВН-0',
    l0: 'НН-0',
    hl: 'ВН-НВ',
    polarize: 'Индекс поляризации',
    absorb:   'Коэффициент абсорбции',
  },
  true: {
    tab_hipot_header: "Insulation resistance measurement",
    tab_rohm_header: "Ohmic resistance measurement",
    tab_volt:  "U, V",
    tab_amps:  "I, mA",
    tab_ohms:  "R, MΩ",
    tab_time:  "Time",
    h0: 'HV-0',
    hl: 'HV-LV',
    l0: 'LV-0',
  }
}
export const HDR_IXX = {
  false: {
    tab_u_xx:      ['U хх AB, В', 'U хх BC, В', 'U хх CA, В', 'U сред.ХХ, А'],
    tab_i_xx:      ['I хх A, А', 'I хх B, А', 'I хх C, А', 'I сред.ХХ, А', 'Дисбаланс токов, %','Потери, Вт'],
    tab_u_hi:      ['U AB, В', 'U BC, В', 'U CA, В', 'U cред.ВН, В'],
    tab_u_lo:      ['U ab, В', 'U bc, В', 'U ca, В', 'U cред.НН, В'],
    tab_coef_tabl: 'Коэф.трансформации (табличный)',
    tab_coef_real: 'Коэф.трансформации (измеренный)'
  },
  true: {
    tab_u_xx:      ['U idle AB, V', 'U idle BC, V', 'U idle CA, V', 'U idle avr., V'],
    tab_i_xx:      ['I idle a, А', 'I idle b, А', 'I idle c, А', 'I idle avr., A'],
    tab_i_xx_avr:  'Average, А',
    tab_i_xx_bal:  'Current imbalance, %',
    tab_i_xx_pow:  'Losses, W',
    tab_u_hi:      ['U AB, В', 'U BC, В', 'U CA, В', 'U avr.HV, V'],
    tab_u_lo:      ['U ab, В', 'U bc, В', 'U ca, В', 'U avr.LV, V'],
    tab_coef_tabl: 'Transformation ratio (table)',
    tab_coef_real: 'Transformation ratio (measured)'
  }
}
export const HDR_CHARTS = {
  false: {
    hipot: ['График измерения сопротивления изоляции',],
  },
  true: {
    hipot: ['Hipot chart',]
  }
}
export const COMBOS = {
  false: {
    presence: [
      { id: 'NO', name: 'Нет' },
      { id: 'YES', name: 'Есть'}
    ],
    state: [
      { id: 1, name: 'Новое' },
      { id: 2, name: 'Ремонтное' }
    ],
    connection: [
      { id: 1, name: 'Звезда' },
      { id: 2, name: 'Звезда + Нейтраль' },
      { id: 3, name: 'Треугольник' },
    ],
  },
  true: {
    presence: [
      { id: 1, name: 'None' },
      { id: 2, name: 'Present'}
    ],
    state: [
      { id: 1, name: 'New' },
      { id: 2, name: 'Repair' }
    ],
    connection: [
      { id: 1, name: 'Star' },
      { id: 2, name: 'Star + Neutral' },
      { id: 3, name: 'Triangle' },
    ],
  },
}
export const HDR_RESULT = {
  false: {
    hipot_h0: "R изоляции ВН-0",
    hipot_l0: "R изоляции НН-0",
    hipot_hl: "R изоляции ВН-НН",
    polarize: "Индекс поляризации",
    absorb:   "Коэффициент абсорбции",
    rohms:    "Дисбаланс ом.сопротивления",
    i_xx:     "Дисбаланс токов ХХ",
    coef:     "Отклонение коэф.трансформации",
    verdict : "По результатам испытаний оборудование признано",
    passed  : ["в допуске", "не в допуске"],
    valid   : ["НЕ ГОДНЫМ", "ГОДНЫМ"],
  },
  true: {
    hipot_h0: "R insulation HV-0",
    hipot_l0: "R insulation LV-0",
    hipot_hl: "R insulation HV-LV",
    polarize: "Polarization index",
    absorb:   "Absorbtion coefficient",
    rohms:    "Ohmic resistance imbalance",
    i_xx:     "Idle currents imbalance",
    coef:     "Ttransformation ration deviation",
    verdict : "According to the test results, the equipment was found",
    passed  : ["passed", "failed"],
    valid   : ["NOT VALID", "VALID"],
  }
}
