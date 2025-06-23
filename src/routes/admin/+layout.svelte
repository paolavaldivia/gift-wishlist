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

    function isActivePage(path: string): boolean {
        return page.url.pathname === path;
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
            <nav class="nav-links">
                <a
                  href="/admin/gifts"
                  class="nav-link {isActivePage('/admin/gifts') ? 'active' : ''}"
                  aria-current={isActivePage('/admin/gifts') ? 'page' : undefined}
                >
                    <span class="nav-icon">🎁</span>
                    Regular Gifts
                </a>
                <a
                  href="/admin/big-gifts"
                  class="nav-link {isActivePage('/admin/big-gifts') ? 'active' : ''}"
                  aria-current={isActivePage('/admin/big-gifts') ? 'page' : undefined}
                >
                    <span class="nav-icon">🎯</span>
                    Big Gifts
                </a>
            </nav>
            <button class="logout-btn" onclick={handleLogout} type="button">
                Logout
            </button>
        </header>
    {/if}

    <main class="admin-main">
        {@render children()}
    </main>
</div>

<style>
    .admin-layout {
        min-height: 100vh;
        background: var(--color-gray-50);
    }

    .admin-nav {
        background-color: var(--color-accent-darkest);
        color: var(--color-white);
        padding: var(--spacing-md) var(--spacing-xl);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: var(--z-dropdown);
        box-shadow: var(--shadow-sm);
    }

    .admin-logo h1 {
        font-size: var(--font-size-xl);
        color: var(--color-accent-light);
        margin: 0;
        font-weight: var(--font-weight-bold);
    }

    .admin-user {
        font-size: var(--font-size-sm);
        color: var(--color-accent-light);
    }

    .nav-links {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        text-decoration: none;
        color: var(--color-white);
        font-weight: var(--font-weight-medium);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
        position: relative;
    }

    .nav-link:hover {
        color: var(--color-primary);
        background: var(--color-primary-light);
    }

    .nav-link.active {
        color: var(--color-primary);
        background: var(--color-primary-light);
        font-weight: var(--font-weight-semibold);
    }

    .nav-link.active::after {
        content: '';
        position: absolute;
        bottom: -1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 2px;
        background: var(--color-primary);
    }

    .nav-icon {
        font-size: var(--font-size-lg);
    }

    .logout-btn {
        background: var(--color-danger-dark);
        color: var(--color-white);
        border: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }

    .logout-btn:hover {
        background: var(--color-danger-darkest);
    }

    .admin-main {
        flex: 1;
    }

    @media (max-width: 768px) {
        .admin-nav {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
        }

        .nav-links {
            width: 100%;
            justify-content: center;
        }

        .nav-link {
            flex: 1;
            justify-content: center;
            text-align: center;
        }

        .logout-btn {
            width: 100%;
        }
    }

    @media (max-width: 480px) {
        .nav-links {
            flex-direction: column;
            gap: 0.5rem;
        }

        .nav-link {
            width: 100%;
        }
    }
</style>