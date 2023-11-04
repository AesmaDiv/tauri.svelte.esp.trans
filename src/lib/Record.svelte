<script lang="ts">
  import { message } from "@tauri-apps/api/dialog";
  import TextBox from "./Components/TextBox.svelte";
  import Button from "./Components/Button.svelte";
  import { RECORD_COLUMNS } from "../database/db_tables";
  import { RECORD, updateRecord, resetRecord } from "../stores/database";


  let form : HTMLFormElement;
  function onClick(command: string) {
    ({
      reset: () => resetRecord(),
      save:  () => submitForm(),
    })[command]();
  }
  function submitForm(){
    let formdata = Object.fromEntries(new FormData(form).entries());
    let record = [...RECORD_COLUMNS, { name: 'sealtype' }]
    .filter(item => item.name in formdata)
    .reduce((obj, val) => {
      obj[val.name] = formdata[val.name];
      if (val.name.startsWith("n_") || val.name === 'id') obj[val.name] = parseInt(obj[val.name]);
      if (val.name.startsWith("f_")) obj[val.name] = parseFloat(obj[val.name]);
      return obj;
    }, {});
    if (checkRequired(record)) updateRecord(record);
  }
  function checkRequired(record: {}) : boolean {
    if (!record) return false;
    let result = RECORD_COLUMNS.filter(item => item.required).every(item => !!record[item.name]);
    if (!result) message('Не все необходимые поля заполнены', 'НВимание');
    return result;
  }

</script>

<form class="record-form" bind:this={form} method="POST">
  {#each RECORD_COLUMNS as item}
  {#if item.name === 'comments'}
    <TextBox name={item.name} title="{item.label}" lines={$RECORD[item.name]} value={$RECORD[item.name]}
      required={item.required} backgroundColor="white" 
      style="
        width: 100%;
        grid-column-start: {item.col};
        grid-row-start: {item.row};
        grid-column-end: 5;
        grid-row-end: 14;
      ";
    />
  {:else if item.row}
    <TextBox name={item.name} title="{item.label}" value={$RECORD[item.name]} round={item.round} 
      select={!!item.items} options={item.items} optionKey="name" optionValue="id"
      required={item.required} backgroundColor="white" 
      style="
        display: {item.col === 0 ? 'none' : ''};
        width: 100%;
        grid-column: {item.col};
        grid-row: {item.row};
      ";
    />
  {/if}
{/each}
  <Button class="buttons" style="grid-column: 1;" onClick={() => onClick('reset')}>новый</Button>
  <Button class="buttons" style="grid-column: 3;" onClick={() => onClick('save')}>сохранить</Button>
</form>

<style>
  .record-form {
    /* width: 100%; */
    display: grid;
    height: fit-content;
    overflow: visible;
    padding-top: 10px;
    grid-template-rows: repeat(11, 1fr);
    grid-template-columns: repeat(4, 250px);
    column-gap: 0.5em;
    row-gap: 0.5em;
  }
  .record-form :global(.buttons) {
    background-color: rgb(0, 200, 255);
    &:hover {
      outline: 1px solid white;
    }
  }


</style>