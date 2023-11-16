<script lang="ts">
  import TestControls from "./TestControls.svelte";
  import TextBox from "./Components/TextBox.svelte";
  import TestChart from "./TestChart.svelte";
  import { TestStates, HipotModes } from "../shared/types";
  import { isEmpty } from "../shared/funcs";
  import { MODE, switchTest, POINT,
           AXIES, MARKER, savePoints, fillPointsRandom } from "../testing/testing_hipot";
  import { POINTS_HIPOT } from "../stores/database";
  import { DATANAMES as fields } from "../configs/cfg_hipot";
  import { HDR_HIPOT } from "../configs/cfg_localization";
  import type { Point } from "./Chart/chart";

  const eng = false;
  const names = {x: 'time', y1: 'resist', y2: ''};
  const titles = HDR_HIPOT[eng].hipot_chart_title;
  const mode = [
    { id: HipotModes.H0, name: "ВВ-0" },
    { id: HipotModes.L0, name: "НВ-0" },
    { id: HipotModes.HL, name: "ВВ-НВ" },
  ];
  const setHipotMode = (mode: HipotModes) => {
    MODE.set(mode || undefined);
    console.log($MODE);
  }

  $: [points, absorp, u_start, u_max] = (() => {
    let points = { h0:[], hl: [], l0: [] };
    let absorp = { h0: 0, hl: 0, l0: 0};
    let [u_start, u_max] = [0, 0];
    if (!isEmpty($POINTS_HIPOT)) {
      console.log("notEmpty");
      Object.keys(points).forEach(name => {
        const p = $POINTS_HIPOT[name];
        points[name] = p.map(point => { return { x: point.time, y: point.resist }});
        absorp[name] = p.length === 0 || p[0].resist === 0 ? 0 :
          p[p.length - 1].resist / p[1].resist
      });
    } else {
      // let volt = 0, amps = 0, ind = 0;
      // while (ind < 65) {
      //   volt = $TESTDATA.hipot(ind);
      //   amps = $TESTDATA.hipot(ind+1);
      //   ind += 2;
      //   if (amps === 0) continue;
      //   if (ind < 16) points.h0.push({x: 6.65 * points.h0.length, y: volt/amps })
      //   else if (ind < 32) points.hl.push({x: 6.65 * points.hl.length, y: volt/amps })
      //   else points.l0.push({x: 6.65 * points.l0.length, y: volt/amps })
      // }
    }
    console.log("points =>",points)
    return [points, absorp, u_start, u_max];
  })();
</script>

<div class="root">
  <TestControls test_state={TestStates.HIPOT} {fields} data={$POINT} start={switchTest} save={savePoints} reset={fillPointsRandom}>
    <div style="height: 100%; padding-top: 2em;">
      <TextBox name={'hipot_absorp'}  title="Коэффициент абсорбции"      value={absorp[$MODE]}/>
      <TextBox name={'hipot_u_start'} title="Начальное напряжение, В"    value={u_start}/>
      <TextBox name={'hipot_u_max'}   title="Максимальное напряжение, В" value={u_max}/>
      <TextBox name={'hipot_mode'}    title="Режим испытания"            value={$MODE}
        select required options={mode} optionKey="name" optionValue="id"
        onChange={setHipotMode}
      />
    </div>
  </TestControls>
  <TestChart {titles} axies={$AXIES} logchart {points} {names} marker={$MARKER}/>
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