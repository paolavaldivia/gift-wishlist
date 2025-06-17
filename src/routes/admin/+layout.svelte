
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';

    let { data } = $props();

    // Redirect to login if not authenticated and not on login page
    $effect(() => {
        if (!data.isAuthenticated && !data.isLoginPage && !page.url.pathname.includes('/admin/api/')) {
            goto('/admin');
        }
    });
    
    async function handleLogout() {
        const response = await fetch('/api/admin/logout', { method: 'POST' });
        if (response.ok) {
            goto('/admin');
        }
    }
</script>

<div class="admin-layout">
    {#if data.isAuthenticated && !data.isLoginPage}
        <header class="admin-nav">
            <div class="admin-logo">
                <h1>Gift Registry Admin</h1>
            </div>
            <nav>
                <a href="/admin/gifts" class={page.url.pathname === '/admin/gifts' ? 'active' : ''}>
                    Manage Gifts
                </a>
                <!-- Add more admin navigation links here as needed -->
                <button class="logout-button" onclick={handleLogout}>Logout</button>
            </nav>
        </header>
    {/if}
    
    <main class="admin-content">
        <slot />
    </main>
</div>

<style>
    .admin-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: var(--color-gray-50, #f9fafb);
    }
    
    .admin-nav {
        background-color: var(--color-gray-800, #1f2937);
        color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .admin-logo h1 {
        font-size: 1.25rem;
        margin: 0;
    }
    
    nav {
        display: flex;
        gap: 2rem;
        align-items: center;
    }
    
    nav a {
        color: var(--color-gray-300, #d1d5db);
        text-decoration: none;
        padding: 0.5rem 0;
        position: relative;
        transition: color 0.2s;
    }
    
    nav a:hover {
        color: white;
    }
    
    nav a.active {
        color: white;
    }
    
    nav a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--color-primary, #3b82f6);
    }
    
    .logout-button {
        background-color: transparent;
        color: var(--color-gray-300, #d1d5db);
        border: 1px solid var(--color-gray-600, #4b5563);
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .logout-button:hover {
        background-color: var(--color-gray-700, #374151);
        color: white;
    }
    
    .admin-content {
        flex: 1;
    }
</style>