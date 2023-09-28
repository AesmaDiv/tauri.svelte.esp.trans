<script lang="ts">
  import { slide } from "svelte/transition";
  import type { SlideParams } from "svelte/transition"
  import { linear } from 'svelte/easing';
  
  export let title : string = "Заголовок";
  export let group : string = "Any";
  export let direction: string = "horizontal";
  export let background: string = "white"
  
  let is_vert = direction === "vertical";
  let options : SlideParams = {duration: 250, easing: linear, axis: is_vert ? 'x' : 'y'};
  let root : HTMLDivElement;
  const onSwitch = () => group = title;

  $: state = (() => {
    let result = group === title;
    root?.style.setProperty("--background", result ? background : "white");
    return result;
  })();

</script>

<div class="{ is_vert ? 'root-v' : 'root-h' }" style="{$$props.style}" bind:this={root}>
  <div class="{ is_vert ? 'header-v' : 'header-h' }" on:mousedown={onSwitch}>
    <div class="{ is_vert ? 'title-v' : 'title-h' }">{title}</div>
  </div>
  {#if state}
  <div class="container" transition:slide={options}>
    <slot/>
  </div>
  {/if}
</div>

<style>
  .root-v, .root-h {
    color: black;
    background-color: var(--background);
    border-radius: 5px;
    display: flex;
    transition: background-color 500ms, box-shadow 500ms;
  }
  .root-h {
    flex-direction: column;
    width: 100%;
    height: fit-content;
  }
  .root-v {
    flex-direction: row;
    width: fit-content;
  }
  .header-v, .header-h {
    cursor: pointer;
    white-space: nowrap;
  }
  .header-v {
    width: 2.5em;
    height: 100%;
  }
  .header-h {
    width: 100%;
    height: 2.5em;
  }
  .title-v, .title-h {
    font-size: large;
    user-select: none;
  }
  .title-v {
    margin: 1em 0em 0em 0.3em;
    transform-origin: 0 0;
    transform: rotate(90deg) translateY(-1.5em);
  }
  .title-h {
    margin: 0.6em;
  }
  .container {
    padding: 0.5em 0.5em 0.5em 0.5em;
  }
</style>