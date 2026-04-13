import { Play, Lock } from 'lucide-react';
import useStore from '../store/useStore';

export default function PrayerCard({ prayer, onClick, index = 0 }) {
  const { isPremium } = useStore();
  const locked = prayer.isPremium && !isPremium;

  return (
    <div
      className={`card animate-fade-in-up stagger-${index + 1}`}
      onClick={() => !locked && onClick(prayer)}
      style={{
        opacity: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: '16px',
        cursor: locked ? 'default' : 'pointer',
        position: 'relative',
      }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 'var(--radius-md)',
        background: prayer.bgGradient || `linear-gradient(135deg, ${prayer.color} 0%, ${prayer.color}88 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: '1.5rem',
      }}>
        {prayer.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 2 }}>{prayer.title}</h4>
        <span className="text-caption">{prayer.category} • {prayer.duration}</span>
      </div>

      {locked ? (
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent-gold-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Lock size={14} color="var(--accent-gold)" />
        </div>
      ) : (
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent-olive-bg)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Play size={14} color="var(--accent-olive)" style={{ marginLeft: 1 }} />
        </div>
      )}
    </div>
  );
}
