'use client';
import { useRouter } from 'next/navigation';
import { RequestForm } from './request-form';
import { api } from '@/shared/client-api';
import type { PurchaseRequest } from '../domain/model';
export function CreateRequest() {
  const router = useRouter();
  return (
    <RequestForm
      onSave={async (input) => {
        const request = await api<PurchaseRequest>('/api/requests', {
          method: 'POST',
          body: JSON.stringify(input),
        });
        router.push('/requests/' + request.id);
        router.refresh();
      }}
    />
  );
}
