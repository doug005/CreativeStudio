import { ArrowUpRight, Clock3, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContentCard({ item, featured = false, variant = 'standard', index = 1 }) {
  const editorial = variant === 'explore';
  const publicationDate = item.publicationDate ? new Date(item.publicationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return <article className={`content-card${featured ? ' featured-card' : ''}${editorial ? ' explore-card' : ''}`}>
    <Link to={`/content/${item._id}`} className="card-image-link" aria-label={`Read ${item.title}`}>
      <div className="card-image" style={{ backgroundImage: `url("${item.thumbnailUrl || '/editorial-desk.jpg'}")` }}>
        {editorial ? <span className="explore-card-index">{String(index).padStart(2, '0')}</span> : <><span className="type-pill">{item.type}</span><span className="card-arrow"><ArrowUpRight size={18} /></span></>}
      </div>
    </Link>
    {editorial ? <div className="explore-card-copy"><div className="explore-card-category"><span>{item.category}</span><ArrowUpRight size={16} /></div><Link to={`/content/${item._id}`} className="card-title">{item.title}</Link><p>{item.description}</p><div className="explore-card-foot"><time>{publicationDate}</time><span>{item.type}</span></div></div> : <div className="card-copy">
      <div className="card-meta"><span>{item.category}</span><span>·</span><time>{publicationDate}</time></div>
      <Link to={`/content/${item._id}`} className="card-title">{item.title}</Link>
      <p>{item.description}</p>
      <div className="card-stats"><span><Eye size={14} /> {item.views || 0}</span><span><Heart size={14} /> {item.likes || 0}</span><span><Clock3 size={14} /> {item.type}</span></div>
    </div>}
  </article>;
}
