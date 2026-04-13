import { Heart, Share2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function VerseCard({ verse, reference, style = {} }) {
  const { toggleFavorite, isFavorite, openShareModal } = useStore();
  const fav = isFavorite('verses', reference);

  return (
    <div className="card animate-fade-in-up" style={{ ...style }}>
      <div className="text-overline" style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>
        ✦ Versículo do dia
      </div>

      <blockquote style={{ margin: 0, padding: 0 }}>
        <p className="verse-text">"{verse}"</p>
        <footer className="verse-reference">{reference}</footer>
      </blockquote>

      <div className="flex gap-sm" style={{ marginTop: '16px' }}>
        <button
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite('verses', { id: reference, text: verse, reference });
          }}
          style={{ color: fav ? '#C08B6E' : 'var(--text-muted)', width: 36, height: 36 }}
        >
          <Heart size={18} fill={fav ? '#C08B6E' : 'none'} />
        </button>
        <button
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            openShareModal({ type: 'verse', text: verse, reference });
          }}
          style={{ color: 'var(--text-muted)', width: 36, height: 36 }}
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
