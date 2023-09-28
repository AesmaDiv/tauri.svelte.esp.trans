<script lang='ts'>
    import Button from "./Button.svelte";

	export let showModal : boolean;
	export let onClick = () => {}

	let dialog : HTMLDialogElement;
	function _onClick(command: string) {
		dialog.close();
		showModal = false;
		command === "save" && onClick()
	}

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- on:close={() => (showModal = false)}
on:click|self={() => dialog.close()} -->
<dialog
	bind:this={dialog}
	on:cancel={() => showModal = false}
	style={$$props.style}
>
	<div on:keypress={e => e.key === 'Enter' && _onClick('save')} on:click|stopPropagation>
		<slot name="header"/>
		<hr />
		<slot />
		<hr />
		<!-- svelte-ignore a11y-autofocus -->
		<div class="buttons">
			<Button class="btn-modal" onClick={() => _onClick('reset')}>отмена</Button>
			<Button class="btn-modal" onClick={() => _onClick('save')}>сохранить</Button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		border-radius: 5px;
		border: none;
		padding: 0;

		&::backdrop {
			background: rgba(0, 0, 0, 0.3);
		}
		& > div {
			padding: 1em;
		}
		&[open] {
			animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
			&::backdrop {
				animation: fade 0.2s ease-out;
			}
		}
	}
	.buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		
	}
	.buttons :global(.btn-modal) {
		width: 10em;
		background-color: rgb(0, 200, 255);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

</style>