import { describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Modal from './Modal.svelte';

describe('Modal Component', () => {
	test('does not render when closed', () => {
		render(Modal, {
			props: {
				show: false,
				title: 'Test Modal'
			}
		});

		expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
	});

	test('renders when open', () => {
		render(Modal, {
			props: {
				show: true,
				title: 'Test Modal'
			}
		});

		// Use getByText instead of getByRole
		expect(screen.getByText('Test Modal')).toBeInTheDocument();

		// Or use querySelector to find the dialog element
		const dialog = document.querySelector('dialog.modal-backdrop');
		expect(dialog).toBeInTheDocument();
	});

	test('has proper accessibility attributes', () => {
		render(Modal, {
			props: {
				show: true,
				title: 'Accessible Modal'
			}
		});

		const dialog = document.querySelector('dialog.modal-backdrop');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
	});

	test('closes when escape key is pressed', async () => {
		const user = userEvent.setup();
		const handleClose = vi.fn();

		render(Modal, {
			props: {
				show: true,
				title: 'Test Modal',
				onClose: handleClose
			}
		});

		await user.keyboard('{Escape}');
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	test('closes when backdrop is clicked', async () => {
		const user = userEvent.setup();
		const handleClose = vi.fn();

		render(Modal, {
			props: {
				show: true,
				title: 'Test Modal',
				onClose: handleClose
			}
		});

		// Click on the modal backdrop using querySelector
		const dialog = document.querySelector('dialog.modal-backdrop');
		await user.click(dialog as HTMLElement);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});

	test('does not close when clicking modal content', async () => {
		const user = userEvent.setup();
		const handleClose = vi.fn();

		render(Modal, {
			props: {
				show: true,
				title: 'Test Modal',
				onClose: handleClose
			}
		});

		// Click on the modal content
		const modalContent = document.querySelector('.modal-content');
		await user.click(modalContent as HTMLElement);
		expect(handleClose).not.toHaveBeenCalled();
	});

	test('closes when close button is clicked', async () => {
		const user = userEvent.setup();
		const handleClose = vi.fn();

		render(Modal, {
			props: {
				show: true,
				title: 'Test Modal',
				onClose: handleClose
			}
		});

		const closeButton = screen.getByLabelText('Close modal');
		await user.click(closeButton);
		expect(handleClose).toHaveBeenCalledTimes(1);
	});
});
