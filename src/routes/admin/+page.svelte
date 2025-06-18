<script lang="ts">
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';
    import { goto } from '$app/navigation';

    let error = $state<string | null>(null);
    let isLoading = $state(false);
    let showPassword = $state(false);
    
    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
</script>

<div class="login-container">
    <div class="login-card" transition:fly={{ y: 20, duration: 300 }}>
        <h1>Admin Login</h1>
        
        {#if error}
            <div class="error-message" transition:fly={{ y: -10, duration: 200 }}>
                {error}
            </div>
        {/if}
        
        <form 
            method="POST" 
            action="?/login" 
            use:enhance={() => {
                isLoading = true;
                error = null;
                
                return ({ result }) => {
                    isLoading = false;
                    console.log(result);
                    
                    if (result.type === 'failure') {
                        error = result.data?.message && typeof result.data.message === 'string' ? result.data.message : 'Login failed';
                    }
                    else if (result.type === 'redirect') {
                        goto(result.location, { replaceState: true });
                    }
                };
            }}
        >
            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-input-container">
                    <input 
                        type={showPassword ? "text" : "password"}
                        id="password" 
                        name="password" 
                        required 
                        autocomplete="current-password"
                    />
                    <button 
                        type="button" 
                        class="toggle-password-btn" 
                        onclick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {#if showPassword}
                            <!-- Eye slash icon (password visible) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        {:else}
                            <!-- Eye icon (password hidden) -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        {/if}
                    </button>
                </div>
            </div>
            
            <button type="submit" class="login-btn" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
        
        <div class="back-link">
            <a href="/">← Back to Gift Registry</a>
        </div>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: var(--color-gray-50);
        padding: 1rem;
    }
    
    .login-card {
        background-color: var(--color-white);
        padding: 2rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        width: 100%;
        max-width: 400px;
    }
    
    h1 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        text-align: center;
        color: var(--color-gray-800);
    }
    
    .error-message {
        background-color: var(--color-danger);
        color: var(--color-white);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        margin-bottom: 1.5rem;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: var(--font-weight-medium);
        color: var(--color-gray-700);
    }
    
    .password-input-container {
        position: relative;
        display: flex;
        align-items: center;
    }
    
    input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--color-gray-300);
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
    }
    
    input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-light);
    }
    
    .toggle-password-btn {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        color: var(--color-gray-500);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
    }
    
    .toggle-password-btn:hover {
        color: var(--color-gray-700);
    }
    
    .login-btn {
        width: 100%;
        padding: 0.75rem;
        background-color: var(--color-primary);
        color: var(--color-white);
        border: none;
        border-radius: var(--radius-md);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }
    
    .login-btn:hover:not(:disabled) {
        background-color: var(--color-primary-dark);
    }
    
    .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .back-link {
        margin-top: 1.5rem;
        text-align: center;
    }
    
    .back-link a {
        color: var(--color-primary);
        text-decoration: none;
        font-size: var(--font-size-sm);
    }
    
    .back-link a:hover {
        text-decoration: underline;
    }
</style>