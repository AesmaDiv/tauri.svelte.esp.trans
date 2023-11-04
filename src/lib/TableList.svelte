<script lang="ts">
  import { TESTLIST, readRecord, readTestList } from "../stores/database";
  import { RECORD_SEARCH_COLUMNS } from "../database/db_tables";
  import { haveUnsavedData } from "../testing/testing_hipot";
  import { isTestRunning } from "../stores/testing";
  import TextBox from "./Components/TextBox.svelte";
  import Button from "./Components/Button.svelte";
  import { showMessage, NotifierKind } from "./Notifier/notifier";


  let selected_row = 0;
  let search_params = { name: "", value: "" };
  let last = [];

  const hide = (key: string) => key === 'id' ? 'display: none' : '';
  async function onClick(event) {
    if (isTestRunning()) {
      showMessage("Выбор записей недоступен! Идёт испытание..", NotifierKind.WARNING);
      return;
    }
    // if (await haveUnsavedData()) return;
    let row: HTMLTableRowElement = <HTMLTableRowElement>event.target.parentElement;
    if (selected_row === (selected_row = parseInt(row.id) || 0)) return;
    let obj: Object = [...row.children].reduce((accum, current) => {
      return {...accum, [current.id]: current.innerHTML}
    }, {});
    readRecord(parseInt(obj['id']) || 0)
  }
  function onSearch(cmd: string) {
    if (Object.values(search_params).some(v => v !== '')) {
      let condition : string;
      if (cmd === 'clear') search_params = { name: '', value: ''};
      else condition = `${search_params.name} Like '%${search_params.value}%'`;
      readTestList({condition});
    }
  }
  function onPage(cmd: string) {
    if (!$TESTLIST.length) return;
    let condition = "ID > 0";
    if (cmd === 'inc') {
      const first_id = $TESTLIST[0].id;
      last.push(first_id);
      const last_id = $TESTLIST.slice(-1)[0].id;
      condition = `ID < ${last_id}`;
    } else if (last.length) {
      const last_id = last.pop();
      condition = last.length ? `ID <= ${last_id}` : 'ID > 0';
    } else return;

    // console.log("Page %s condition %s", last.length, condition);
    // console.log(last);

    readTestList({condition});
  }
  
</script>

<div class="root" style="{$$props.style} width: {$$props.width}; height: {$$props.height};">
  <div class="inner">
  <table class="table-list">
    <thead>
      {#if $$props.bindings }
        {#each Object.entries($$props.bindings) as [key, value]}
          <th style="{hide(key)}">{value}</th>
        {/each}
      {/if}
    </thead>
    <tbody>
      {#if $TESTLIST }
        {#each $TESTLIST as item, i}
        <tr id="{i + ''}" on:click={onClick} class="{i === selected_row ? 'selected' : ''}">
          {#each Object.keys($$props.bindings) as key}
            <td id={key} style="{hide(key)}">{item[key]}</td>
          {/each}
        </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  </div>
  <div class="search" on:keypress={e => e.key === 'Enter' && onSearch('apply')}>
    <TextBox title="Поле поиска" bind:value={search_params.name}
    select options={RECORD_SEARCH_COLUMNS} optionKey="label" optionValue="name"
    backgroundColor="white" style="width: 50%;"
    />
    <TextBox title="Искомое значение" bind:value={search_params.value}
    backgroundColor="white" style="width: 50%;"
    />
    <Button class="btn-style" onClick={() => onSearch("clear")}>⌫</Button>
    <Button class="btn-style" onClick={() => onSearch("apply")}>🔍</Button>
  </div>
  <div class="pages">
    <Button class="btn-style" onClick={() => onPage("dec")}>❰</Button>
    <Button class="btn-style" onClick={() => onPage("inc")}>❱</Button>
  </div>
</div>

<style>
  .root {
    --color-main: rgb(255,255,255);
    --color-hover: rgb(200,200,200);
    --color-select: rgb(220,220,220);
    --color-border: rgb(220,220,220);
    overflow: hidden;
    border-radius: 0.5em;
    width: 100%;
    height: 100%;
  }
  .inner {
    overflow-x: hidden;
    overflow-y: scroll;
    width: calc(100% - 10px);
    height: calc(100% - 10px - 2.5em);
    margin: 3px 3px;

    &::-webkit-scrollbar {
      width: 0.5em;
    } 
    &::-webkit-scrollbar-track {
      background-color: var(--color-main);
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-hover);
      z-index: 3;
    }
  }
  .table-list {
    width: 100%;
    border-collapse: collapse;
  }
  .table-list thead {
    background-color: var(--color-main);
    position: sticky;
    top: 0;
    text-align: left;
  }
  .table-list tr {
    background-color: var(--color-main);
    border-bottom: 1px solid var(--color-border);
    transition: background-color 250ms;
  }
  .table-list tr:hover {
    background-color: var(--color-hover);
  }
  .table-list tr.selected {
    background-color: var(--color-select);
  }
  .table-list th {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    padding-left: 0.5em;
    outline: 1px solid var(--color-border);
  }
  .table-list td {
    width: 1px;
    white-space: nowrap;
    cursor: default;
    padding-top: 0.3em;
    padding-bottom: 0.3em;
    padding-left: 0.5em;
    transition: padding-top 300ms, padding-bottom 300ms;
    
  }
  .search, .pages {
    width: calc(100% - 10px);
    display: flex;
    flex-direction: row;
    position: relative;
    left: 5px;
  }
  .search {
    height: 2.5em;
    gap: 5px;
  }
  .pages {
    justify-content: space-between;
    top: -5em;
  }
  .root :global(.btn-style) {
    width: 2em;
    height: 1.7em;
    margin-top: 0.3em;
    background-color: var(--color-border);
    color: black;
  }
</style>