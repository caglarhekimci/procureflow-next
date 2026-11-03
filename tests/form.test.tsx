// @vitest-environment jsdom
import { it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { RequestForm } from '@/features/requests/presentation/request-form';
afterEach(cleanup);
it('exposes accessible required inputs and rejects empty submission', async () => {
  const save = vi.fn();
  render(<RequestForm onSave={save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
  expect(await screen.findByText(/Title must have at least/)).toBeVisible();
  expect(screen.getByLabelText('Amount (TRY)')).toHaveAttribute('aria-invalid', 'true');
  expect(save).not.toHaveBeenCalled();
});
it('submits integer minor units from a valid form', async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  render(<RequestForm onSave={save} />);
  await userEvent.type(screen.getByLabelText('Request title'), 'Design licenses');
  await userEvent.type(screen.getByLabelText('Supplier'), 'Figma');
  await userEvent.type(screen.getByLabelText('Amount (TRY)'), '250.29');
  await userEvent.type(
    screen.getByLabelText('Business justification'),
    'Annual seats for the design team',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Create draft' }));
  expect(save).toHaveBeenCalledWith({
    title: 'Design licenses',
    supplier: 'Figma',
    category: 'Software',
    amountMinor: 25029,
    description: 'Annual seats for the design team',
  });
});
