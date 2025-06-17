<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let show = false;
    export let title = '';
    export let onClose = () => {};

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
    <div 
        class="modal-backdrop" 
        on:click={handleBackdropClick}
        transition:fade={{ duration: 200 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <div 
            class="modal-content"
            transition:fly={{
                y: 50,
                duration: 300,
                easing: quintOut
            }}
        >
            <!-- Modal Header -->
            <header class="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button
                    class="close-button"
                    on:click={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>
            </header>

            <div class="modal-body">
                <slot></slot>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal);
        padding: var(--spacing-lg);
    }

    .modal-content {
        background: var(--color-white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
        border-bottom: 1px solid var(--color-gray-200);
    }

    .modal-header h2 {
        margin: 0;
        font-size: var(--font-size-2xl);
        color: var(--color-gray-800);
    }

    .close-button {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--color-gray-500);
        cursor: pointer;
        padding: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .close-button:hover {
        background: var(--color-gray-100);
        color: var(--color-gray-700);
    }

    .modal-body {
        padding: var(--spacing-xl);
    }

    @media (max-width: 768px) {
        .modal-backdrop {
            padding: var(--spacing-md);
        }

        .modal-content {
            max-height: 95vh;
        }
    }
</style>