import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prayers } from '../data/prayers';
import PrayerCard from '../components/PrayerCard';
import AudioPlayer from '../components/AudioPlayer';
import useStore from '../store/useStore';

export default function PrayerScreen() {
  const navigate = useNavigate();
  const { isPremium, generateAIPrayer } = useStore();
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', ...new Set(prayers.map((p) => p.category))];
  const filtered = filter === 'Todos' ? prayers : prayers.filter((p) => p.category === filter);

  const handlePrayerSelect = async (prayer) => {
    // Lógica Híbrida:
    // 1. Orações Premium (Dinâmicas): Sempre gera uma nova via IA
    // 2. Orações Gratuitas (Fixas): Se tiver URL toca, se não tiver gera uma vez
    if (prayer.isPremium) {
      setLoading(true);
      try {
        const dynamic = await generateAIPrayer(prayer.title, false);
        setSelectedPrayer({
          ...prayer,
          prayer: dynamic.prayer,
          audio_url: dynamic.audio_url,
          id: `dynamic-${prayer.id}-${Date.now()}`
        });
      } catch (e) {
        console.error('Erro dynamic prayer:', e);
      } finally {
        setLoading(false);
      }
    } else {
      if (!prayer.audio_url) {
        setLoading(true);
        try {
          const generated = await generateAIPrayer(prayer.title, false, prayer.id, prayer.text);
          // O objeto será atualizado no arquivo prayers.js posteriormente por mim (Antigravity)
          setSelectedPrayer({
            ...prayer,
            prayer: generated.prayer,
            audio_url: generated.audio_url
          });
        } catch (e) {
          console.error('Erro fix prayer gen:', e);
          alert(`Ops! Não conseguimos preparar o áudio agora: ${e.message}. Tente novamente em alguns segundos.`);
        } finally {
          setLoading(false);
        }
      } else {
        setSelectedPrayer(prayer);
      }
    }
  };

  if (loading) {
    return (
      <div className="screen flex flex-col items-center justify-center" style={{ minHeight: '80vh', textAlign: 'center' }}>
        <div style={{ 
          width: 64, height: 64, border: '4px solid rgba(123,143,106,0.1)', 
          borderTopColor: 'var(--accent-olive)', borderRadius: '50%', 
          animation: 'spin 1s linear infinite', marginBottom: '24px' 
        }} />
        <h2 className="text-h2">Inspirando sua oração...</h2>
        <p className="text-body" style={{ maxWidth: '280px', marginTop: '12px' }}>
          Preparando uma mensagem única e especial para o seu momento com Deus.
        </p>
      </div>
    );
  }

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
            fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
            lineHeight: 1.8, color: 'var(--text-primary)',
          }}>
            {selectedPrayer.prayer || selectedPrayer.text}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: '56px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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

      {/* IA Personalized Prayer Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: '24px' }}
      >
        <button
          onClick={() => navigate('/custom-prayer')}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, #7B8F6A 0%, #5F734E 100%)',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'left',
            boxShadow: '0 8px 16px rgba(123, 143, 106, 0.15)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '2px' }}>Oração personalizada</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Fale com Deus sobre o seu momento.</div>
          </div>
          <ChevronRight size={18} opacity={0.6} />
        </button>
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
            onClick={() => handlePrayerSelect(prayer)}
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
