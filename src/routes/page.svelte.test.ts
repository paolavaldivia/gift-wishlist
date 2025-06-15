import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render header', () => {
		render(Page, { props: { data: { gifts: [] }, form: null } });
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
	});
	test('should render gift section', () => {
		render(Page, { props: { data: { gifts: [] }, form: null } });
		expect(screen.queryByRole('button', { name: 'Reserve' })).not.toBeInTheDocument();
	});
	test('should render gift section with gifts', () => {
		render(Page, {
			props: {
				data: {
					gifts: [
						{
							id: '1',
							name: 'Gift 1',
							description: 'Gift 1 description',
							imagePath: 'https://picsum.photos/600/400?random=1',
							approximatePrice: 100,
							currency: 'EUR',
							purchaseLinks: [
								{ siteName: 'Amazon', url: 'https://amazon.fr/sophie-girafe' },
								{ siteName: 'La Grande Récré', url: 'https://lagranderecre.fr/sophie' }
							],
							isTaken: false,
							takenBy: null,
							createdAt: new Date(),
							updatedAt: new Date()
						}
					]
				},
				form: null
			}
		});
		expect(screen.getByRole('button', { name: "I'll get this gift" })).toBeInTheDocument();
	});
	test('should render donation section', () => {
		render(Page, { props: { data: { gifts: [] }, form: null } });
		expect(screen.getByRole('button', { name: 'Contribute to the fund' })).toBeInTheDocument();
	});
});
