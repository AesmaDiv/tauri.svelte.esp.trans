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
    title_info:   "Информация о трансформаторе :",
    producer:     "Производитель :",
    serial:       "Заводской номер :",
    trans_type:   "Тип трансформатора :",
    nom_i_hi:     "Ном.ток ВВ, А :",
    nom_i_lo:     "Ном.ток НВ, А :",
    nom_u_hi:     "Ном.напряжение ВВ, В :",
    nom_u_lo:     "Ном.напряжение НВ, В :",
    power:        "Ном.мощность, кВт :",
    eds:          "ЭДС, % :",
    connect:      "Тип соединения :",
    temperature:  "Температура, °C :",
    humidity:     "Влажность, % :",
    title_test:   "Информация по испытанию :",
    datetest:     "Дата испытания :",
    daterecv:     "Дата поступления :",
    customer:     "Заказчик :",
    owner:        "Собственник :",
    ordernum:     "Наряд-заказ № :",
    field:        "Месторождение :",
    lease:        "Куст :",
    well:         "Скважина :",
    daysrun:      "Пробег, сут :",
    oil_level:    "Масло: уровень :",
    oil_color:    "Масло: цвет :",
    oil_kvolt:    "Масло: проводимость, кВ :",
    oil_admix:    "Масло: примеси :",
    title_result: "Результаты испытаний :",
    note:         "Гидрозащита обкатывалась в течении 15 минут, при частоте вращения вала 2910 об/мин.",
    comments:     "Примечания :",
    operator:     "Оператор :",
    foreman:      "Мастер :",

    sec:          "сек.",
    volt:         "В",
    ampr:         "А",
    watt:         "Вт",
  },
  true: {
    title:        "LLC «ESP Service»",
    town:         "Kogalym",
    title_info:   "Transformator information :",
    producer:     "Manufacturer :",
    serial:       "Factory number :",
    trans_type:   "Transformator type :",
    nom_i_hi:     "Nom.current HV, A :",
    nom_i_lo:     "Nom.current LV, A :",
    nom_u_hi:     "Nom.voltage HV, В :",
    nom_u_lo:     "Nom.voltage LV, В :",
    power:        "Nom.power, kW :",
    eds:          "EMF, % :",
    connect:      "Connection type :",
    temperature:  "Temperature, °C :",
    humidity:     "Humidity, % :",
    title_test:   "Testing information: :",
    datetest:     "Date tested :",
    daterecv:     "Date received :",
    customer:     "Customer :",
    owner:        "Owner :",
    ordernum:     "Order № :",
    field:        "Field :",
    lease:        "Multiwell pad :",
    well:         "Well :",
    daysrun:      "Daysrun :",
    oil_level:    "Oil: level :",
    oil_color:    "Oil: color :",
    oil_kvolt:    "Oil: dielectric conduct., kV :",
    oil_admix:    "Oil: admix :",
    title_result: "Testing results :",
    note:         "The hydroprotection was run in for 15 minutes, at a shaft speed of 2910 rpm.",
    comments:     "Note :",
    operator:     "Operator :",
    foreman:      "Foreman :",

    sec:          "sec.",
    volt:         "V",
    ampr:         "A",
    watt:         "W",
  }
}
export const HDR_ROHMS = {
  false: {
    rohm_header:  "Измерение омического сопротивления",
    rohm_switch:  "отпайки",
    rohm_a:       "фаза A, Ω",
    rohm_b:       "фаза В, Ω",
    rohm_c:       "фаза С, Ω",
    rohm_imbal:   "небаланс, %",
  },
  true: {
    rohm_header:  "Ohmic resistance measurement",
    rohm_switch:  "taps",
    rohm_a:       "phase A, Ω",
    rohm_b:       "phase В, Ω",
    rohm_c:       "phase С, Ω",
    rohm_imbal:   "imbalance, %",
  }
}
export const HDR_HIPOT = {
  false: {
    hipot_chart:    ["График измерения сопротивления изоляции",],
    hipot_header:   "Измерение сопротивления изоляции",
    hipot_volt:     "U, В",
    hipot_amps:     "I, µА",
    hipot_ohms:     "R, МΩ",
    hipot_time:     "Время",
    hipot_h0:       "ВН-0",
    hipot_l0:       "НН-0",
    hipot_hl:       "ВН-НВ",
    hipot_polarize: "Индекс поляризации",
  },
  true: {
    hipot_chart:    ["Hipot chart",],
    hipot_header:   "Insulation resistance measurement",
    hipot_volt:     "U, V",
    hipot_amps:     "I, µA",
    hipot_ohms:     "R, MΩ",
    hipot_time:     "Time",
    hipot_h0:       "HV-0",
    hipot_hl:       "HV-LV",
    hipot_l0:       "LV-0",
    hipot_polarize: "Polarization index",
  }
}
export const HDR_XX = {
  false: {
    xx_title:   "Измерение параметров холостого хода",
    xx_u:       ["U хх AB, В", "U хх BC, В", "U хх CA, В", "U сред.ХХ, В"],
    xx_i:       ["I хх A, А", "I хх B, А", "I хх C, А", "I сред.ХХ, А"],
    xx_u_hi:    ["U AB, В", "U BC, В", "U CA, В", "U cред.ВН, В"],
    xx_u_lo:    ["U ab, В", "U bc, В", "U ca, В", "U cред.НН, В"],
    coef_title: "Измерение коэффициента трансформации",
    coef_tabl:  "Коэф.трансформации (табличный)",
    coef_real:  "Коэф.трансформации (измеренный",
  },
  true: {
    xx_title:   "Measuring idle parameters",
    xx_u:       ["U AB idle, V", "U BC idle, V", "U CA idle, V", "U avr.idle, V"],
    xx_i:       ["I A idle, А", "I B idle, А", "I C idle, А", "I avr.idle, A"],
    xx_u_hi:    ["U AB, В", "U BC, В", "U CA, В", "U avr.HV, V"],
    xx_u_lo:    ["U ab, В", "U bc, В", "U ca, В", "U avr.LV, V"],
    coef_title: "Transformation ratio measurement",
    coef_tabl:  "Transformation ratio (table)",
    coef_real:  "Transformation ratio (measured)"
  }
}
export const HDR_RESULT = {
  false: {
    res_tab:      ["знач.", "допуск", "итог"],
    res_hipot_h0: "R изоляции ВН-0, MΩ",
    res_hipot_l0: "R изоляции НН-0, MΩ",
    res_hipot_hl: "R изоляции ВН-НН, MΩ",
    res_polarize: "Индекс поляризации",
    res_absorp:   "Коэффициент абсорбции",
    res_rohms:    "Дисбаланс сопротивления жил, %",
    res_idle:     "Дисбаланс токов ХХ, %",
    res_power:    "Потери мощности, Вт",
    res_coef:     "Отклонение коэф.трансформации, %",
    res_verdict : "По результатам испытаний оборудование признано",
    res_passed  : ["не в допуске", "в допуске"],
    res_valid   : ["НЕ ГОДНЫМ", "ГОДНЫМ"],
  },
  true: {
    res_tab:      ["value", "limit", "state"],
    res_hipot_h0: "R insulation HV-0, MΩ",
    res_hipot_l0: "R insulation LV-0, MΩ",
    res_hipot_hl: "R insulation HV-LV, MΩ",
    res_polarize: "Polarization index",
    res_absorp:   "Absorption coefficient",
    res_rohms:    "Ohmic resistance imbalance, %",
    res_idle:     "Idle currents imbalance, %",
    res_power:    "Power consumption, W",
    res_coef:     "Transformation ration deviation, %",
    res_verdict : "According to the test results, the equipment was found",
    res_passed  : ["failed", "passed"],
    res_valid   : ["NOT VALID", "VALID"],
  }
}
export const COMBOS = {
  false: {
    presence: [
      { id: 1, name: 'Нет' },
      { id: 2, name: 'Есть'}
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