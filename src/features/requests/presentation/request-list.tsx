'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search, ArrowUpRight, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { api } from '@/shared/client-api';
import { money, shortDate } from '@/shared/format';
import { StatusBadge } from '@/components/status-badge';
import { statuses, type RequestPage } from '../domain/model';
export function RequestList({ initial }: { initial: RequestPage }) {
  const [search, setSearch] = useState(''),
    [q, setQ] = useState(''),
    [status, setStatus] = useState(''),
    [page, setPage] = useState(1);
  const params = new URLSearchParams({
    q,
    page: String(page),
    pageSize: '10',
    ...(status ? { status } : {}),
  });
  const query = useQuery({
    queryKey: ['requests', q, status, page],
    queryFn: () => api<RequestPage>('/api/requests?' + params),
    initialData: !q && !status && page === 1 ? initial : undefined,
    placeholderData: keepPreviousData,
  });
  const result = query.data;
  return (
    <section className="panel request-panel" aria-labelledby="requests-heading">
      <div className="panel-heading">
        <div>
          <h2 id="requests-heading">
            Purchase requests <span className="count">{result?.total ?? 0}</span>
          </h2>
          <p className="muted">From a good idea to a clear decision.</p>
        </div>
        <span className="small-note">All amounts in TRY</span>
      </div>
      <div className="table-tools">
        <search>
          <form
            className="search-field"
            onSubmit={(e) => {
              e.preventDefault();
              setQ(search);
              setPage(1);
            }}
          >
            <Search size={17} aria-hidden="true" />
            <label className="sr-only" htmlFor="search">
              Search requests
            </label>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests or suppliers…"
            />
            <button type="submit" className="text-button">
              Search
            </button>
          </form>
        </search>
        <label className="sr-only" htmlFor="status-filter">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option value={s} key={s}>
              {s === 'pending' ? 'Pending review' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {query.isError ? (
        <div className="error-box" role="alert">
          {query.error.message}{' '}
          <button onClick={() => query.refetch()} className="text-button">
            Try again
          </button>
        </div>
      ) : null}
      <div className="table-scroll" aria-busy={query.isFetching}>
        <table>
          <thead>
            <tr>
              <th scope="col">REQUEST / SUPPLIER</th>
              <th scope="col">CATEGORY</th>
              <th scope="col">AMOUNT</th>
              <th scope="col">STATUS</th>
              <th scope="col">CREATED</th>
              <th scope="col">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {result?.items.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link className="request-name" href={'/requests/' + r.id}>
                    {r.title}
                  </Link>
                  <span className="supplier">{r.supplier}</span>
                </td>
                <td>
                  <span className="category-label">{r.category}</span>
                </td>
                <td className="amount">{money(r.amountMinor)}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td className="date-cell">{shortDate(r.createdAt)}</td>
                <td>
                  <Link
                    className="row-link"
                    href={'/requests/' + r.id}
                    aria-label={'View ' + r.title}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {result?.items.length === 0 ? (
          <div className="empty-state">
            <Inbox size={30} />
            <h3>No requests found</h3>
            <p>Try another search or status, or create a new request.</p>
          </div>
        ) : null}
      </div>
      <div className="table-footer">
        <output className="muted">
          {query.isFetching
            ? 'Updating…'
            : result && result.total > 0
              ? 'Showing ' +
                ((page - 1) * 10 + 1) +
                '–' +
                Math.min(page * 10, result.total) +
                ' of ' +
                result.total +
                ' requests'
              : '0 requests'}
        </output>
        <div className="pagination">
          <button
            className="icon-button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>Page {page}</span>
          <button
            className="icon-button"
            aria-label="Next page"
            disabled={!result || page * 10 >= result.total}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
