<script lang="ts">
  import TestControls from "./TestControls.svelte";
  import { POINTS_ROHMS, SWITCHES } from "../stores/database";
  import { TEST_STATE } from "../stores/testing";
  import { ROHM, SWITCH, switchTest, currentClear, sortPoints, savePoints } from "../testing/testing_rohms";
  import { TestStates } from "../shared/types";
  import { getDelta } from "../shared/funcs";


  const eng = false;
  let [switch_1, switch_2]: [number, number] = [0, 0];
  let selected: HTMLInputElement;
  // let position: string;
  // let current: ROhmPoint = new ROhmPoint();

  function currentSelect(e: Event) {
    let radio = (e.target as HTMLInputElement);
    if (selected === radio) {
      selected.checked = false;
      selected = undefined;
      SWITCH.set("");
    } else {
      if (selected) selected.checked = false;
      selected = radio;
      SWITCH.set(radio.id);
    }
  };

  function rohmReset() {
    console.log("Sending to adam");
    // const address = $SETTINGS.adam.ip;
    // (async() => {
    //   const bytes = [0x00,0x00,0x00,0x00,0x00,0x08,0x01,0x0F,0x00,0x20,0x00,0x08,0x01,0x00];
    //   console.log(await invoke('write_adam_bytes', { address, bytes }));
    // })();
  }

  function rohmSelectNext() {
    selected && (selected.checked = false);
    let index = getPositionIndex($SWITCH);
    selected = document.getElementById(getNextPosition(index)) as HTMLInputElement;
    if (selected) {
      selected.checked = true;
      SWITCH.set(selected.id);
    } else SWITCH.set("");
  }

  function createTable() {
    let names = [...Array(switch_1 * switch_2)]
    .map((_, i) => getNextPosition(i));

    names.forEach(name => {
      if(!(name in $POINTS_ROHMS)) {
        $POINTS_ROHMS[name] = {
          phase_a: undefined,
          phase_b: undefined,
          phase_c: undefined
        };
      }
    });
    sortPoints(names);
    selected = document.getElementById($SWITCH) as HTMLInputElement;
    selected && (selected.checked = false);
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

  TEST_STATE.subscribe(test_state => {
    if (test_state === TestStates.IDLE) {
      rohmSelectNext();
      sortPoints();
      currentClear();
    }
  });
  SWITCHES.subscribe(switches => { 
    [switch_1, switch_2] = switches;
    createTable();
  });
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
      <th class="value">отпайки</th>
      <th class="value">фаза A, Ω</th>
      <th class="value">фаза B, Ω</th>
      <th class="value">фаза C, Ω</th>
      <th class="value">небаланс, %</th>
    </thead>
    <tbody>
      <tr class="sticky">
        <td/>
        <td><input type="text" bind:value={$SWITCH}></td>
        <td><input type="text" bind:value={$ROHM.phase_a} readonly></td>
        <td><input type="text" bind:value={$ROHM.phase_b} readonly></td>
        <td><input type="text" bind:value={$ROHM.phase_c} readonly></td>
        <td/>
      </tr>
    </tbody>
  </table>
  <div class="table-container">
    <table>
      <tbody>
        {#each Object.entries($POINTS_ROHMS) as [name, rohm]}
        {@const delta = getDelta(Object.values(rohm))}
        <tr>
          <td class="radio"><input type="radio" id={name} on:click={currentSelect}></td>
          <td class="value" style="padding-left: 5px;">{name}</td>
          <td class="value" style="text-align: center;">{rohm.phase_a ? rohm.phase_a.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{rohm.phase_b ? rohm.phase_b.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{rohm.phase_c ? rohm.phase_c.toFixed(4) : ""}</td>
          <td class="value" style="text-align: center;">{isNaN(delta) ? "" : delta.toFixed(2)}</td>
        </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="buttons">
    <TestControls test_state={TestStates.ROHMS} start={switchTest} reset={rohmReset} save={savePoints}/>
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
  td input[type=text] {
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
    /* display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: .4em; */
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