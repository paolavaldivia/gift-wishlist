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
	purchaseLinks: [{ siteName: 'Site', url: 'https://site.fr/test' }],
	isTaken: false,
	takenBy: null,
	createdAt: new Date(),
	updatedAt: new Date()
};

describe('GiftCard Component', () => {
	test('renders gift information correctly', () => {
		render(GiftCard, { props: { gift: mockGift } });

		expect(screen.getByText(mockGift.name)).toBeInTheDocument();
		expect(screen.getByText(mockGift.description)).toBeInTheDocument();
		expect(screen.getByText(mockGift.approximatePrice, { exact: false })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: mockGift.purchaseLinks[0].siteName })).toHaveAttribute(
			'href',
			mockGift.purchaseLinks[0].url
		);
		expect(screen.getByRole('img', { name: mockGift.name })).toBeInTheDocument();
	});

	test('shows available state when gift is not taken', () => {
		render(GiftCard, { props: { gift: mockGift } });

		expect(screen.getByRole('button', { name: /I'll get this gift/i })).toBeInTheDocument();
		expect(screen.queryByText(/taken/i)).not.toBeInTheDocument();
	});

	test('shows reserved state when gift is taken when name is not hidden', () => {
		const takenGift = { ...mockGift, isTaken: true, takenBy: 'John Doe', hideReserverName: false };
		render(GiftCard, { props: { gift: takenGift } });

		expect(screen.getByText(/reserved/i)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /reserve/i })).not.toBeInTheDocument();
		expect(screen.getByText(takenGift.takenBy)).toBeInTheDocument();
	});

	test('shows reserved state when gift is taken when name is hidden', () => {
		const takenGift = { ...mockGift, isTaken: true, takenBy: 'John Doe', hideReserverName: true };
		render(GiftCard, { props: { gift: takenGift } });

		expect(screen.getByText(/reserved/i)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /reserve/i })).not.toBeInTheDocument();
		expect(screen.queryByText(takenGift.takenBy)).not.toBeInTheDocument();
		expect(screen.getByText(/anonymous/i)).toBeInTheDocument();
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
