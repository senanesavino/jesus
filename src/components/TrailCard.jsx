import { Lock, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function TrailCard({ trail, onClick, index = 0 }) {
  const { isPremium } = useStore();
  const locked = trail.isPremium && !isPremium;
  const progressPercent = trail.progress > 0 ? (trail.progress / trail.days) * 100 : 0;

  return (
    <div
      className={`trail-card animate-fade-in-up stagger-${index + 1}`}
      onClick={() => !locked && onClick(trail)}
      style={{ opacity: 0, position: 'relative' }}
    >
      <div
        className="trail-cover"
        style={{ background: trail.bgGradient || trail.bgColor }}
      >
        <span>{trail.emoji}</span>
      </div>

      <div className="trail-info">
        <div className="flex items-center gap-sm">
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1 }}>{trail.title}</h4>
          {locked ? (
            <Lock size={14} color="var(--accent-gold)" />
          ) : (
            <ChevronRight size={16} color="var(--text-muted)" />
          )}
        </div>
        <span className="text-caption">
          {trail.days} dias • {trail.category}
        </span>
        {trail.progress > 0 && !locked && (
          <>
            <div className="trail-progress">
              <div className="trail-progress-fill" style={{ width: `${progressPercent}%`, background: trail.color }} />
            </div>
            <span className="text-caption" style={{ color: trail.color }}>
              {trail.progress}/{trail.days} dias concluídos
            </span>
          </>
        )}
        {trail.progress === 0 && !locked && (
          <span className="text-caption" style={{ color: 'var(--accent-olive)' }}>Começar trilha</span>
        )}
        {locked && (
          <span className="badge badge-gold" style={{ width: 'fit-content', marginTop: 4 }}>Premium</span>
        )}
      </div>
    </div>
  );
}
