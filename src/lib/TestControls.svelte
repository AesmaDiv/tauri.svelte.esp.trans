<script lang="ts">
  import TextBox from "./Components/TextBox.svelte";
  import { NotifierKind, showMessage } from "./Notifier/notifier";
  import { SENSORS } from "../stores/equipment";
  import { TEST_STATE, savePoints, resetPoints, switchTest } from "../stores/testing";
  import { TestStates } from "../shared/types";
  import Button from "./Components/Button.svelte";

  export let test_state : TestStates;
  export let fields = [];

  function toTime(value: number) : string {
    let result = new Date(0);
    if ($TEST_STATE === test_state) result.setMilliseconds(value * 1000)
    return result.toISOString().slice(11,23);
  }
  function toTextBox(i: number, value: number, fixed = 0) : string {
    if (i === 0) return toTime(value);
    return value?.toFixed(fixed) || '0';
  }
  function startStop() {
    showMessage(
      $TEST_STATE === TestStates.IDLE ? "Испытание запущено" : "Испытание прервано",
      $TEST_STATE === TestStates.IDLE ? NotifierKind.NORMAL : NotifierKind.WARNING
    );
    switchTest(test_state);
  }

  const onClick = (command: string) => {
    ({
      start: () => startStop(),
      reset: () => resetPoints(test_state),
      save:  () => savePoints(test_state),
    })[command]();
  }
  $: [btn_start_class, btn_start_value] = $TEST_STATE === test_state ?
  ["test stop", "СТОП"] : ["test", "СТАРТ"];
</script>


<div class="root" style={$$props.style}>
  <div class="info">
    {#each fields as item, i}
      <TextBox name={item.name} title={item.label}
      value={toTextBox(i, $SENSORS[item.name], item.fixed) || 0 }/>
    {/each}
  </div>
  <slot/>
  <div class="buttons">
    <Button class={btn_start_class} onClick={() => onClick('start')}>{btn_start_value}</Button>
    <Button class="reset" onClick={() => onClick('reset')}>сброс</Button>
    <Button class="save" onClick={() => onClick('save')}>сохранить</Button>
  </div>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .info {
    display: flex;
    flex-direction: column;
  }
  .buttons {
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