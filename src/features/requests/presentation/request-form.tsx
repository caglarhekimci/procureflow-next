'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toMinorUnits } from '@/shared/format';
import type { CreateRequestInput } from '../domain/policy';
const schema = z.object({
  title: z.string().trim().min(3, 'Title must have at least 3 characters').max(100),
  supplier: z.string().trim().min(2, 'Enter a supplier name').max(100),
  category: z.enum(['Software', 'Equipment', 'Services', 'Travel']),
  amount: z.string().refine((v) => {
    try {
      const n = toMinorUnits(v);
      return n > 0 && n <= 1000000000;
    } catch {
      return false;
    }
  }, 'Enter an amount between 0.01 and 10,000,000.00'),
  description: z
    .string()
    .trim()
    .min(10, 'Describe the business need in at least 10 characters')
    .max(2000),
});
type Values = z.infer<typeof schema>;
export function RequestForm({ onSave }: { onSave: (input: CreateRequestInput) => Promise<void> }) {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { category: 'Software' } });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setError('');
        try {
          await onSave({
            title: values.title,
            supplier: values.supplier,
            category: values.category,
            description: values.description,
            amountMinor: toMinorUnits(values.amount),
          });
        } catch (e) {
          setError((e as Error).message);
        }
      })}
    >
      <div className="form-grid">
        {(['title', 'supplier'] as const).map((name) => (
          <div className="field" key={name}>
            <label htmlFor={name}>{name === 'title' ? 'Request title' : 'Supplier'}</label>
            <input
              id={name}
              {...register(name)}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? name + '-error' : undefined}
              placeholder={name === 'title' ? 'e.g. Design team software licenses' : 'e.g. Figma'}
            />
            {errors[name] ? (
              <p className="error-text" id={name + '-error'}>
                {errors[name].message}
              </p>
            ) : null}
          </div>
        ))}
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" {...register('category')}>
            {['Software', 'Equipment', 'Services', 'Travel'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="amount">Amount (TRY)</label>
          <input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            {...register('amount')}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
          {errors.amount ? (
            <p className="error-text" id="amount-error">
              {errors.amount.message}
            </p>
          ) : null}
        </div>
        <div className="field field-wide">
          <label htmlFor="description">Business justification</label>
          <textarea
            id="description"
            rows={5}
            placeholder="What does your team need, and why?"
            {...register('description')}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description ? (
            <p className="error-text" id="description-error">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>
      {error ? (
        <p role="alert" className="error-box">
          {error}
        </p>
      ) : null}
      <div className="form-footer">
        <p className="muted">Saved as a draft. Submit when you are ready.</p>
        <button className="button primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create draft'}
        </button>
      </div>
    </form>
  );
}
