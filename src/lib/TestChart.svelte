<script lang="ts">
  import Chart from "./Chart/Chart.svelte";
  import BiChart from "./Chart/BiChart.svelte";
  import LogChart from "./Chart/LogChart.svelte";

  export let axies = {}
  export let names: {x: string, y1: string, y2: string} = { x:'', y1:'', y2:'' }
  export let markers = {}
  export let titles : string[] = [];

</script>

<div class="root" style={$$props.style}>
  {#if $$props.bichart}
  <BiChart data={$$props.points} axis_x={axies[names.x]} axis_y={axies[names.y1]} axis_z={axies[names.y2]}
    marker_y={markers[names.y1]}  marker_z={markers[names.y2]} 
    title={titles.length && titles[0] || ""} limits={$$props.limits ? $$props.limits[1] : undefined} stroke1='green' stroke2="blue"/>
  {:else if $$props.logchart}
  <LogChart data={$$props.points} axis_x={axies[names.x]} axis_y={axies[names.y1]} marker={markers[names.y1]} 
    title={titles.length && titles[0] || ""} limits={$$props.limits ? $$props.limits[0] : undefined}/>
  {:else}
  <Chart data={$$props.points} axis_x={axies[names.x]} axis_y={axies[names.y1]} marker={markers[names.y1]} 
    title={titles.length && titles[0] || ""} limits={$$props.limits ? $$props.limits[0] : undefined} stroke='blue'/>
  {/if}
</div>

<style>
  .root {
    width: 100%; width: 100%;
    /* height: 100%; */
    display: flex;
    flex-direction: column;
    gap: 1em;
    /* border: 1px dashed grey; */
  }
</style>