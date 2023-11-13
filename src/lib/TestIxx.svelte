<script lang="ts">
  import TestControls from "./TestControls.svelte";
  import TextBox from "./Components/TextBox.svelte";
  import Button from "./Components/Button.svelte";
  import { TestStates, Phases, } from "../shared/types";
  import { roundValue, getAverage, getDiviationFromAverage, decimal2time } from "../shared/funcs";
  import { TIME, STATE, switchTest, saveTest,
          AMPRS, VOLTS_HI, VOLTS_LO, COEFF } from "../testing/testing_ixx";

  const eng = false;

  let bck_save: string = "background-color: rgb(0, 200, 255);";
  let bck_amps: string = "background-color: rgb(0, 200, 0);";
  let bck_coef: string = "background-color: rgb(0, 200, 0);";
  let txt_amps: string = "измерить";
  let txt_coef: string = "измерить";

  function onClick(command: string) {
    ({
      save: () => saveTest(),
      test_amps: () => switchTest(TestStates.AMPXX),
      test_coef: () => switchTest(TestStates.COEFF)
    }[command])();
  }

  STATE.subscribe(state => {
    bck_amps = bck_coef = "background-color: rgb(0, 200, 0);";
    bck_save = "background-color: rgb(0, 200, 255);";
    txt_amps = txt_coef = "измерить";

    if (state === TestStates.AMPXX) {
      bck_amps = "background-color: rgb(200, 0, 0);";
      bck_coef = bck_save = "background-color: rgb(100, 100, 100);";
      txt_amps = "остановить";
    } else if (state === TestStates.COEFF) {
      bck_coef = "background-color: rgb(200, 0, 0);";
      bck_amps = bck_save = "background-color: rgb(100, 100, 100);";
      txt_coef = "остановить";
    }
  });

  $: [
    avr_volts_hi,
    avr_volts_lo,
    avr_amprs,
    avr_balance,
    avr_power,
    coeff_real
  ] = (() => {
    console.log("AMPRS", getAverage(Object.values($AMPRS)))
    let avr_volts_hi = getAverage(Object.values($VOLTS_HI));
    let avr_volts_lo = getAverage(Object.values($VOLTS_LO));
    let avr_amprs    = getAverage(Object.values($AMPRS));
    let avr_power    = avr_volts_hi * avr_amprs;
    let avr_balance  = getDiviationFromAverage(Object.values($AMPRS));
    let coeff_real   = 0 < avr_volts_lo ? avr_volts_hi / avr_volts_lo : 0;

    return [ avr_volts_hi, avr_volts_lo, avr_amprs, avr_balance, avr_power, coeff_real ].map(v => v.toFixed(3));
  })();
</script>

<div class="root">
  <TextBox name={'time'} title="Время" value={decimal2time({seconds: $TIME})}/>
  <div class="ixx">
    <TextBox name={'amps_a'} title="I хх A, А" value={$AMPRS.phase_a}/>
    <TextBox name={'amps_b'} title="I хх B, А" value={$AMPRS.phase_b}/>
    <TextBox name={'amps_c'} title="I хх C, А" value={$AMPRS.phase_c}/>
    <br>
    <TextBox name={'amps_avr'} title="Средний I хх, А" value={avr_amprs}/>
  </div>
  <div class="result ixx">
    <label class="label" for="avr_amps">Дисбаланс, %:</label>
    <input class="value" name="avr_amps" type="text" value={avr_balance}>
    <label class="label" for="avr_amps">Потери, Вт:</label>
    <input class="value" name="avr_amps" type="text" value={avr_power}>
  </div>
  <div class="u-lo">
    <TextBox name={'volt_lo_ab'} title="U НН ab, В" value={$VOLTS_LO.phase_a}/>
    <TextBox name={'volt_lo_bc'} title="U НН bc, В" value={$VOLTS_LO.phase_b}/>
    <TextBox name={'volt_lo_ca'} title="U НН ca, В" value={$VOLTS_LO.phase_c}/>
    <br>
    <TextBox name={'volt_lo_avr'} title="Среднее U НВ, В" value={avr_volts_lo}/>
  </div>
  <div class="u-hi">
    <TextBox name={'volt_hi_ab'} title="U ВН AB, В" value={$VOLTS_HI.phase_a}/>
    <TextBox name={'volt_hi_bc'} title="U ВН BC, В" value={$VOLTS_HI.phase_b}/>
    <TextBox name={'volt_hi_ca'} title="U ВН CA, В" value={$VOLTS_HI.phase_c}/>
    <br>
    <TextBox name={'volt_hi_avr'} title="Среднее U ВВ, В" value={avr_volts_hi}/>
  </div>
  <div class="result trans">
    <label class="label" for="trans_tabl">Коэф.трансформации (табличный):</label>
    <input class="value" name="trans_tabl" type="text" value={$COEFF[0]}>
    <label class="label" for="trans_real">(фактический):</label>
    <input class="value" name="trans_real" type="text" value={coeff_real}>
  </div>
  <Button class="button test" style="grid-column: 1; grid-row: 4; {bck_amps}" onClick={() => onClick('test_amps')}>{txt_amps}</Button>
  <Button class="button save" style="grid-column: 2; grid-row: 4; {bck_save}" onClick={() => onClick('save')}>сохранить</Button>
  <Button class="button test" style="grid-column: 3; grid-row: 4; {bck_coef}" onClick={() => onClick('test_coef')}>{txt_coef}</Button>
</div>

<style>
  .root {
    width: 100%;
    height: fit-content;
    display: grid;
    grid-template-rows: repeat(4, auto);
    grid-template-columns: repeat(3, 250px);
    flex-direction: row;
    gap: 1em;
  }
  .root :global(.button) {
    background-color: rgb(0, 200, 255);
    &:hover {
      outline: 1px solid white;
    }
  }
  .root :global(.test) {
    background-color: rgb(0, 200, 0);
  }
  .ixx {
    grid-row: 2;
    grid-column: 1;
  }
  .u-lo {
    grid-row: 2;
    grid-column: 2;
  }
  .u-hi {
    grid-row: 2;
    grid-column: 3;
  }
  .trans {
    grid-column-start: 2;
    grid-column-end: 4;
  }
  .result {
    grid-row: 3;
    width: 100%;
    height: fit-content;
    display: grid;
    column-gap: 2ch;
    grid-template-columns: auto auto;
    grid-template-rows: 1fr 1fr;
    justify-content: end;
  }
  input {
    all: unset;
    width: 70px;
    text-align: end;
    outline: 1px solid green;
  }
  input, label {
    font-size: medium;
    text-align: end;
  }
  
</style>