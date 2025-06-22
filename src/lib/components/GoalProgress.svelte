<script lang="ts">

	import { formatPrice } from '$lib/util/format';

	let { targetAmount, currentAmount, currency }: {
		targetAmount: number;
		currentAmount: number;
		currency: string;
	} = $props();


	function getRemainingAmount(): number {
		return Math.max(targetAmount - currentAmount, 0);
	}

	function getProgressPercentage(): number {
		if (targetAmount === 0) return 0;
		return Math.min((currentAmount / targetAmount) * 100, 100);
	}

</script>

<div class="progress-info">
	<div class="current-amount">
		<span class="label">raised</span>
		<span class="amount">{formatPrice(currentAmount, currency)}</span>
	</div>
	<div class="remaining-amount">
		<span class="label">remaining</span>
		<span class="amount">{formatPrice(getRemainingAmount(), currency)}</span>
	</div>
</div>

<div class="progress-bar-container" role="progressbar"
		 aria-valuenow={getProgressPercentage()}
		 aria-valuemin="0"
		 aria-valuemax="100"
		 aria-label="Contribution progress">
	<div class="progress-bar" style:width="{getProgressPercentage()}%"></div>
</div>

<style>

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .current-amount,
    .remaining-amount {
        display: flex;
        flex-direction: column;
    }

    .current-amount .amount {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-success);
        align-items: start;
        text-align: start;
    }

    .remaining-amount .amount {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary);
        align-items: end;
        text-align: end;
    }

    .progress-info .label {
        font-size: var(--font-size-sm);
        color: var(--color-gray-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .progress-bar-container {
        position: relative;
        width: 100%;
        height: 8px;
        background: var(--color-gray-100);
        border-radius: var(--radius-full);
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 100%);
        border-radius: var(--radius-full);
        transition: width 0.8s ease;
        position: relative;
    }

    .progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
        animation: shimmer 4s infinite;
    }

    @keyframes shimmer {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(100%);
        }
    }

    @media (max-width: 768px) {
        .progress-info {
            gap: var(--spacing-sm);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .progress-bar {
            transition: none;
        }
    }
</style>