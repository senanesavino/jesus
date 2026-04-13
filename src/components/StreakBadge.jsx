import { Flame } from 'lucide-react';
import useStore from '../store/useStore';

export default function StreakBadge({ size = 'default' }) {
  const { streak } = useStore();

  if (size === 'compact') {
    return (
      <div className="streak-container">
        <span className="streak-flame">🔥</span>
        <span className="streak-count">{streak.current} dias</span>
      </div>
    );
  }

  return (
    <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔥</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--accent-gold)' }}>
        {streak.current}
      </div>
      <div className="text-body-sm" style={{ marginBottom: '16px' }}>dias seguidos com Jesus</div>

      <div className="flex justify-between" style={{ gap: '8px' }}>
        <div style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-olive)' }}>{streak.best}</div>
          <div className="text-caption">Melhor</div>
        </div>
        <div style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{streak.totalDays}</div>
          <div className="text-caption">Total</div>
        </div>
        <div style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-terracotta)' }}>{streak.totalMinutes}</div>
          <div className="text-caption">Minutos</div>
        </div>
      </div>
    </div>
  );
}
