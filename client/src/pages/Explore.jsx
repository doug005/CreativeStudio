import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { api } from '../services/api';

const categories = ['All work', 'Technology', 'Education', 'Entertainment', 'Lifestyle', 'Creativity'];
export default function Explore() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || 'All work');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { setQuery(params.get('search') || ''); setCategory(params.get('category') || 'All work'); }, [params]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const search = new URLSearchParams();
    if (query.trim()) search.set('search', query.trim());
    if (category !== 'All work') search.set('category', category);
    const timer = setTimeout(() => api(`/contents?${search}`).then((result) => { if (active) { setItems(result); setError(''); } }).catch((err) => { if (active) setError(err.message); }).finally(() => active && setLoading(false)), query ? 250 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [query, category]);
  function updateQuery(value) { setQuery(value); setParams((current) => { value ? current.set('search', value) : current.delete('search'); if (category !== 'All work') current.set('category', category); else current.delete('category'); return current; }, { replace: true }); }
  function updateCategory(value) { setCategory(value); setParams((current) => { value !== 'All work' ? current.set('category', value) : current.delete('category'); if (query) current.set('search', query); else current.delete('search'); return current; }, { replace: true }); }
  const resultLabel = useMemo(() => `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`, [items.length]);
  return <div className="explore-page section-wrap">
    <div className="page-kicker"><span>— &nbsp; FIND YOUR NEXT THREAD</span></div>
    <div className="explore-heading"><div><span className="eyebrow">A COLLECTION OF THOUGHTS & MAKING</span><h1>Ideas that <em>stay with you.</em></h1></div><p>From small discoveries to bigger questions, find a story that meets you where your curiosity is.</p></div>
    <div className="explore-toolbar">
      <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search stories…" aria-label="Search content" />{query && <button aria-label="Clear search" onClick={() => updateQuery('')}><X size={16} /></button>}</label>
      <div className="filter-tabs" role="group" aria-label="Filter by category">{categories.map((item) => <button key={item} onClick={() => updateCategory(item)} className={category === item ? 'active' : ''}>{item}</button>)}</div>
    </div>
    <div className="explore-results-line"><span>{error ? '— pieces' : loading ? 'Finding stories…' : resultLabel}</span><span>{category === 'All work' ? 'THE COLLECTION' : category.toUpperCase()}</span></div>
    {error ? <div className="explore-error" role="status">The collection is unavailable right now. Please try again in a moment.</div> : loading ? <div className="empty-state">Gathering the collection…</div> : items.length ? <div className="content-grid explore-grid">{items.map((item, index) => <ContentCard key={item._id} item={item} variant="explore" index={index + 1} />)}</div> : <div className="empty-results"><span>⌕</span><h2>Nothing on this page just yet.</h2><p>Try another search or category. There is always more to discover.</p><button className="text-link" onClick={() => { updateQuery(''); updateCategory('All work'); }}>Clear filters <X size={14} /></button></div>}
  </div>;
}
