import { TestData } from "../shared/types";
import { POINTS_STRUCT } from "./db_models";


/** Получить объект содержащий информацию о точках испытания из полей БД.
 *  Из полей содержащих сериализованные данные или бинарного поля RawData */
export function getTestData(record) {
  let floats = _bytesToFloats(record.rawdata);
  let result = new TestData(floats);

  return result;
}
/** Сериализовать информацию о точках испытания для последующего сохранения в БД */
export function serializePoints(points_data) {
  return JSON.stringify(points_data).replaceAll('"',"#");
}
/** Десериализовать информацию о точках */
export function deserializePoints(points_json) {
  return points_json ? JSON.parse(points_json.replaceAll("#", '"')) : {};
}

/** Парсить массив байт из БД в структуру данных об испытании */
function _parseRawData(rawdata) {
  const floats = _bytesToFloats(rawdata);
  // !!! Тут очень важен порядок, тк splice вырезает из массива
  // !!! указанное количество значения с 0-го индекса
  // первые 20 * 4 значений относятся к испытанию потребляемой мощности
  // следующие 300(!?) давление верхней диафрагмы посекундно
  // последние 300(?!) давление нижней диафрагмы посекундно
  if (floats) {
    const power_data = floats.splice(0, 20 * 4);
    const press_data = {
      press_top: floats.splice(0, 300),
      press_btm: floats.splice(0, 300),
    };

    return { power_data, press_data }
  }

  return POINTS_STRUCT;
}
/** Создать массив точек для графика
 * потребляемой мощности из данных испытания */
const _createPowerPoints = (power_data) => {
  let result = [];
  for (let i = 0; i < power_data.length; i+=4) {
    result.push({
      thrust: power_data[i],
      power:  power_data[i + 1],
      temper: power_data[i + 2],
      time:   power_data[i + 3],
    })
  }
  result = result.filter((el, idx) => idx === 0 || el.time > 0);

  return result;
}
/** Создать массив точек для графика
 * давления диафрагмы из данных испытания */
function _createPressPoints(press_data, length, from_raw = false ) {
  let result = [];
  let coef = from_raw ? 0.070307 : 1;
  length = Math.min(length, press_data.press_top.length, press_data.press_btm.length);
  for (let i = 0; i < length; i++) {
    result.push({
      time: i,
      press_top: Math.max(0, press_data.press_top[i] * coef),
      press_btm: Math.max(0, press_data.press_btm[i] * coef)
    })
  }

  return result;
}

/** Конвертировать массив байт в массив float */
const _bytesToFloats = (rawdata) => {
  let result = [];
  if (rawdata?.length) {
    const data = rawdata.slice(0, 2720);
    for(let i = 0; i < data.length; i+=4) {
      let view = new DataView(new ArrayBuffer(4));
      let bytes = data.slice(i, i + 4).reverse();

      bytes.forEach((b, i) => view.setUint8(i, b));
      result.push(view.getFloat32(0));
    }
  }

  return result;
}

export function pointsToChart(source, names) {
  let initial = { [names.y1]: [], [names.y2]: [] };
  if (!source) return initial;

  let points = source.reduce((obj, val) => {
    obj[names.y1].push({x: val[names.x], y: val[names.y1]});
    obj[names.y2].push({x: val[names.x], y: val[names.y2]});
    return obj;
  }, initial);

  return points;
}