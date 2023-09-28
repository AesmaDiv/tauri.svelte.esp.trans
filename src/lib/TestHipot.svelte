<script lang="ts">
  import TestControls from "./TestControls.svelte";
  import TestChart from "./TestChart.svelte";
  import { TestStates, type HipotPoint } from "../shared/types";
  import { AXIS_HIPOT, MARKER_HIPOT, POINTS_HIPOT as NewPoints } from "../stores/testing";
  import { POINTS_HIPOT as OldPoints, TESTDATA } from "../stores/database";
  import { setThrust } from "../stores/equipment";
  import { DATANAMES } from "../configs/cfg_hipot";
  import { HEADERS_CHARTS } from "../configs/cfg_localization";

  const eng = false;
  const names = {x: 'time', y1: 'power', y2: 'temper'};
  const titles = HEADERS_CHARTS[eng].power;

  let thrust = 0;
  function onChange(event: Event) {
    let input = event.target as HTMLInputElement;
    thrust = input.valueAsNumber;
    if (event.type === 'change') setThrust(thrust);
  }

  $: points = (() => {
    let result = { h0:[], hl: [], l0: [] };
    let volt = 0, amps = 0, ind = 0;
    while (ind < 65) {
      volt = $TESTDATA.hipot(ind);
      amps = $TESTDATA.hipot(ind+1);
      ind += 2;
      if (amps === 0) continue;
      if (ind < 16) result.h0.push({x: 6.65 * result.h0.length, y: volt/amps })
      else if (ind < 32) result.hl.push({x: 6.65 * result.hl.length, y: volt/amps })
      else result.l0.push({x: 6.65 * result.l0.length, y: volt/amps })
    }

    // let p = $NewPoints || $OldPoints;
    // let result = Object.entries(p).reduce((obj, [key, val]) => {
    //   obj[key] = val.map((point: HipotPoint) => {
    //     return { x: point.time, y: point.voltage / point.current }
    //   });
    //   return obj;
    // }, {});
    console.log("points %o", result);
    return result;
  })();

</script>

<div class="root">
  <TestControls test_state={TestStates.HIPOT} fields={DATANAMES}/>
  <TestChart {titles} axies={$AXIS_HIPOT} logchart {points} {names} markers={$MARKER_HIPOT}/>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 250px auto;
    flex-direction: row;
    gap: 1em;
  }
</style>