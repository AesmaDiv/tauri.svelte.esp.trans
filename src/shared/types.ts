/** Состояния испытаний */
export enum TestStates {
  IDLE  = '',
  ROHMS = 'test_rohms',
  HIPOT = 'test_hipot',
  AMPXX = 'test_ampxx',
  COEFF = 'test_coeff',
}
/** Тип точки графика */
export class Point {
  x : number = 0;
  y : number = 0;
};
/** Тип соединения фаз */
export enum PhasesConnection {
  NONE = 0,
  STAR = 1,
  NEUTRAL = 2,
  TRIANGLE = 3,
}
/** Режим измерения омического сопротивления */
export enum Phases {
  NONE = 'none',
  AB = 'rohm_ab',
  BC = 'rohm_bc',
  CA = 'rohm_ca',
  A0 = 'rohm_a0',
  B0 = 'rohm_b0',
  C0 = 'rohm_c0',
}
/** Точка значений по фазам */
export class PhasesPoint {
  /** ом.сопротивление фазы A */
  phase_a: number = 0;
  /** ом.сопротивление фазы B */
  phase_b: number = 0;
  /** ом.сопротивление фазы C */
  phase_c: number = 0;

  constructor(...[a, b, c]: number[]) {
    this.phase_a = a;
    this.phase_b = b;
    this.phase_c = c;
  }
}
/** Тип данных об омическом сопротивлении для различных положений анфапф */
export type ROhmData = {
  [name: string]: PhasesPoint
};

/** Режим высоковольтного испытания */
export enum HipotModes {
  H0   = 'h0',
  L0   = 'l0',
  HL   = 'hl',
}
/** Класс точки для измерения потребляемой мощности */
export class HipotPoint {
  /** время */
  time    : number = 0;
  /** напряжение */
  voltage : number = 0;
  /** ток утечки */
  current : number = 0;
  /** сопротивление */
  resist  : number = 0;
}
/** Тип данных об высоковольтном испытании */
export type HipotData = {[mode: string]: HipotPoint[]};


export interface IMarkerPress {
  press_top : Point,
  press_btm : Point
};
export interface IMarkerPower {
  power : Point,
  temper: Point
};
/** Структура данный с ADAM */
export interface IAdamData {
  digital: IDigital,
  analog: IAnalog,
}
/** Структура дискретных канало ADAM */
export interface IDigital {
  slot: Array<number>
}
/** Структура аналоговых каналов ADAM */
export interface IAnalog {
  slot: Array<[number, number, number, number, number, number, number, number]>,
}
/** Класс дискретных состояний */
export class DigitalStates {
  lamp    : boolean;
  rohm_ab : boolean;
  rohm_bc : boolean;
  rohm_ca : boolean;
  start   : boolean;
  print   : boolean;
}
/** Класс данных с датчиков */
export class Sensors {
  time      : number = 0;
  voltage   : number = 0;
  current   : number = 0;
  resist    : number = 0;
};
/** Класс буферов данных с датчиков */
export class SensorsBuffers {
  voltage   : VBuffer;
  current   : VBuffer;
  resist    : VBuffer;

  constructor(size: number) {
    this.voltage = new VBuffer(size);
    this.current = new VBuffer(size);
    this.resist  = new VBuffer(size);
  }
};

export interface ITiming {
  duration: number, pulling_rate: number, points_count: number
}
export interface IAdamSource {
  slot: number, channel: number
}
export interface IAdamSourceParams extends IAdamSource {
  d_range: number, offset: number, v_range: number, coeff: number
}
export interface IComParams {
  name: string, rate: number
}
export interface ISettings {
  db: {
    path: string;
  },
  test: {
    hipot: ITiming,
    rohms: ITiming,
    ampxx: ITiming,
    coeff: ITiming,
  },
  adam: {
    ip: string,
    rate: number,
    digital: { [name: string] : IAdamSource },
    analog: { [name: string] : IAdamSourceParams }
  },
  com: { [key: string]: IComParams }
  di30r: {
    control: number,
    voltage: number,
    amps_hi: number,
    amps_lo: number
  }
}



export class VBuffer {
  values : Array<number>;
  size   : number;
  index  : number;

  constructor(size: number) {
    this.values = Array<number>(size);
    this.size = size;
    this.index = 0;
  }

  add(value: number) {
    this.values[this.index] = value;
    this.index += 1;
    if (this.index === this.size) this.index = 0;
  }

  getAverage() : number{
    let sum = this.values.reduce((a: number, v: number) => a + v, 0);
    let avr = sum / this.size;
    return avr;
  }
};

export class TestData {
  _floats = new Float32Array(66 * 6 + 86 * 3);
  constructor(floats: number[]) {
    this._floats = new Float32Array(floats);
  }

  _get_set = (a: number, b: number) => (i: number, value: number=undefined) => {
    return value ? (this._floats[a + i] = value) : this._floats.slice(a, b)[i];
  }
  hipot      = this._get_set(0, 66);
  rohms      = this._get_set(66,86);
  rohms_r    = this._get_set(86,86);
  ll_real    = this._get_set(86,86);
  points_h0  = this._get_set(86,66);
  points_hl  = this._get_set(66,66);
  points_l0  = this._get_set(66,66);
  points_iab = this._get_set(66,66);
  points_lc  = this._get_set(66,66);
}
