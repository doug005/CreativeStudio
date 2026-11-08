import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Clock3, Eye, Heart, Link2, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { api, json, viewerKey } from '../services/api';
import { useCreatorProfile } from '../context/CreatorContext';
import { creatorInitials } from '../services/creator';

export default function ContentDetail() {
  const { id } = useParams();
  const creator = useCreatorProfile();
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const commentNameValidation = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return 'Name must be at least 3 characters.';
    if (trimmed.split(/\s+/u).length < 2) return 'Please include your surname.';
    return '';
  };
  useEffect(() => {
    let active = true;
    api(`/contents/${id}`).then((content) => { if (active) setItem(content); }).catch((err) => active && setError(err.message));
    api(`/comments/${id}`).then((rows) => active && setComments(rows)).catch(() => {});
    const viewKey = `creatorspace-viewed-${id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, '1');
      api(`/contents/${id}/view`, json('POST', {})).then((result) => active && setItem((current) => current && ({ ...current, views: result.views }))).catch(() => {});
    }
    setLiked(localStorage.getItem(`creatorspace-liked-${id}`) === '1');
    return () => { active = false; };
  }, [id]);
  async function like() {
    try {
      const result = await api('/likes', json('POST', { contentId: id, viewerKey: viewerKey() }));
      setItem((current) => ({ ...current, likes: result.likes }));
      setLiked(true); localStorage.setItem(`creatorspace-liked-${id}`, '1'); setNotice('Thanks for showing some love.');
    } catch (err) { setError(err.message); }
  }
  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setNotice(`Copy this link: ${window.location.href}`); }
  }
  async function submitComment(event) {
    event.preventDefault(); setNotice(''); setError('');
    if (commentNameValidation(name)) {
      setNameError(commentNameValidation(name));
      return;
    }
    try {
      const result = await api('/comments', json('POST', { contentId: id, displayName: name, message }));
      setNotice(result.message); setMessage(''); setNameError('');
    } catch (err) {
      if (/name/i.test(err.message)) setNameError(err.message);
      else setError(err.message);
    }
  }
  function changeCommentName(value) {
    const withoutNumbers = value.replace(/[\p{N}]/gu, '');
    setName(withoutNumbers.slice(0, 30));
    setNameError(value !== withoutNumbers ? 'Names cannot include numbers.' : value.length > 30 ? 'Name must be 30 characters or fewer.' : '');
  }
  if (error && !item) return <div className="section-wrap error-page"><Link to="/explore" className="text-link"><ArrowLeft size={16} /> Back to the library</Link><h1>We couldn't find that story.</h1><p>{error}</p></div>;
  if (!item) return <div className="section-wrap empty-state">Opening the story…</div>;
  const date = new Date(item.publicationDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const youtubeId = item.type === 'Video' && item.mediaUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)?.[1];
  return <article className="detail-page section-wrap">
    <div className="page-kicker"><Link to="/explore"><ArrowLeft size={13} /> THE LIBRARY</Link><span>FIELD NOTE NO. {String(item._id).slice(-4).toUpperCase()}</span></div>
    <header className="detail-header"><span className="eyebrow">{item.category} <span>·</span> {item.type}</span><h1>{item.title}</h1><p className="detail-deck">{item.description}</p><div className="detail-byline"><div className="avatar">{creator?.avatarUrl ? <img src={creator.avatarUrl} alt="" /> : creatorInitials(creator?.name)}</div><div><strong>{creator?.name || 'The creator'}</strong><span>Published {date}</span></div><div className="detail-metrics"><span><Eye size={15} /> {item.views || 0}</span><span><Heart size={15} /> {item.likes || 0}</span><span><Clock3 size={15} /> 4 min read</span></div></div></header>
    <div className="detail-visual" style={{ backgroundImage: `url("${item.thumbnailUrl || '/editorial-desk.jpg'}")` }}><span>{item.type} / {item.category}</span></div>
    <div className="detail-body"><div className="article-copy">
      {item.type === 'Video' && youtubeId && <div className="media-embed"><iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}`} title={item.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>}
      {item.type === 'Podcast' && item.mediaUrl && <audio className="audio-player" controls src={item.mediaUrl}>Your browser does not support audio.</audio>}
      {item.type === 'Image' && item.mediaUrl && <a className="media-open" href={item.mediaUrl} target="_blank" rel="noreferrer">View full-size image <ArrowUpRight size={15} /></a>}
      {item.articleBody ? item.articleBody.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{item.description}</p>}
      {item.type === 'Video' && item.mediaUrl && !youtubeId && <a className="media-open" href={item.mediaUrl} target="_blank" rel="noreferrer">Open video <ArrowUpRight size={15} /></a>}
      {item.type === 'Article' && !item.articleBody && item.mediaUrl && <a className="media-open" href={item.mediaUrl} target="_blank" rel="noreferrer">Continue reading <ArrowUpRight size={15} /></a>}
      <div className="article-actions"><button className={liked ? 'like-button liked' : 'like-button'} onClick={like}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'You liked this' : 'Give this a like'} <span>{item.likes || 0}</span></button><button className="share-button" onClick={share}>{copied ? <Check size={16} /> : <Link2 size={16} />}{copied ? 'Link copied' : 'Copy link'}</button></div>
      <section className="comments-section"><div className="comments-heading"><span className="eyebrow">JOIN THE CONVERSATION</span><h2>Thoughts & replies <span>{comments.length}</span></h2></div>
        {comments.length ? <div className="comment-list">{comments.map((comment) => <div className="comment" key={comment._id}><div className="comment-avatar">{comment.displayName.slice(0, 1).toUpperCase()}</div><div><div className="comment-author"><strong>{comment.displayName}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div><p>{comment.message}</p></div></div>)}</div> : <p className="no-comments">No replies yet. Be the first to share a thought.</p>}
        <form className="comment-form" onSubmit={submitComment}><label>Your name<input value={name} onChange={(event) => changeCommentName(event.target.value)} onBlur={() => setNameError(commentNameValidation(name))} minLength="3" maxLength="30" required aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'comment-name-error' : undefined} placeholder="First and surname" />{nameError && <span className="field-error" id="comment-name-error" role="alert">{nameError}</span>}</label><label>Your comment<textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength="2" maxLength="1000" required placeholder="Add something thoughtful…" rows="4" /></label><div className="form-submit-row"><span>Comments appear after creator approval.</span><button className="button button-dark" type="submit">Send thought <Send size={14} /></button></div></form>
        {notice && <p className="inline-notice">{notice}</p>}{error && <p className="inline-error">{error}</p>}
      </section>
    </div><aside className="detail-aside"><span className="eyebrow">IN THIS PIECE</span><div><span>TOPIC</span><strong>{item.category}</strong></div><div><span>FORMAT</span><strong>{item.type}</strong></div><div><span>SHARED</span><strong>{date}</strong></div><div className="aside-note">Thanks for spending a little time here.<br /><span>— {creator?.name || 'The creator'}</span></div><Link to="/explore" className="text-link">Explore more <ArrowUpRight size={14} /></Link></aside></div>
  </article>;
}
