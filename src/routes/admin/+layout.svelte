<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let { data, children } = $props();

    // Redirect to login if not authenticated and not on login page
    $effect(() => {
        if (!data.isAuthenticated && !data.isLoginPage && !page.url.pathname.includes('/admin/api/')) {
            goto('/admin');
        }
    });

    async function handleLogout() {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
                credentials: 'same-origin'
            });

            if (response.ok) {
                goto('/admin');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
</script>

<div class="admin-layout">
    {#if data.isAuthenticated && !data.isLoginPage}
        <header class="admin-nav">
            <div class="admin-logo">
                <h1>Gift Registry Admin</h1>
                {#if data.session}
                    <span class="admin-user">Welcome, {data.session.userId}</span>
                {/if}
            </div>
            <nav>
                <a href="/admin/gifts" class={page.url.pathname === '/admin/gifts' ? 'active' : ''}>
                    Manage Gifts
                </a>
                <button class="logout-button" onclick={handleLogout}>Logout</button>
            </nav>
        </header>
    {/if}

    <main class="admin-content">
        {@render children()}
    </main>
</div>

<style>
    .admin-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: var(--color-gray-50);
    }

    .admin-nav {
        background-color: var(--color-accent-darkest);
        color: var(--color-white);
        padding: var(--spacing-md) var(--spacing-xl);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .admin-logo h1 {
        font-size: var(--font-size-xl);
        color: var(--color-accent-light);
        margin: 0;
    }

    .admin-user {
        font-size: var(--font-size-sm);
        color: var(--color-accent-light);
        margin-left: var(--spacing-md);
    }

    nav {
        display: flex;
        gap: var(--spacing-xl);
        align-items: center;
    }

    nav a {
        color: var(--color-white);
        text-decoration: none;
        padding: var(--spacing-sm) 0;
        position: relative;
        transition: color var(--transition-fast);
    }

    nav a:hover {
        color: var(--color-accent-light);
    }

    nav a.active {
        color: var(--color-white);
    }

    nav a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--color-primary);
    }

    .logout-button {
        background-color: transparent;
        color: var(--color-white);
        border: 1px solid var(--color-accent-light);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .logout-button:hover {
        background-color: var(--color-primary-dark);
        color: var(--color-white);
    }

    .admin-content {
        flex: 1;
    }
</style>