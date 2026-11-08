import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const { creator, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = document.querySelector('.site-nav')?.getBoundingClientRect().height || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  useEffect(() => {
    if (location.pathname !== '/') return;
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) scrollToSection(decodeURIComponent(location.hash.slice(1)));
      else window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  function navigateSection(event, id) {
    event.preventDefault();
    setOpen(false);
    const hash = `#${id}`;
    if (location.pathname === '/' && location.hash === hash) scrollToSection(id);
    else navigate({ pathname: '/', hash });
  }

  function navigateHome(event) {
    event.preventDefault();
    setOpen(false);
    if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else navigate('/');
  }

  return <header className="site-nav"><div className="nav-inner">
    <a href="/" className="brand" aria-label="CreativeStudio home"><span className="brand-mark">cs.</span><span className="brand-wordmark">Creative<span>Studio</span></span></a>
    <button className="icon-button menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    <nav className={open ? 'nav-links is-open' : 'nav-links'}>
      <a href="/" onClick={navigateHome}>Home</a>
      <a href="/#subjects" onClick={(event) => navigateSection(event, 'subjects')}>Subjects</a>
      {creator ? <Link to="/dashboard" className="nav-creator" onClick={() => setOpen(false)}>Creator studio <ArrowUpRight size={14} /></Link> : <a href="/#creator-access" className="nav-creator" onClick={(event) => navigateSection(event, 'creator-access')}>Creator login <ArrowUpRight size={14} /></a>}
      {creator && <button className="nav-logout" onClick={() => { logout(); setOpen(false); }}>Sign out</button>}
    </nav>
  </div></header>;
}
