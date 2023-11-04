import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { bytes2string, string2bytes, sleep } from "../../shared/funcs";

/** Флаги ступеней разрядки */
export enum Di30R_Flags {
  Stage1 = 0b0001,//1
  Stage2 = 0b0010,//2
  Stage3 = 0b0100,//4
  HiVols = 0b1000,//8
}
/** Класс структуры значений */
export class Di30R_Values {
  volts: number = -1.0;
  ampHi: number = -1.0;
  ampLo: number = -1.0;
}
/** Класс управления ВВБ Di30R */
export class Di30R {
  doLog : boolean = false;
  isOpen: boolean = false;
  values: Di30R_Values = new Di30R_Values();
  static CONTROL_MAX: number = 1.8;
  static RESTRICTIONS = {
    STAGE_1: 12,
    STAGE_2: 6,
    STAGE_3: 2,
    HIVOLTS: 0.2,
  }
  log(message: string) { this.doLog && console.log("Di30R::", message) }

  /** Подключение */
  async connect({name, rate}) {
    this.log("connecting..");
    if (this.isOpen) return true;
    let result = this.isOpen = await invoke("com_open", {
      wnd: appWindow,
      name, rate,
      doListen: false
    });
    this.log(`connection state ${this.isOpen}`);
    return result;
  }
  /** Отключение */
  async disconnect() {
    this.log("disconnect");
    await invoke("com_close", {});
    this.isOpen = false;
  }
  /** Получение значений */
  async getValues() : Promise<Di30R_Values> {
    this.log("getValues");
    if (this.isOpen) {
      let bytes: number[] = string2bytes("#01\r");
      bytes = await invoke("com_request", { bytes });
      let values = [...bytes2string(bytes)
        .replace(">", "")
        .replace("\r", "")
        .matchAll(/[+-]\d{2}\.\d{3}/g)
      ].map(([value, _]) => {
        const result = parseFloat(value);
        return isNaN(result) ? -1.0 : result;
      });
      this.values = { volts: values[0], ampHi: values[1], ampLo: values[2] }

      return this.values;
    }
    console.warn("Di30R:: Not connected.");
    return new Di30R_Values();
  }
  /** Установка управляющего напряжения */
  async setVoltage(value: number) : Promise<boolean> {
    this.log(`setVoltage ${value}`)
    if (this.isOpen && value <= Di30R.CONTROL_MAX) {
      const volts: string = ('00' + value.toFixed(3)
        .toUpperCase())
          .slice(-6);
      let bytes: number[] = string2bytes(`#02${volts}\r`);
      bytes = await invoke("com_request", { bytes });

      return bytes2string(bytes) === ">\r";
    }
    console.warn("Di30R:: Not connected.");
    return false;
  }
  /** Получение текущего управляющего напряжения */
  async getVoltage() : Promise<number> {
    this.log("getVoltage");
    if (this.isOpen) {
      let bytes: number[] = string2bytes("$026\r");
      bytes = await invoke("com_request", { bytes })
      if(bytes.length === 10)
        return parseFloat(bytes2string(bytes.slice(3,9)));
    }
    console.warn("Di30R:: Not connected.");
    return -1;
  }
  /** Сброс напряжения */
  async dropVoltage() {
    this.log("dropVoltage");
    let discarging = true;
    await this.setVoltage(0);
    while (discarging) {
      const volts = this.values.volts;
      if (volts < Di30R.RESTRICTIONS.STAGE_1) await this.switchDischarge(Di30R_Flags.Stage1, false);
      if (volts < Di30R.RESTRICTIONS.STAGE_2) await this.switchDischarge(Di30R_Flags.Stage2, false);
      if (volts < Di30R.RESTRICTIONS.STAGE_2) await this.switchDischarge(Di30R_Flags.Stage3, false);
      if (volts < Di30R.RESTRICTIONS.HIVOLTS) {
        await this.switchDischarge(Di30R_Flags.HiVols, false);
        discarging = false;
      }
      await sleep(1000);
    }
  }
  /** Переключение ступеней разрядки */
  async switchDischarge(stage: Di30R_Flags, state: boolean = undefined, timeout: number = 0) : Promise<boolean> {
    if (this.isOpen) {
      let curr: number = await this.getDischarge();
      if (state === undefined) curr ^= stage;
      if (state === true) curr |= stage;
      if (state === false) curr &= (stage ^= 0b1111);
      const hex: string = ('0000' + curr.toString(16)
      .toUpperCase())
      .slice(-4);
      this.log(`switchDischarge ${curr} -> ${stage} = ${hex}`);
      let bytes: number[] = string2bytes(`#04${hex}\r`);
      bytes = await invoke("com_request", { bytes });
      if (!!timeout) await sleep(timeout);

      return bytes.shift() === 62;
    }
    console.warn("Di30R:: Not connected.");
    return false;
  }
  /** Получение состояния ступеней разрядки */
  async getDischarge() : Promise<number> {
    if (this.isOpen) {
      let bytes: number[] = string2bytes("@04\r");
      bytes =  await invoke("com_request", { bytes });
      const hex = bytes2string(bytes)
        .replace(">","")
        .replace("\r","");
      this.log(`getDischarge ${hex}`);

      return parseInt(hex, 16) | 0;
    }
    console.warn("Di30R:: Not connected.");
    return 0;
  }
  /** Сброс в начальное положение */
  async setDefaults() : Promise<boolean> {
    this.log("setDefaults");
    await this.setVoltage(0);
    if (this.isOpen) {
      let result = true;
      let bytes: number[] = string2bytes("@040000\r");
      bytes =  await invoke("com_request", { bytes });
      let hex = bytes2string(bytes);
      result &&= hex === ">\r";

      return result;
    }
    console.warn("Di30R:: Not connected.");
    return false;
  }
}