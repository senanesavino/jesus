import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, ChevronRight, Sparkles } from 'lucide-react';
import useStore from '../store/useStore';
import { devotionals, verseOfTheDay } from '../data/devotionals';
import { emotions } from '../data/emotions';
import { trails } from '../data/trails';
import DevotionalCard from '../components/DevotionalCard';
import VerseCard from '../components/VerseCard';
import StreakBadge from '../components/StreakBadge';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user, dailyMessage, fetchDailyMessage } = useStore();

  useEffect(() => {
    fetchDailyMessage();
  }, [fetchDailyMessage]);

  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;
  
  // Transform DB message to match original interface
  const realDevotional = dailyMessage ? {
    title: dailyMessage.title,
    subtitle: isNight ? 'Encerre seu dia com Deus.' : 'Uma palavra pra começar o dia.',
    verse: dailyMessage.verse,
    verseRef: dailyMessage.reference,
    message: dailyMessage.content,
    reflection: 'Que esta palavra encontre morada no seu coração e guie seus passos.',
    prayer: dailyMessage.prayer
  } : null;

  const devotional = realDevotional || (isNight ? devotionals.night : devotionals.morning);
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || 'Amado(a)';

  const quickEmotions = emotions.slice(0, 6);
  const activeTrails = trails.filter((t) => t.progress > 0).slice(0, 2);

  return (
    <div className={`screen ${isNight ? 'screen-night' : ''}`} style={{ paddingTop: '56px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
        style={{ marginBottom: '28px' }}
      >
        <div>
          <div className="text-caption" style={{ marginBottom: '4px', color: isNight ? 'var(--night-text-secondary)' : 'var(--text-muted)' }}>
            {greeting}, {firstName}
          </div>
          <h1 className="text-h2" style={{ color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
            {isNight ? 'Descanse no Senhor.' : 'Deus tem uma palavra para você.'}
          </h1>
        </div>
        <StreakBadge size="compact" />
      </motion.div>

      {/* Main devotional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: '24px' }}
      >
        <DevotionalCard
          devotional={devotional}
          isNight={isNight}
          onClick={() => navigate('/devotional', { state: { devotional, isNight } })}
        />
      </motion.div>

      {/* Play prayer button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: '28px' }}
      >
        <button
          className="btn btn-primary btn-block"
          onClick={() => navigate('/prayers')}
          style={{ padding: '16px 24px' }}
        >
          <Play size={18} />
          Ouvir oração do dia
        </button>
      </motion.div>

      {/* Verse of the day */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ marginBottom: '28px' }}
      >
        <VerseCard verse={verseOfTheDay.text} reference={verseOfTheDay.reference} />
      </motion.div>

      {/* How are you feeling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ marginBottom: '28px' }}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <h2 className="text-h3" style={{ color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
            Como você está hoje?
          </h2>
          <button
            className="btn-ghost"
            onClick={() => navigate('/emotions')}
            style={{ fontSize: '0.8125rem', color: 'var(--accent-olive)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Ver tudo <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {quickEmotions.map((emotion) => (
            <div
              key={emotion.id}
              onClick={() => navigate('/emotions', { state: { selectedEmotion: emotion } })}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                padding: '14px 8px', background: isNight ? 'var(--night-card)' : 'var(--bg-card)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1px solid ${isNight ? 'rgba(139,157,195,0.08)' : 'rgba(44,40,37,0.04)'}`,
                transition: 'all var(--transition-base)',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{emotion.emoji}</span>
              <span style={{ fontSize: '0.6875rem', color: isNight ? 'var(--night-text-secondary)' : 'var(--text-secondary)', fontWeight: 500 }}>
                {emotion.name}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active trails */}
      {activeTrails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginBottom: '28px' }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <h2 className="text-h3" style={{ color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
              Suas trilhas
            </h2>
            <button
              className="btn-ghost"
              onClick={() => navigate('/trails')}
              style={{ fontSize: '0.8125rem', color: 'var(--accent-olive)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Ver tudo <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTrails.map((trail) => (
              <div
                key={trail.id}
                onClick={() => navigate('/trails')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px', background: isNight ? 'var(--night-card)' : 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                  border: `1px solid ${isNight ? 'rgba(139,157,195,0.08)' : 'rgba(44,40,37,0.04)'}`,
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: trail.bgGradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {trail.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4, color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
                    {trail.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: 3, background: isNight ? 'rgba(139,157,195,0.15)' : 'rgba(44,40,37,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(trail.progress / trail.days) * 100}%`, background: trail.color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: trail.color, fontWeight: 500 }}>
                      {trail.progress}/{trail.days}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Premium teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div
          className="premium-banner"
          onClick={() => navigate('/premium')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center gap-sm" style={{ marginBottom: '8px' }}>
              <Sparkles size={16} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Premium
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '6px' }}>
              Vá mais fundo com Jesus
            </h3>
            <p style={{ fontSize: '0.8125rem', opacity: 0.85, marginBottom: '16px' }}>
              Trilhas completas, mais orações e conteúdos exclusivos.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem', fontWeight: 600,
            }}>
              Conhecer <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
