<script lang="ts">
  import { readSettings } from "./stores/settings";
  import { printProtocol } from "./shared/funcs";
  import { onMount } from "svelte";
  import TableList from "./lib/TableList.svelte";
  import Slider from "./lib/Components/Slider.svelte";
  import RecordInfo from "./lib/Record.svelte";
  import TestHipot from "./lib/TestHipot.svelte";
  import Protocol from "./lib/Protocol.svelte";
  import AppHeader from "./lib/AppHeader.svelte";
  import Notifier from "./lib/Notifier/Notifier.svelte";
  import ROhm from "./lib/ROhm.svelte";


  onMount(async () => await readSettings());

  let bindings = {
    id: '№',
    datetest: 'Дата',
    ordernum: 'Наряд-заказ',
    serial: 'Зав.номер'
  }
  let slider_group = 'Данные об объекте испытания :';

  const style = "box-shadow: 2px 2px 15px gray;";

</script>

<main class="root">
  <div class="header">
    <AppHeader {style}/>
  </div>
  <div class="testlist">
    <TableList style={style} {bindings}/>
  </div>
  <div class="sliders">
    <Slider title="Данные об объекте испытания :" bind:group={slider_group} {style}>
      <div class="slider-content"><RecordInfo /></div>
    </Slider>
    <Slider title="Измерение омического сопротивления :" bind:group={slider_group} {style}>
      <div class="slider-content"><ROhm /></div>
    </Slider>
    <Slider title="Измерение сопротивления изоляции  :" bind:group={slider_group} {style}>
      <div class="slider-content"><TestHipot /></div>
    </Slider>
    <Slider title="Протокол :" bind:group={slider_group} {style}>
      <div class="slider-content protocol"><button style="width: 200px;" on:mousedown={printProtocol}>Print</button><Protocol/></div>
    </Slider>
    <div class="notifier"><Notifier content="Hello world!!!"/></div>
  </div>
</main>

<style>
  .root {
    display: grid;
    grid-template-columns: 25em calc(100% - 25.5em);
    grid-template-rows: 3em calc(100% - 3.5em);
    gap: 0.5em;
    width: 100%;
    height: calc(100vh - 1.5em);
  }
  .header {
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 3;
  }
  .testlist {
    grid-row: 2;
    grid-column: 1;
  }
  .sliders {
    grid-row: 2;
    grid-column: 2;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    /* overflow: hidden; */
  }
  .slider-content {
    height: 560px;
    background-color: white;
  }
  .protocol {
    display: flex;
    flex-direction: column;
    outline: 1px solid black;
    overflow-y: scroll;
    width: auto;
  }
  .notifier {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
</style>