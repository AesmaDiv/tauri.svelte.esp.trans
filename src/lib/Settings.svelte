<script lang="ts">
  import { open } from "@tauri-apps/api/dialog";
  import TextBox from "./Components/TextBox.svelte";
  import { TEST, ANALOG, DIGITAL } from "../configs/cfg_menu";
  // import { $SETTINGS } from "../configs/cfg_application";
  import { extract } from "../shared/funcs";
  import { SETTINGS } from "../stores/settings";

  const db_style = "grid-column-start: 1; grid-column-end: 3;";

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
      <TextBox name="adam.ip" title="Adam IP" value={extract($SETTINGS, "adam.ip")}/>
      <TextBox name="adam.pulling_rate" title="Частота опроса, мс" value={extract($SETTINGS, "adam.pulling_rate")}/>
      <TextBox name="db.path" title="Путь к базе данных" value={extract($SETTINGS, "db.path")} style={db_style} on:click={onClick}/>
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
    {#each ANALOG.ROWS as row}
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
    width: 800px;
    height: 350px;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: 1fr auto;
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
    grid-template-rows: 1fr;
  }
  .table-test {
    height: fit-content;
  }
  .table-digital {
    grid-column: 2;
    grid-row: 1;
  }
  .table-analog {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row: 2;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td, tr {
    border: 1px solid black;
  }
  th { cursor: default; }
  .table-cell {
    text-align: end;
  }
  .table-cell th {
    font-style: italic;
    padding-right: 1ch;
  }
  .table-cell input {
    all: unset;
    width: 6ch;
    padding-right: 1ch;
    background-color: beige;
  }
</style>