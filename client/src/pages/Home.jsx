import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, LockKeyhole, Pause, Play, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = ['Technology', 'Education', 'Entertainment', 'Lifestyle', 'Creativity'];

export default function Home() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [subjectQuery, setSubjectQuery] = useState('');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredVisible, setFeaturedVisible] = useState(true);
  const [featuredPaused, setFeaturedPaused] = useState(false);
  const [featuredInteraction, setFeaturedInteraction] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const { creator, login, register } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    api('/contents')
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  const proof = useMemo(() => ({
    publications: items.length,
    views: items.reduce((total, item) => total + (item.views || 0), 0),
    likes: items.reduce((total, item) => total + (item.likes || 0), 0),
  }), [items]);
  const proofValue = (value) => loading || error ? '—' : value;
  const creatorNameValidation = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 3) return 'Name must be at least 3 characters.';
    if (trimmed.split(/\s+/u).length < 2) return 'Please include your surname.';
    return '';
  };
  const featured = items[featuredIndex] || items[0];
  useEffect(() => {
    if (items.length < 2 || featuredPaused || featuredInteraction || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let fadeTimer;
    const timer = window.setInterval(() => {
      setFeaturedVisible(false);
      fadeTimer = window.setTimeout(() => {
        setFeaturedIndex((current) => (current + 1) % items.length);
        setFeaturedVisible(true);
      }, 220);
    }, 3000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fadeTimer);
    };
  }, [items.length, featuredPaused, featuredInteraction]);
  const subjectItems = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.category} ${item.type}`.toLowerCase().includes(subjectQuery.trim().toLowerCase());
    return matchesQuery;
  }), [items, subjectQuery]);
  const fullCollectionUrl = subjectQuery.trim() ? `/explore?search=${encodeURIComponent(subjectQuery.trim())}` : '/explore';
  function changeCreatorName(value) {
    const withoutNumbers = value.replace(/[\p{N}]/gu, '');
    setName(withoutNumbers.slice(0, 30));
    setNameError(value !== withoutNumbers ? 'Names cannot include numbers.' : value.length > 30 ? 'Name must be 30 characters or fewer.' : '');
  }
  async function submitCreatorLogin(event) {
    event.preventDefault();
    if (authMode === 'signup' && creatorNameValidation(name)) {
      setNameError(creatorNameValidation(name));
      return;
    }
    setLoginBusy(true);
    setLoginError('');
    try {
      if (authMode === 'signup') await register(name, email, password);
      else await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (authMode === 'signup' && /name/i.test(err.message)) setNameError(err.message);
      else setLoginError(err.message);
    } finally {
      setLoginBusy(false);
    }
  }
  return <>
    <section className="studio-hero">
      <img className="studio-hero-image" src="/editorial-desk.jpg" alt="A warm, sunlit workspace with a notebook and coffee" />
      <div className="studio-hero-shade" aria-hidden="true" />
      <div className="studio-hero-content">
        <span className="studio-hero-kicker"><i /> A HOME FOR CREATIVE WORK</span>
        <h1>Make room for<br /><em>what moves you.</em></h1>
        <p>Stories, experiments, and ideas from a curious mind. Find a new perspective, follow a thought, and see where it takes you.</p>
        <a href="#subjects" className="studio-hero-cta">Explore the collection <ArrowDownRight size={17} /></a>
      </div>
      <div className="studio-hero-caption"><span>CREATIVE PRACTICE / OPENLY SHARED</span><span>MADE WITH INTENTION</span></div>
    </section>

    <section className="home-introduction section-wrap">
      <div><span className="eyebrow">A PLACE TO BEGIN</span><h2>Small ideas.<br /><em>Room to become.</em></h2></div>
      <div className="home-introduction-copy"><p>A considered collection of creative work: the lessons gathered along the way, the projects taking shape, and the everyday details worth noticing.</p><a href="#subjects" className="text-link">Find something interesting <ArrowRight size={15} /></a></div>
    </section>

    <section className="social-proof section-wrap" aria-label="Community activity">
      <div className="social-proof-intro"><span className="eyebrow">A SMALL, GROWING ARCHIVE</span><p>Every number comes from the work shared here.</p></div>
      <div className="proof-stat"><strong>{proofValue(proof.publications)}</strong><span>published pieces</span></div>
      <div className="proof-stat"><strong>{proofValue(proof.views.toLocaleString())}</strong><span>reader visits</span></div>
      <div className="proof-stat"><strong>{proofValue(proof.likes.toLocaleString())}</strong><span>appreciations</span></div>
    </section>

    {featured && <section className={`featured-story section-wrap${featuredVisible ? '' : ' is-fading'}`} onMouseEnter={() => setFeaturedInteraction(true)} onMouseLeave={() => setFeaturedInteraction(false)} onFocusCapture={() => setFeaturedInteraction(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFeaturedInteraction(false); }}><div className="featured-photo" style={{ backgroundImage: `url("${featured.thumbnailUrl || '/editorial-desk.jpg'}")` }}><span>FEATURED FROM THE COLLECTION</span></div><div className="featured-copy"><span className="eyebrow">A GOOD PLACE TO BEGIN <span>·</span> {featured.category}</span><h2>{featured.title}</h2><p>{featured.description}</p><div className="featured-story-actions"><Link to={`/content/${featured._id}`} className="text-link">Read the story <ArrowRight size={15} /></Link><button className="featured-pause" type="button" aria-label={featuredPaused ? 'Resume featured stories' : 'Pause featured stories'} title={featuredPaused ? 'Resume featured stories' : 'Pause featured stories'} onClick={() => { setFeaturedPaused((paused) => !paused); setFeaturedInteraction(false); }}>{featuredPaused ? <Play size={13} /> : <Pause size={13} />}</button></div><span className="featured-index">{String(featuredIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')} IN THE COLLECTION</span></div></section>}

    <section className="home-subjects section-wrap" id="subjects">
      <div className="home-subjects-heading"><div><span className="eyebrow">A LIVING COLLECTION</span><h2>Explore by <em>subject.</em></h2></div><p>Browse the latest stories, ideas, and experiments. Search for a thought or choose a subject to get started.</p></div>
      <div className="home-subjects-toolbar">
        <label className="home-subject-search"><Search size={17} /><input value={subjectQuery} onChange={(event) => setSubjectQuery(event.target.value)} placeholder="Search stories…" aria-label="Search published content" />{subjectQuery && <button aria-label="Clear search" onClick={() => setSubjectQuery('')}><X size={15} /></button>}</label>
        <div className="home-subject-filters" aria-label="Browse published content by subject"><Link className="active" to="/explore">All subjects</Link>{categories.map((category) => <Link key={category} to={`/explore?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      </div>
      <div className="home-subjects-meta"><span>{loading ? 'Gathering stories…' : `${subjectItems.length} ${subjectItems.length === 1 ? 'piece' : 'pieces'} in the collection`}</span><span>THE COLLECTION</span></div>
      {error ? <div className="home-subjects-empty" role="status">The collection is unavailable right now. Please try again in a moment.</div> : loading ? <div className="empty-state">Gathering the collection…</div> : subjectItems.length ? <><div className="content-grid explore-grid">{subjectItems.slice(0, 3).map((item, index) => <ContentCard key={item._id} item={item} variant="explore" index={index + 1} />)}</div><div className="home-subjects-more"><Link className="button button-quiet" to={fullCollectionUrl}>Show more pieces <ArrowRight size={15} /></Link></div></> : <div className="empty-results"><h3>{items.length ? 'No stories match that search.' : 'The collection is taking shape.'}</h3><p>{items.length ? 'Try another search.' : 'Check back soon for the first publication.'}</p>{subjectQuery && <button className="text-link" onClick={() => setSubjectQuery('')}>Clear search <X size={14} /></button>}</div>}
    </section>

    <section className="creator-access section-wrap" id="creator-access">
      <div className="creator-access-copy"><span className="eyebrow">A QUIETER CORNER OF THE STUDIO</span><h2>Your work,<br /><em>all in one place.</em></h2><p>Sign in to publish new work, plan what’s next, and take care of the conversations around it.</p><span className="creator-access-note"><LockKeyhole size={15} /> Private creator access</span></div>
      <div className="creator-access-panel">{creator ? <><span className="eyebrow">WELCOME BACK</span><h3>You’re signed in.</h3><p>Head back to your studio to manage your work.</p><Link className="button button-dark" to="/dashboard">Open creator studio <ArrowRight size={15} /></Link></> : <><span className="eyebrow">{authMode === 'signup' ? 'CREATE YOUR CREATOR ACCOUNT' : 'CREATOR SIGN IN'}</span><h3>{authMode === 'signup' ? 'Start your studio.' : 'Welcome back.'}</h3><form className="creator-access-form" onSubmit={submitCreatorLogin}>{authMode === 'signup' && <label>Your name<input type="text" autoComplete="name" minLength="3" maxLength="30" required value={name} onChange={(event) => changeCreatorName(event.target.value)} onBlur={() => setNameError(creatorNameValidation(name))} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'creator-name-error' : undefined} placeholder="First and surname" />{nameError && <span className="field-error" id="creator-name-error" role="alert">{nameError}</span>}</label>}<label>Email address<input type="email" autoComplete="username" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={authMode === 'signup' ? 12 : undefined} maxLength="200" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authMode === 'signup' ? 'At least 12 characters' : 'Your password'} />{loginError && <span className="field-error" role="alert">{loginError}</span>}</label><button className="button button-dark" disabled={loginBusy}>{loginBusy ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Enter your studio'} <ArrowRight size={15} /></button></form><p className="creator-access-footnote">{authMode === 'signup' ? 'By signing up, you’ll create a private creator account.' : 'This area is for the creator only.'}</p><p className="creator-access-switch">{authMode === 'signup' ? 'Already have an account?' : 'Don’t have an account?'} <button type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setLoginError(''); setNameError(''); }}>{authMode === 'signup' ? 'Sign in' : 'Sign up'}</button></p></>}</div>
    </section>
  </>;
}
