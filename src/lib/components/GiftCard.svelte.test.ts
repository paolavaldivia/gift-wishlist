import { describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import GiftCard from './GiftCard.svelte';
import type { Gift } from '$lib/types/gift';
import { userEvent } from '@testing-library/user-event';

const mockGift: Gift = {
	id: '1',
	name: 'Test Gift',
	description: 'A wonderful test gift',
	imagePath: 'https://example.com/image.jpg',
	approximatePrice: 50,
	currency: 'EUR',
	purchaseLinks: [{ siteName: 'Amazon', url: 'https://amazon.fr/test' }],
	isTaken: false,
	takenBy: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

describe('GiftCard Component', () => {
	test('renders gift information correctly', () => {
		render(GiftCard, { props: { gift: mockGift } });

		expect(screen.getByText('Test Gift')).toBeInTheDocument();
		expect(screen.getByText('A wonderful test gift')).toBeInTheDocument();
		expect(screen.getByText(/50,00/)).toBeInTheDocument();
		expect(screen.getByRole('img', { name: 'Test Gift' })).toBeInTheDocument();
	});

	test('shows available state when gift is not taken', () => {
		render(GiftCard, { props: { gift: mockGift } });

		expect(screen.getByRole('button', { name: /I'll get this gift/i })).toBeInTheDocument();
		expect(screen.queryByText(/taken/i)).not.toBeInTheDocument();
	});

	test('shows reserved state when gift is taken', () => {
		const takenGift = { ...mockGift, isTaken: true, takenBy: 'John Doe' };
		render(GiftCard, { props: { gift: takenGift } });

		expect(screen.getByText(/reserved/i)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /reserve/i })).not.toBeInTheDocument();
	});

	test('handles purchase links correctly', () => {
		render(GiftCard, { props: { gift: mockGift } });

		const purchaseLink = screen.getByRole('link', { name: /amazon/i });
		expect(purchaseLink).toBeInTheDocument();
		expect(purchaseLink).toHaveAttribute('href', 'https://amazon.fr/test');
		expect(purchaseLink).toHaveAttribute('target', '_blank');
		expect(purchaseLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('fires reserve event when reserve button is clicked', async () => {
		const user = userEvent.setup();
		const handleReserve = vi.fn();

		render(GiftCard, {
			props: {
				gift: mockGift,
				onReserve: handleReserve
			}
		});

		const reserveButton = screen.getByRole('button', { name: /I'll get this gift/i });
		await user.click(reserveButton);

		expect(handleReserve).toHaveBeenCalledWith(mockGift.id);
	});
});
