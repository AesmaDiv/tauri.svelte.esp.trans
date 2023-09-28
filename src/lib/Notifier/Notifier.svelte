<script lang="ts">
  import { NOTIFIER, NotifierKind, type NotifierMessage } from "./notifier";

  let root : HTMLDivElement;
  let timeout : NodeJS.Timeout;
  let backgroundColor = "background-color: rgb(0, 200, 255);";

  function onChange(notifier: NotifierMessage) {
    if (root) {
      backgroundColor = ({
        [NotifierKind.ERROR]   : "background-color: red;",
        [NotifierKind.NORMAL]  : "background-color: rgb(0, 200, 255);",
        [NotifierKind.SUCCESS] : "background-color: green;",
        [NotifierKind.WARNING] : "background-color: orange;",
      })[notifier.kind];
      clearTimeout(timeout);
      root.classList.remove("hidden");
      timeout = setTimeout(() => {
        root.classList.add('hidden');
        clearTimeout(timeout);
      }, 3000);
    }
  }

  NOTIFIER.subscribe(onChange);
</script>

<div bind:this={root} class="root" style="{backgroundColor} {$$props.style}">{$NOTIFIER.text}</div>

<style>
  .root {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 0.5em;
    box-shadow: 2px 2px 15px gray;
    max-width: 50ch;
    max-height: 2em;
    padding: 0.5em;
    transition: all 500ms;
    overflow: hidden;
    cursor: default;
  }
  .root:global(.hidden) {
    color: transparent;
    max-width: 0ch;
    max-height: 0em;
  }
  .root:global(.hidden:hover) {
    color: white;
    max-width: 50ch;
    max-height: 2em;
  }
</style>