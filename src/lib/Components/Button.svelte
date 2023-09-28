<script lang="ts">
  export let onClick = (event: Event) => {};
  export { className as class }
  let className = '';

  let root : HTMLDivElement;
  function _onClick(event: Event) {
    root.classList.toggle("unpressed");
    event.type === "mouseup" && onClick(event);
  }
</script>

<div bind:this={root} class="button unpressed {className}" id={$$props.id} style={$$props.style} 
  on:mouseup={_onClick} on:mousedown={_onClick}
  >
  <slot/>
</div>

<style>
  .button {
    all: unset;
    height: 2em;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;
    user-select: none;
    border-radius: 0.5em;
    box-shadow: 0px 1px 2px gray;
    color: white;
    padding-top: 2px;
    grid-row: 12;

    &.unpressed {
      box-shadow: 1px 3px 3px gray;
    }
  }
</style>