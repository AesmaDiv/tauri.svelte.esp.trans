<script lang="ts">
  import Button from "./Components/Button.svelte";
  import { RECORD, updatePoints, updateRecord } from "../stores/database";
  import { showMessage, NotifierKind } from "./Notifier/notifier";
  import { ROhmPoint, type ROhmData, TestStates } from "../shared/types";
  import { deserializePoints, pointsToChart } from "../database/db_funcs";
  import { micrometerStart, micrometerStop } from "../stores/testing";

  let [switch_1, switch_2]: [number, number] = [0, 0];
  let selected: HTMLInputElement;
  let position: string;
  let current: ROhmPoint = new ROhmPoint();
  let rohms: ROhmData = {};

  function currentTest() {
    current.phase_a = Math.random();
    current.phase_b = Math.random();
    current.phase_c = Math.random();
  }
  function currentClear() {
    current = new ROhmPoint();
  }
  function currentSelect(e: Event) {
    let radio = (e.target as HTMLInputElement);
    if (selected === radio) {
      selected.checked = false;
      selected = undefined;
      position = "";
    } else {
      if (selected) selected.checked = false;
      selected = radio;
      position = radio.id;
    }
  };


  function rohmMeasure() {
    if (!position) {
      showMessage("Не указаны положения анцапф", NotifierKind.ERROR);
      return;
    }
    currentTest();
    rohms[position] = {
      phase_a: current.phase_a,
      phase_b: current.phase_b,
      phase_c: current.phase_c,
    };

    selected && (selected.checked = false);
    let index = getPositionIndex(position);
    selected = document.getElementById(getNextPosition(index)) as HTMLInputElement;
    if (selected) {
      selected.checked = true;
      position = selected.id;
    } else position = "";
    
    rohmOrder();
    currentClear();
  };
  function rohmOrder(names: string[] = undefined) {
    rohms = Object.keys(rohms)
      .filter(key => names ? names.includes(key) : true)
      .sort()
      .reduce((obj, key) => {
        obj[key] = rohms[key]; 
        return obj;
      },{});
  }
  function rohmSave() {
    micrometerStart().then(console.log);
    // updateRecord({...$RECORD, switches: `${switch_1};${switch_2}`});
    // updatePoints(TestStates.ROHMS, rohms);
  }

  function onClick(command: string) {
    ({
      reset: () => micrometerStop(),//{ rohms = {}; createTable(); },
      save:  () => micrometerStart(),
    })[command]();
  }

  function createTable() {
    let names = [...Array(switch_1 * switch_2)]
    .map((_, i) => getNextPosition(i));

    names.forEach(name => {
      if(!(name in rohms)) {
        rohms[name] = {
          phase_a: undefined,
          phase_b: undefined,
          phase_c: undefined
        };
      }
    });
    rohmOrder(names);
    position = "1-1";
    selected = document.getElementById(position) as HTMLInputElement;
    selected && (selected.checked = true);
  }
  function getNextPosition(next: number) {
    let sw_1 = Math.floor(next / switch_2) + 1;
    let sw_2 = next % switch_2 + 1;
    return `${sw_1}-${sw_2}`;
  }
  function getPositionIndex(position: string) {
    let [a, b] = position.split("-").map(x => +x);
    return switch_2 * (a - 1) + b;
  }
  function getDelta(rohm: ROhmPoint) : number {
    let min: number = Math.min(rohm.phase_a, rohm.phase_b, rohm.phase_c);
    let max: number = Math.max(rohm.phase_a, rohm.phase_b, rohm.phase_c);
    return 100 * (max - min) / max;
  }


  RECORD.subscribe(record => {
    rohms = deserializePoints(record[TestStates.ROHMS]);
    let switches = Object.keys(rohms).sort().pop();
    [switch_1, switch_2] = switches ? switches.split("-").map(x => parseInt(x)) : [0,0];
    createTable();
  });
  // $: [btn_start_class, btn_start_value] = "True" === "test_rohms" ?
  // ["test stop", "СТОП"] : ["test", "СТАРТ"];
</script>

<div class="root">
  <div class="switches">
    <label style="grid-row: 1; grid-column: 1;" for="switch_1">Кол-во положений анцапфы I:</label>
    <input style="grid-row: 1; grid-column: 2;" type="number" id="switch_1" bind:value={switch_1} on:change={createTable}/>
    <label style="grid-row: 2; grid-column: 1;" for="switch_1">Кол-во положений анцапфы II: </label>
    <input style="grid-row: 2; grid-column: 2;" type="number" id="switch_1" bind:value={switch_2} on:change={createTable}/>
  </div>
  <table>
    <thead>
      <th class="radio"></th>
      <th class="value">положения анцапф</th>
      <th class="value">фаза A, Ω</th>
      <th class="value">фаза B, Ω</th>
      <th class="value">фаза C, Ω</th>
      <th class="value">небаланс, %</th>
    </thead>
    <tbody>
      <tr class="sticky">
        <td/>
        <td><input type="text" bind:value={position}></td>
        <td><input type="text" bind:value={current.phase_a} readonly></td>
        <td><input type="text" bind:value={current.phase_b} readonly></td>
        <td><input type="text" bind:value={current.phase_c} readonly></td>
        <td><input type="button" value="измерить" on:click={() => rohmMeasure()}></td>
      </tr>
    </tbody>
  </table>
  <div class="table-container">
    <table>
      <tbody>
        {#each Object.entries(rohms) as [name, rohm]}
        {@const delta = getDelta(rohm)}
        <tr>
          <td class="radio"><input type="radio" id={name} on:click={currentSelect}></td>
          <td class="value" style="padding-left: 5px;">{name}</td>
          <td class="value" style="text-align: center;">{rohm.phase_a ? rohm.phase_a.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{rohm.phase_b ? rohm.phase_b.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{rohm.phase_c ? rohm.phase_c.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{delta ? delta.toFixed(2) : ""}</td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="buttons">
    <!-- <Button class={btn_start_class} onClick={() => onClick('start')}>{btn_start_value}</Button> -->
    <Button class="reset" onClick={() => onClick('reset')}>сброс</Button>
    <Button class="save" onClick={() => onClick('save')}>сохранить</Button>
  </div>
</div>

<style>
  .switches {
    display: grid;
    width: fit-content;
    grid-template-columns: auto 50px;
    grid-template-rows: 1fr 1fr;
    column-gap: 10px;
    row-gap: 5px;
    margin-bottom: 5px;
    align-items: flex-end;
    justify-content: flex-end;
  }
  .table-container {
    width: 100%;
    height: 370px;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .radio {
    width: 30px;
  }
  .value {
    width: calc(100% - 20px);
  }
  table {
    width: 500px;
  }
  table, td, th {
    table-layout: fixed;
    border: 1px solid black;
    border-collapse: collapse;
    overflow: hidden;
  }
  td input[type=text], td input[type=button] {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  td input[type=radio] {
    width: 20px;
    background-color: aqua;
  }
  .buttons {
    width: 250px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: .4em;
  }
  .buttons :global(.test) {
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 4;
    background-color: green;
  }
  .buttons :global(.stop) {
    background-color: red;
  }
  .buttons :global(.reset),
  .buttons :global(.save) {
    grid-row: 2;
    background-color: rgb(0,200,255);
  }
  .buttons :global(.reset) {
    grid-column-start: 1;
    grid-column-end: 1;
  }
  .buttons :global(.save) {
    grid-column-start: 2;
    grid-column-end: 4;
  }
</style>