import { get, writable, type Writable } from "svelte/store";
import { HipotModes, Point } from "../shared/types";
import { getAverage, getDiviationFromAverage, getDiviationFromMax, compare, getDiviationFromFirst } from "../shared/funcs";
import { POINTS_HIPOT, POINTS_ROHMS, RECORD } from "./database";


export class Validity {
  value = 0;
  condition = "=";
  limit = 1;
  state = false;
}
export class Results {
  // омическое
  rohms = [];
  // ток ХХ
  u_xx = [0,0,0];
  i_xx = [0,0,0];
  u_xx_avr = 0;
  i_xx_avr = 0;
  i_xx_bal = 0;
  i_xx_pow = 0;
  // коэф.трансформации
  u_hi = [0,0,0];
  u_lo = [0,0,0];
  u_hi_avr =  0;
  u_lo_avr =  0;
  coef_tabl =  1;
  coef_real =  1;
  // результирующая строка
  verdict = 0;
}
export class Validities {
  hipot_h0:  Validity = { value: 0, condition: "≥", limit:  10, state: true };
  hipot_l0:  Validity = { value: 0, condition: "≥", limit:   5, state: true };
  hipot_hl:  Validity = { value: 0, condition: "≥", limit: 100, state: true };
  absorp:    Validity = { value: 0, condition: "≥", limit: 1.3, state: true };
  absorp_h0: Validity = { value: 0, condition: "≥", limit: 1.3, state: true };
  absorp_l0: Validity = { value: 0, condition: "≥", limit: 1.3, state: true };
  absorp_hl: Validity = { value: 0, condition: "≥", limit: 1.3, state: true };
  rohms:     Validity = { value: 0, condition: "<", limit:   2, state: true };
  idle:      Validity = { value: 0, condition: "<", limit:   2, state: true };
  power:     Validity = { value: 0, condition: "<", limit:   2, state: true };
  coef:      Validity = { value: 0, condition: "<", limit:   2, state: true };
}
export interface PhasesData {
  h0: Point[], l0: Point[], hl: Point[]
}
export class ProtocolData {
  chart: PhasesData = {} as PhasesData;
  results = new Results();
  validity = new Validities();
}
export const NAMES = [
  'hipot_h0',
  'hipot_l0',
  'hipot_hl',
  'absorp',
  'rohms',
  'idle',
  'coef'
];


export let DATA: Writable<ProtocolData> = writable(new ProtocolData());


// Заполнение данных о высоковольтном испытании
POINTS_HIPOT.subscribe(hipot_data => {
  const data = get(DATA);
  const validity = data.validity;
  // Опрделение итога ВВ испытания
  validity.absorp.value = 0;
  Object.values(HipotModes).forEach((mode: string) => {
    let points_15_60  = hipot_data[mode]?.filter(point => [15, 60].includes(point.time));
    
    let hipot = validity[`hipot_${[mode]}`];
    let absorp = validity[`absorp_${[mode]}`];
    // итог по умолчанию - не годен
    hipot.value = 0;
    hipot.state = false;
    absorp.value = 0;
    absorp.state = false;
    // расчет итога
    if (points_15_60?.length === 2) {
      hipot.value = points_15_60[1]?.resist;
      hipot.state = compare[hipot.condition](hipot.value, hipot.limit);
      absorp.value = points_15_60[1].resist / points_15_60[0].resist;
      absorp.state = (absorp.value > 0) && compare[absorp.condition](absorp.value, absorp.limit);
    }
  });
  let absorp = validity.absorp;
  absorp.value = Math.min(validity.absorp_h0.value, validity.absorp_hl.value, validity.absorp_l0.value);
  absorp.state = (absorp.value > 0) && compare[absorp.condition](absorp.value, absorp.limit);
  Object.values(HipotModes).forEach((mode: string) => {
    data.chart[mode] = hipot_data[mode]?.map(point => { return { x: point.time, y: point.resist }});
  });
});

// Заполнение данных об измерении омического сопротивления
POINTS_ROHMS.subscribe(rohms_data => {
  const {results, validity} = get(DATA);
  results.rohms = Object.entries(rohms_data).map(point => {
    return { name: point[0], point: point[1], delta: getDiviationFromMax(Object.values(point[1])) }
  });
  // Определение итога измерения омического
  let rohm = validity.rohms;
  // итог по умолчанию - не годен
  rohm.value = 0;
  rohm.state = false;
  if (results.rohms.length) {
    // расчёт итога
    // для определения годности используем наибольшее отклонение
    rohm.value = Math.max(
      ...results.rohms
      .filter(p => !isNaN(p.delta))
      .map(p => p.delta)
    );
    rohm.state = compare[rohm.condition](rohm.value, rohm.limit);
  }
  console.log(results);
});

RECORD.subscribe(record => {
  DATA.update((data: ProtocolData) => {
    const {results, validity} = data;
    // изменение допуска для ВВ испытания в зависимости от температуры
    ['hipot_h0', 'hipot_l0', 'hipot_hl'].forEach(name => {
      let t_trans = record['f_t_trans'];
      if (t_trans <= 10) validity[name].limit = 450;
      else if (t_trans <= 20) validity[name].limit = 300;
      else if (t_trans <= 30) validity[name].limit = 200;
      else if (t_trans <= 40) validity[name].limit = 130;
      else if (t_trans <= 50) validity[name].limit = 90;
      else if (t_trans <= 60) validity[name].limit = 60;
      else validity[name].limit = 40;
    })
    // данные об измерении тока холостого хода
    results.u_xx = [record['f_u_xx_a'], record['f_u_xx_b'], record['f_u_xx_c']];
    results.i_xx = [record['f_i_xx_a'], record['f_i_xx_b'], record['f_i_xx_c']];
    results.u_xx.push(getAverage(results.u_xx));
    results.i_xx.push(getAverage(results.i_xx));
    results.i_xx.push(results.u_xx_avr + results.i_xx_avr);
    results.u_hi = [record['f_u_hi_a'], record['f_u_hi_b'], record['f_u_hi_c']];
    results.u_lo = [record['f_u_lo_a'], record['f_u_lo_b'], record['f_u_lo_c']];
    results.u_hi.push(getAverage(results.u_hi));
    results.u_lo.push(getAverage(results.u_lo));

    // данные о коэф.трансформации
    results.coef_tabl = record['f_coef_tabl'];
    results.coef_real = results.u_hi[3] / results.u_lo[3];
    // определение годности
    validity.idle.value = getDiviationFromAverage(results.i_xx.slice(0,3));
    validity.idle.state = compare[validity.idle.condition](validity.idle.value, validity.idle.limit);
    validity.power.value = results.u_xx[3] * results.i_xx[3];
    validity.coef.value = getDiviationFromFirst([results.coef_tabl, results.coef_real]);
    validity.coef.state = compare[validity.coef.condition](validity.coef.value, validity.coef.limit);
    // вердикт 0 - не годен / 1 - годен
    results.verdict = Object.values(validity).every(valid => valid.state === true) ? 1 : 0;

    return data;
  })
});