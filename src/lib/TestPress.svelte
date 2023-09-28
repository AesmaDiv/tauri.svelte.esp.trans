<script lang="ts">
  import TestControls from "./TestControls.svelte";
  import TestChart from "./TestChart.svelte";

  import { AXIS_PRESS, MARKER_PRESS, POINTS_ROHMS as NewPoints } from "../stores/testing";
  import { LIMITS_PRESS, POINTS_ROHMS as OldPoints } from "../stores/database";
  import { TestStates } from "../shared/types";
  import { setPressure } from "../stores/equipment";

  import { HEADERS_CHARTS } from "../configs/cfg_localization";
  import { DATANAMES } from "../configs/cfg_press";
  import Button from "./Components/Button.svelte";


  const eng = false;
  const names = {x: 'time', y1: 'press_top', y2: 'press_btm'};
  const titles = HEADERS_CHARTS[eng].press;

  
  function onClick(command: string) {
    setPressure(command === 'press_on');
  }
</script>

<div class="root">
  <TestControls test_state={TestStates.ROHMS} fields={DATANAMES} style="width: 300px;">
    <div class="buttons">
      <Button class="btn-press" onClick={() => onClick('press_on')}>вкл нагнетатель</Button>
      <Button class="btn-press" onClick={() => onClick('press_off')}>сброс давления</Button>
    </div>
  </TestControls>
  <TestChart {titles} axies={$AXIS_PRESS} points={$NewPoints || $OldPoints} limits={$LIMITS_PRESS} {names} markers={$MARKER_PRESS}/>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    gap: 1em;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .buttons :global(.btn-press) {
    background-color: rgb(0,200,255);
    color: white;
  }
</style>