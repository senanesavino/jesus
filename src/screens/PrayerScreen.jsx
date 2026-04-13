import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { prayers } from '../data/prayers';
import PrayerCard from '../components/PrayerCard';
import AudioPlayer from '../components/AudioPlayer';
import useStore from '../store/useStore';

export default function PrayerScreen() {
  const { isPremium } = useStore();
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', ...new Set(prayers.map((p) => p.category))];
  const filtered = filter === 'Todos' ? prayers : prayers.filter((p) => p.category === filter);

  if (selectedPrayer) {
    return (
      <div className="screen" style={{ paddingTop: '20px' }}>
        <button
          className="btn-ghost flex items-center gap-sm"
          onClick={() => setSelectedPrayer(null)}
          style={{ marginBottom: '20px', padding: '8px 0' }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <AudioPlayer prayer={selectedPrayer} />

        {/* Prayer text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
          style={{ marginTop: '20px' }}
        >
          <div className="text-overline" style={{ color: selectedPrayer.color, marginBottom: '12px' }}>
            Texto da oração
          </div>
          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: '1rem',
            lineHeight: 1.8, color: 'var(--text-primary)',
          }}>
            {selectedPrayer.text}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: '56px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-h1" style={{ marginBottom: '8px' }}>Orações em áudio</h1>
        <p className="text-body" style={{ marginBottom: '24px' }}>
          Ouça uma oração e permita que Jesus acalme o seu coração.
        </p>
      </motion.div>

      {/* Category filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex', gap: '8px', overflowX: 'auto',
          marginBottom: '24px', paddingBottom: '4px',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap',
              background: filter === cat ? 'var(--accent-olive)' : 'var(--bg-secondary)',
              color: filter === cat ? 'white' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Prayer list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((prayer, index) => (
          <PrayerCard
            key={prayer.id}
            prayer={prayer}
            onClick={setSelectedPrayer}
            index={index}
          />
        ))}
      </div>

      {/* Premium CTA */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '24px', padding: '20px', textAlign: 'center',
            background: 'var(--accent-gold-bg)', borderRadius: 'var(--radius-lg)',
          }}
        >
          <span style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}>🔓</span>
          <p style={{ fontSize: '0.875rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
            Desbloqueie todas as orações com o Premium
          </p>
        </motion.div>
      )}
    </div>
  );
}
