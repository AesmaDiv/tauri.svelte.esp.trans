export function getInheritedProperty(property: string, node: HTMLElement) : string {
  if (!node) return "not found";
  let result = getComputedStyle(node)[property];
  return result || getInheritedProperty(property, node.parentElement);
}
export function getInheritedColor(node: HTMLElement) : string {
  if (!node) return 'rgba(0, 0, 0, 0)';
  let result = getComputedStyle(node).color;
  if (result === 'rgba(0, 0, 0, 0)') result = null;
  return result || getInheritedColor(node.parentElement);
}
export function getInheritedBackgroundColor(node: HTMLElement) : string {
  if (!node) return 'rgba(0, 0, 0, 0)';
  let result = getComputedStyle(node).backgroundColor;
  if (result === 'rgba(0, 0, 0, 0)') result = null;
  return result || getInheritedBackgroundColor(node.parentElement);
}
/** Расчитать следующий делитель для числа */
export const nextDividingOn = (value, divider) => {
  if (value) {
    let exp = value.toExponential(2);
    let pow = +exp.slice(exp.indexOf('e') + 1) - 1;
    let val = Math.ceil(
      +exp
        .slice(0, 3)
        .replace('.','') / divider
    ) * divider * Math.pow(10, pow);

    return val;
  } else return 10;
}
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/** Получить текущую дату-время */
export function getCurrentDate() {
  return new Date().toLocaleString("ru").replace(',','');
}
/** Перевести число в дату-время */
export function decimal2time(minutes_decimal) {
  let result = new Date(null)
  result.setSeconds(minutes_decimal * 60);
  return result.toISOString().slice(11,19);
}
/** Создать объект с указанными полями */
export function createObj(keys) {
  return keys.reduce((obj, key) => {
    obj[key] = []; 
    return obj;
  }, {})
}
/** Округлить числа в массиве до указанного кол-ва знаков после запятой */
export function roundArray(floats, decnum) {
  let result = floats.map(x => roundValue(x, decnum));
  return result;
}
/** Округлить число до указанного кол-ва знаков после запятой */
export function roundValue(float, decnum) {
  let pow = Math.pow(10, decnum);
  return Math.round(float * pow) / pow;
}
export function fit(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}
/** Задать значение вложенного поля объекта */
export function assign(obj, keyPath, value) {
  const lastKeyIndex = keyPath.length-1;
  for (var i = 0; i < lastKeyIndex; ++ i) {
    const key = keyPath[i];
    if (!(key in obj)){
      obj[key] = {}
    }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}
export function closestDividend(value: number, divider: number) : number {
  return (value % divider) ? Math.floor(value / divider) + 1 : value;
}
/** Получить значение вложенного поля объекта по пути
 * @obj объект
 * @path путь строкового типа "key1.key2.key3 .."
 */
export function extract(obj, keyPath) {
  const nodes = keyPath.split('.');
  for (var i = 0; i < nodes.length; i++) {
    if (obj === undefined) return undefined;
    if (!(nodes[i] in obj)) return undefined;
    obj = obj[nodes[i]]
  }
  return obj;
}
export function printProtocol() {
  let protocol = document.getElementById("Protocol");
  let style = window.document.querySelector('style').innerHTML;
  window.document.querySelectorAll('style').forEach(item => {
    if(item.getAttribute('data-vite-dev-id').includes('Protocol')) style += item.innerText;
    if(item.getAttribute('data-vite-dev-id').includes('TestChart')) style += item.innerText;
    if(item.getAttribute('data-vite-dev-id').includes('Chart')) style += item.innerText;
  });
  let wnd = window.open("","","height=600pt, width=800pt");
  wnd.document.write(`<html><head><style>${style}</style><head>`);
  wnd.document.write(`<body>${protocol.innerHTML}</boby></html>`);
  wnd.document.close();
  wnd.print()
}
