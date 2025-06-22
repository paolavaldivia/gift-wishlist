export function formatPrice(price: number, currency: string) {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: currency
	}).format(price);
}
