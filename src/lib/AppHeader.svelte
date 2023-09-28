<script lang="ts">
    import Modal from "./Components/Modal.svelte";
    import Settings from "./Settings.svelte";
    import { saveSettings } from "../stores/settings";
    import Button from "./Components/Button.svelte";
    import { switchAdamReading, ADAM_READING } from "../stores/equipment";

    let showModal = false;

    function onSubmit() {
      let form: HTMLFormElement = <HTMLFormElement>document.getElementById("settings-form");
      if (!form) {
        console.log("Cant find settings form");
      } else {
        saveSettings(new FormData(form), true);
      }
    }
    function onClick(command: string) {
      command === 'menu' && (showModal = !showModal);
      command === 'adam' && switchAdamReading();
    }

</script>

<div class="root" style={$$props.style}>
  <Modal style={$$props.style} bind:showModal onClick={onSubmit}>
    <h4 style="padding: 0; margin: 0; cursor: default;" slot="header">Параметры</h4>
    <Settings/>
  </Modal>
  <Button class="btn-menu" onClick={() => onClick('menu')}>
    <!-- <SvgMenu/> -->
    &#9776;
  </Button>
  <div class="header title">OOO «ЭПУ Сервис»: Испытание Гидрозащиты</div>
  <Button class="btn-menu" onClick={() => onClick('adam')}
    style="background: {$ADAM_READING ? 'green' : 'red'}; color: white;"
    >
    &#9881;
  </Button>
</div>

<style>
  .root {
    width: 100%;
    height: 3em;
    border-radius: 0.5em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .root :global(.btn-menu) {
    width: 38px;
    margin: 0 5px;
    color: black;
    font-size: large;
    font-weight: 800;
    background-color: inherit;

    &:hover {
      outline: 1px solid gray;
    }
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: larger;
    font-weight: 800;
  }
  
</style>