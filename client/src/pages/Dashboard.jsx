import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, Eye, FilePlus2, FileText, Heart, LayoutDashboard, LogOut, MessageCircle, Pencil, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, json } from '../services/api';
import { creatorInitials } from '../services/creator';

const blankForm = { title: '', description: '', category: 'Creativity', type: 'Article', thumbnailUrl: '', mediaUrl: '', articleBody: '', status: 'Draft', publicationDate: '' };
const categories = ['Technology', 'Education', 'Entertainment', 'Lifestyle', 'Creativity'];
const types = ['Article', 'Video', 'Image', 'Podcast'];
const localDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function ContentEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || blankForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const body = { ...form };
    if (body.status === 'Published' && initial?.status !== 'Published') body.publicationDate = new Date().toISOString();
    else if (body.status === 'Scheduled' || (body.status === 'Published' && body.publicationDate)) {
      body.publicationDate = new Date(body.publicationDate).toISOString();
    } else if (body.status === 'Published') body.publicationDate = new Date().toISOString();
    else body.publicationDate = null;
    try { await onSave(body); onClose(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}><section className="editor-modal"><div className="modal-heading"><div><span className="eyebrow">YOUR WORK, YOUR WAY</span><h2>{initial?._id ? 'Edit content' : 'Create something new'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><form onSubmit={submit} className="editor-form">
    <label>Title<input name="title" value={form.title} onChange={change} minLength="3" maxLength="140" required placeholder="Give it a thoughtful title" /></label>
    <label>Description<textarea name="description" value={form.description} onChange={change} minLength="8" maxLength="1200" rows="3" required placeholder="A short introduction to your work" /></label>
    <div className="form-two-col"><label>Category<select name="category" value={form.category} onChange={change}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Format<select name="type" value={form.type} onChange={change}>{types.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <label>Thumbnail URL<input name="thumbnailUrl" type="url" value={form.thumbnailUrl} onChange={change} placeholder="https://…" /></label>
    <label>Media URL {form.type === 'Article' ? '(optional)' : ''}<input name="mediaUrl" type="url" value={form.mediaUrl} onChange={change} placeholder="https://…" /></label>
    {form.type === 'Article' && <label>Article content<textarea name="articleBody" value={form.articleBody} onChange={change} rows="6" maxLength="50000" placeholder="Write your story here…" /></label>}
    <div className="form-two-col"><label>Status<select name="status" value={form.status} onChange={change}><option>Draft</option><option>Published</option><option>Scheduled</option></select></label>{form.status === 'Scheduled' && <label>Publish date & time<input type="datetime-local" name="publicationDate" value={form.publicationDate?.length > 16 ? localDateTime(form.publicationDate) : form.publicationDate} onChange={change} min={localDateTime(Date.now() + 60000)} required /></label>}</div>
    {error && <div className="notice error-notice">{error}</div>}<div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : initial?._id ? 'Save changes' : 'Save content'} <Check size={15} /></button></div>
  </form></section></div>;
}

export default function Dashboard() {
  const { creator, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [contents, setContents] = useState([]);
  const [comments, setComments] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    try {
      const [nextStats, nextContent, nextComments] = await Promise.all([api('/dashboard/stats'), api('/contents/manage'), api('/comments/manage')]);
      setStats(nextStats); setContents(nextContent); setComments(nextComments); setError('');
    } catch (err) { setError(err.message); if (err.message.toLowerCase().includes('session')) logout(); }
  }, [logout]);
  useEffect(() => { load(); }, [load]);
  if (!creator) return <Navigate to="/login" replace />;
  async function saveContent(body) {
    if (editor?._id) await api(`/contents/${editor._id}`, json('PUT', body));
    else await api('/contents', json('POST', body));
    setNotice(editor?._id ? 'Your changes are saved.' : 'Your new content is ready.'); await load();
  }
  async function removeContent(item) {
    if (!window.confirm(`Delete “${item.title}”? This also removes its comments and likes.`)) return;
    try { await api(`/contents/${item._id}`, { method: 'DELETE' }); setNotice('Content deleted.'); await load(); }
    catch (err) { setError(err.message); }
  }
  async function moderate(comment, action) {
    try { await api(`/comments/${comment._id}/moderate`, json('PATCH', { action })); setNotice(action === 'delete' ? 'Comment deleted.' : `Comment ${action}d.`); await load(); }
    catch (err) { setError(err.message); }
  }
  const filtered = contents.filter((item) => `${item.title} ${item.category} ${item.status}`.toLowerCase().includes(search.toLowerCase()));
  const statCards = stats ? [
    { title: 'Total content', value: stats.totalContent, icon: FileText, note: 'Across all formats' },
    { title: 'Published', value: stats.published, icon: ArrowUpRight, note: 'Out in the world' },
    { title: 'Total views', value: stats.views.toLocaleString(), icon: Eye, note: 'People stopping by' },
    { title: 'Comments', value: stats.comments, icon: MessageCircle, note: `${stats.pendingComments} waiting for you` },
  ] : [];
  const maxViews = Math.max(1, ...contents.map((item) => item.views || 0));
  return <div className="dashboard-page"><aside className="dash-sidebar"><div className="dash-brand"><span className="brand-mark">cs.</span><span className="brand-wordmark">Creative<span>Studio</span></span></div><span className="dash-label">YOUR STUDIO</span><nav className="dash-menu"><button className={tab === 'Overview' ? 'active' : ''} onClick={() => setTab('Overview')}><LayoutDashboard size={17} /> Overview</button><button className={tab === 'Content' ? 'active' : ''} onClick={() => setTab('Content')}><FileText size={17} /> My content <span>{contents.length}</span></button><button className={tab === 'Comments' ? 'active' : ''} onClick={() => setTab('Comments')}><MessageCircle size={17} /> Comments {stats?.pendingComments > 0 && <span className="pending-badge">{stats.pendingComments}</span>}</button></nav><div className="dash-sidebar-bottom"><div className="creator-mini"><div className="avatar">{creatorInitials(creator.name)}</div><div><strong>{creator.name}</strong><span>Creator account</span></div><button className="icon-button" aria-label="Sign out" onClick={logout}><LogOut size={16} /></button></div></div></aside>
    <main className="dash-main"><header className="dash-topbar"><div><span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span><strong>Good to see you, {creator.name.split(' ')[0]} <span>✳</span></strong></div><div className="dash-top-actions"><a href="/" target="_blank" rel="noreferrer" className="text-link">View public page <ArrowUpRight size={15} /></a><button className="button button-dark" onClick={() => { setEditor({ ...blankForm }); setTab('Content'); }}><Plus size={16} /> New content</button></div></header>
      {error && <div className="notice error-notice dash-notice">{error} <button onClick={load}>Try again</button></div>}{notice && <div className="notice success-notice dash-notice">{notice} <button aria-label="Dismiss" onClick={() => setNotice('')}><X size={15} /></button></div>}
      {tab === 'Overview' && <><div className="dash-welcome"><div><span className="eyebrow">YOUR CREATIVE STUDIO</span><h1>A good day to<br /><em>make something.</em></h1><p>Here’s what’s happening with your work.</p></div></div>
        <section className="stats-grid">{statCards.map(({ title, value, icon: Icon, note }) => <article className="stat-card" key={title}><div className="stat-card-top"><span>{title}</span><Icon size={16} /></div><strong>{value}</strong><small>{note}</small></article>)}</section>
        <section className="stats-compact"><div><span>DRAFTS</span><strong>{stats?.drafts || 0}</strong></div><div><span>SCHEDULED</span><strong>{stats?.scheduled || 0}</strong></div><div><span>TOTAL LIKES</span><strong><Heart size={14} /> {stats?.likes || 0}</strong></div></section>
        <div className="overview-lower"><section className="panel performance-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Recent content</h2></div><button className="text-link" onClick={() => setTab('Content')}>Manage all <ArrowUpRight size={14} /></button></div>{contents.slice(0, 4).map((item) => <div className="recent-row" key={item._id}><div className="tiny-cover" style={{ backgroundImage: `url("${item.thumbnailUrl}")` }} /><div className="recent-title"><strong>{item.title}</strong><span>{item.category} · {item.type}</span></div><span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span><span className="recent-views"><Eye size={14} /> {item.views || 0}</span></div>)}{!contents.length && <div className="empty-state">Your first story starts here.</div>}</section>
          <section className="panel engagement-panel"><div className="panel-heading"><div><span className="eyebrow">A LITTLE MOMENTUM</span><h2>Performance</h2></div><TrendingUp size={18} /></div><div className="popular-callout"><span>MOST VIEWED</span><strong>{stats?.popularContent?.title || 'No views yet'}</strong><small><Eye size={13} /> {stats?.popularContent?.views || 0} views</small></div>{[...contents].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4).map((item) => <div className="bar-row" key={item._id}><span>{item.title}</span><div className="bar-track"><i style={{ width: `${Math.max(3, ((item.views || 0) / maxViews) * 100)}%` }} /></div><small>{item.views || 0}</small></div>)}<div className="engagement-footer"><Heart size={14} /> {stats?.likes || 0} likes · {stats?.comments || 0} conversations</div></section></div>
      </>}
      {tab === 'Content' && <section className="management-view"><div className="management-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h1>My content</h1><p>Every story begins somewhere. Keep it moving.</p></div><button className="button button-dark" onClick={() => setEditor({ ...blankForm })}><FilePlus2 size={16} /> Create content</button></div><div className="content-toolbar"><label className="dash-search"><Search size={16} /><input placeholder="Find something…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><span>{filtered.length} pieces</span></div><div className="manage-table"><div className="manage-table-head"><span>CONTENT</span><span>STATUS</span><span>DATE</span><span>VIEWS</span><span>ACTIONS</span></div>{filtered.map((item) => <div className="manage-row" key={item._id}><div className="manage-item"><div className="tiny-cover" style={{ backgroundImage: `url("${item.thumbnailUrl}")` }} /><div><strong>{item.title}</strong><span>{item.category} · {item.type}</span></div></div><span><i className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</i></span><span>{item.publicationDate ? new Date(item.publicationDate).toLocaleDateString() : '—'}</span><span><Eye size={14} /> {item.views || 0}</span><span className="row-actions"><button title="Edit" onClick={() => setEditor({ ...item, publicationDate: item.publicationDate ? localDateTime(item.publicationDate) : '' })}><Pencil size={15} /></button><button title="Delete" onClick={() => removeContent(item)}><Trash2 size={15} /></button></span></div>)}{!filtered.length && <div className="empty-state">Nothing here yet. Make something new.</div>}</div></section>}
      {tab === 'Comments' && <section className="management-view"><div className="management-heading"><div><span className="eyebrow">COMMUNITY NOTES</span><h1>Comments</h1><p>Thoughtful conversation starts with you.</p></div><span className="comment-total"><MessageCircle size={18} /> {comments.length} total</span></div><div className="comment-moderation-list">{comments.map((comment) => <article className="moderation-card" key={comment._id}><div className="comment-avatar">{comment.displayName.slice(0, 1).toUpperCase()}</div><div className="moderation-content"><div className="comment-author"><strong>{comment.displayName}</strong><time>{new Date(comment.createdAt).toLocaleString()}</time><i className={`status-pill status-${comment.status.toLowerCase()}`}>{comment.status}</i></div><p>{comment.message}</p><span className="moderation-on">On: {comment.content?.title || 'Your content'}</span></div><div className="moderation-actions">{comment.status !== 'Approved' && <button title="Approve comment" onClick={() => moderate(comment, 'approve')}><Check size={16} /></button>}{comment.status !== 'Hidden' && comment.status !== 'Pending' && <button title="Hide comment" onClick={() => moderate(comment, 'hide')}><ChevronDown size={16} /></button>}{comment.status === 'Pending' && <button title="Hide comment" onClick={() => moderate(comment, 'hide')}><ChevronDown size={16} /></button>}<button title="Delete comment" onClick={() => moderate(comment, 'delete')}><Trash2 size={16} /></button></div></article>)}{!comments.length && <div className="empty-state">No comments yet. Conversation will find its way here.</div>}</div></section>}
    </main>{editor && <ContentEditor initial={editor} onClose={() => setEditor(null)} onSave={saveContent} />}</div>;
}
