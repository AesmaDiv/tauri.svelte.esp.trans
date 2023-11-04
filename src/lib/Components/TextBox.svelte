<script lang="ts">
  import { onMount, beforeUpdate } from "svelte";
  import { getInheritedColor, getInheritedBackgroundColor } from "../../shared/funcs";

  export let title: string = "Заголовок";
  export let value: any = "";

  let root: HTMLDivElement;
  let decor: HTMLDivElement;
  let label: HTMLLabelElement;
  let input: HTMLInputElement;
  let select: HTMLSelectElement;
  let textarea: HTMLTextAreaElement;

  let not_empty: boolean = false;
  let borderColor: string = '';

  onMount(() => {
    $$props.backgroundColor ??= getInheritedBackgroundColor(root);
    $$props.color ??= getInheritedColor(root);
  })

  beforeUpdate(() => {
    not_empty = !!value || value === 0;
    borderColor = $$props.required && !not_empty ? 'red' : $$props.borderColor || $$props.color;
  })

  function onFocus() {
    if (not_empty) return;
    decor?.classList.toggle('downed');
    label?.classList.toggle('lifted');
    label?.classList.toggle('downed');
  }
  function onChange() {
    if ($$props.onChange) $$props.onChange(value);
  }
</script>

<div bind:this={root} class="root"
  style="
  --backgroundColor: {$$props.backgroundColor};
  --borderColor: {borderColor};
  --color: {$$props.color};
  --width: {$$props.width};
  --fontSize: {$$props.fontSize};
  {$$props.style}
  "
  >
  <div bind:this={decor} class="decor {not_empty ? '' : 'downed'}" on:mouseleave={onFocus} on:mouseenter={onFocus}>
    <label bind:this={label} for="input" class="{not_empty ? 'lifted' : 'downed'}">{title}</label>
    {#if $$props.select}
      <select on:click bind:value={value} name={$$props.name} bind:this={select} class="input" on:change={onChange}>
        <option selected value></option>
        {#each $$props?.options as option}
          <option class="input" value={option[$$props.optionValue]}>{option[$$props?.optionKey]}</option>
        {/each}
      </select>
    {:else if $$props.lines}
      <textarea on:click bind:this={textarea} name={$$props.name} rows={$$props.lines} bind:value={value}/>
    {:else}
      <input on:click bind:this={input} name={$$props.name} readonly={$$props.readonly} class="input" bind:value={value}>
    {/if}
  </div>
</div>

<style>
  .root {
    width: var(--width);
    height: fit-content;
    padding: 0.3em 2px 2px;
    overflow: hidden;

    color: var(--color);
    font-size: var(--fontSize);
    background-color: var(--backgroundColor);
  }
  .decor {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    width: var(--width);
    border: 2px solid var(--borderColor);
    background-color: var(--backgroundColor);
    font-size: var(--fontSize);
    border-radius: 1ch;
    position: relative;
    padding: 0.3em;

    &.downed {
      overflow: hidden;
    }
  }
  input, select, option, textarea {
    all: unset;
    width: 100%;
    line-height: 1em;
    overflow: visible;
    background-color: var(--backgroundColor);
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    padding-left: 0.25em;
  }
  select {
    padding-top: 0.07em;
    padding-bottom: 0.07em;
  }
  label {
    all: unset;
    white-space: nowrap;
    line-height: 1em;
    background-color: var(--backgroundColor);
    position: absolute;
    transition-property: top, left, padding, opacity, font-size;
    transition-duration: 150ms;
    transition-timing-function: linear;
    cursor: pointer;
    pointer-events: none;

    &.downed {
      top: .3em;
      left: .3em;
      padding: 0.07em;
      opacity: 30%;
      font-size: 100%;
      width: calc(var(--width));
    }
    &.lifted {
      top: -0.6em;
      left: .8em;
      padding: 0.07em .2em;
      opacity: 100%;
      font-size: 60%;
      width: fit-content;
    }
  }

</style>