import { TestData } from "../shared/types";


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