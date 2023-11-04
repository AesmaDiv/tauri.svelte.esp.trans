<script lang="ts">
  import { open } from "@tauri-apps/api/dialog";
  import TextBox from "./Components/TextBox.svelte";
  import { TEST, ANALOG, DIGITAL, DI30R } from "../configs/cfg_menu";
  // import { $SETTINGS } from "../configs/cfg_application";
  import { extract } from "../shared/funcs";
  import { SETTINGS } from "../stores/settings";

  const styleDbPath = "grid-row: 1; grid-column-start: 1; grid-column-end: 3;";
  const styleAdamIp = "grid-row: 2; grid-column: 1;";
  const styleAdamRate = "grid-row: 2; grid-column: 2;";
  const styleComNameHipot = "grid-row: 3; grid-column: 1;";
  const styleComRateHipot = "grid-row: 3; grid-column: 2;";
  const styleComNameRohms = "grid-row: 4; grid-column: 1;";
  const styleComRateRohms = "grid-row: 4; grid-column: 2;";

  async function onClick(event) {
    open({
      multiple: false,
      filters: [{
        name: "Sqlite DB",
        extensions: ['db', 'sqlite']
      }]
    }).then(value => {
      SETTINGS.update(settings => {
        settings.db.path = Array.isArray(value) ? value[0] : value;
        console.log(settings);
        return settings;
      })
    });
  }
</script>

<form id="settings-form">
  {#if $SETTINGS}
  <div class="grid11">
    <div class="textboxes">
      <TextBox name="db.path"   style={styleDbPath}   value={extract($SETTINGS, "db.path")}   title="Путь к базе данных" on:click={onClick}/>
      <TextBox name="adam.ip"   style={styleAdamIp}   value={extract($SETTINGS, "adam.ip")}   title="Adam IP"/>
      <TextBox name="adam.rate" style={styleAdamRate} value={extract($SETTINGS, "adam.rate")} title="Частота опроса, мс"/>
      <TextBox name="com.hipot.name" style={styleComNameHipot} value={extract($SETTINGS, "com.hipot.name")} title="COM-Di30R"/>
      <TextBox name="com.hipot.rate" style={styleComRateHipot} value={extract($SETTINGS, "com.hipot.rate")} title="Baudrate"/>
      <TextBox name="com.rohms.name" style={styleComNameRohms} value={extract($SETTINGS, "com.rohms.name")} title="COM-CA6255"/>
      <TextBox name="com.rohms.rate" style={styleComRateRohms} value={extract($SETTINGS, "com.rohms.rate")} title="Baudrate"/>
    </div>
    <!-- ПАРАМЕТРЫ ИСПЫТАНИЙ -->
    <table class="table-test">
      <tr>
        <th>ВРЕМЕННЫЕ</th>
        {#each TEST.COLUMNS as col}
        <th>{col.label}</th>
        {/each}
      </tr>
      {#each TEST.ROWS as row}
      <tr class="table-cell">
        <th>{row.label}</th>
        {#each TEST.COLUMNS as col}
        {@const name = `${row.name}.${col.name}`}
        <td><input {name} value={extract($SETTINGS, name)}/></td>
        {/each}
      </tr>
      {/each}
    </table>
    <table class="table-test">
      <tr>
        <th>Di30R</th>
        {#each DI30R.COLUMNS as col}
        <th>{col.label}</th>
        {/each}
      </tr>
      {#each DI30R.ROWS as row}
      <tr class="table-cell">
        <th>{row.label}</th>
        {#each DI30R.COLUMNS as col}
        {@const name = `${row.name}.${col.name}`}
        <td><input {name} value={extract($SETTINGS, name)}/></td>
        {/each}
      </tr>
      {/each}
    </table>
  </div>
  <!-- ЦИФРОВЫЕ КАНАЛЫ -->
  <table class="table-digital">
    <tr>
      <th>ЦИФРОВЫЕ</th>
      {#each DIGITAL.COLUMNS as col}
      <th>{col.label}</th>
      {/each}
    </tr>
    {#each DIGITAL.ROWS as row}
    <tr class="table-cell">
      <th>{row.label}</th>
      {#each DIGITAL.COLUMNS as col}
      {@const name = `${row.name}.${col.name}`}
      <td><input {name} value={extract($SETTINGS, name)}/></td>
      {/each}
    </tr>
    {/each}
  </table>
  <!-- АНАЛОГОВЫЕ КАНАЛЫ -->
  <table class="table-analog">
    <tr>
      <th>АНАЛОГОВЫЕ</th>
      {#each ANALOG.COLUMNS as col}
      <th>{col.label}</th>
      {/each}
    </tr>
    {#each ANALOG.ROWS as row, i}
    <tr class="table-cell">
      <th>{row.label}</th>
      {#each ANALOG.COLUMNS as col}
      {@const name = `${row.name}.${col.name}`}
      <td><input {name} value={extract($SETTINGS, name)}/></td>
      {/each}
    </tr>
    {/each}
  </table>
  {/if}
</form>

<style>
  form {
    width: 1000px;
    height: 550px;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: auto auto;
    gap: 0.5em;
  }
  .grid11 {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    grid-row: 1;
    grid-column: 1;
  }
  .textboxes {
    width: 100%;
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
  .table-test {
    height: fit-content;
  }
  .table-digital {
    grid-column: 2;
    grid-row-start: 1;
    grid-row-end: 3;
    height: fit-content;
  }
  .table-analog {
    grid-column-start: 1;
    grid-column-end: 1;
    grid-row: 2;
    height: fit-content;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td, tr {
    border: 1px solid black;
  }
  th { cursor: default; }
  td { width: 80px; }
  .table-cell {
    text-align: end;
  }
  .table-cell th {
    font-style: italic;
    padding-right: 1ch;
  }
  .table-cell input {
    all: unset;
    width: 70px;
    padding-right: 1ch;
    background-color: beige;
  }
</style>