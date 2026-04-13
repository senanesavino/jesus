import { Heart, Share2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function DevotionalCard({ devotional, isNight = false, onClick }) {
  const { toggleFavorite, isFavorite, openShareModal } = useStore();
  const fav = isFavorite('messages', devotional.title);

  return (
    <div
      className={`card ${isNight ? 'card-night' : 'card-featured'} animate-fade-in-up`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="text-overline" style={{ color: isNight ? 'var(--night-accent)' : 'var(--accent-olive)', marginBottom: '8px' }}>
        {isNight ? '🌙 Palavra da Noite' : '☀️ Palavra da Manhã'}
      </div>

      <h2 className="text-h2" style={{ marginBottom: '8px', color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
        {devotional.title}
      </h2>

      <p className="text-body" style={{ marginBottom: '16px', color: isNight ? 'var(--night-text-secondary)' : 'var(--text-secondary)' }}>
        {devotional.subtitle}
      </p>

      <div style={{
        padding: '16px',
        background: isNight ? 'var(--night-accent-soft)' : 'var(--accent-olive-bg)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '12px',
      }}>
        <p className="verse-text" style={{ fontSize: '0.9375rem', color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
          "{devotional.verse}"
        </p>
        <p className="verse-reference" style={{ color: isNight ? 'var(--night-accent)' : 'var(--accent-olive)' }}>
          {devotional.verseRef}
        </p>
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: '8px' }}>
        <span className="text-caption" style={{ color: isNight ? 'var(--night-text-secondary)' : 'var(--text-muted)' }}>
          Toque para ler mais
        </span>
        <div className="flex gap-sm">
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite('messages', { id: devotional.title, ...devotional });
            }}
            style={{ color: fav ? '#C08B6E' : (isNight ? 'var(--night-text-secondary)' : 'var(--text-muted)'), width: 36, height: 36 }}
          >
            <Heart size={18} fill={fav ? '#C08B6E' : 'none'} />
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              openShareModal({ type: 'devotional', ...devotional });
            }}
            style={{ color: isNight ? 'var(--night-text-secondary)' : 'var(--text-muted)', width: 36, height: 36 }}
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
