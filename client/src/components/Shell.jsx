import { Link, Outlet } from 'react-router-dom';
import SiteNav from './SiteNav';
import { useCreatorProfile } from '../context/CreatorContext';

export default function Shell() {
  const creator = useCreatorProfile();
  return <><SiteNav /><main><Outlet /></main><footer className="site-footer"><div className="footer-inner"><Link to="/" className="brand" aria-label="CreativeStudio home"><span className="brand-mark">cs.</span><span className="brand-wordmark">Creative<span>Studio</span></span></Link><span>Thoughtful work, shared openly.</span><span>© {new Date().getFullYear()} {creator?.name || 'CreativeStudio'}</span></div></footer></>;
}
