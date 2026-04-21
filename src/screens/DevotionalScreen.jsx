import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Play } from 'lucide-react';
import { devotionals } from '../data/devotionals';
import AudioPlayer from '../components/AudioPlayer';
import useStore from '../store/useStore';

export default function DevotionalScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleFavorite, isFavorite, openShareModal } = useStore();

  const devotional = location.state?.devotional || devotionals.morning;
  const isNight = location.state?.isNight || false;
  const fav = isFavorite('messages', devotional.title);

  return (
    <div className={`screen ${isNight ? 'screen-night' : ''}`} style={{ paddingTop: '20px' }}>
      {/* Back */}
      <button
        className="btn-ghost flex items-center gap-sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', padding: '8px 0', color: isNight ? 'var(--night-text-secondary)' : 'var(--text-secondary)' }}
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '8px' }}
      >
        <span className="text-overline" style={{ color: isNight ? 'var(--night-accent)' : 'var(--accent-olive)' }}>
          {isNight ? '🌙 Palavra da Noite' : '☀️ Palavra da Manhã'}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-display"
        style={{ marginBottom: '8px', color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}
      >
        {devotional.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-body"
        style={{ marginBottom: '28px', fontStyle: 'italic', color: isNight ? 'var(--night-text-secondary)' : 'var(--text-secondary)' }}
      >
        {devotional.subtitle}
      </motion.p>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: '24px' }}
      >
        <p style={{
          fontSize: '1.0625rem', lineHeight: 1.85, color: isNight ? 'var(--night-text)' : 'var(--text-primary)',
        }}>
          {devotional.message}
        </p>
      </motion.div>

      {/* Verse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px',
          background: isNight ? 'var(--night-accent-soft)' : 'var(--accent-olive-bg)',
          borderLeft: `3px solid ${isNight ? 'var(--night-accent)' : 'var(--accent-olive)'}`,
        }}
      >
        <p className="verse-text" style={{ color: isNight ? 'var(--night-text)' : 'var(--text-primary)' }}>
          "{devotional.verse}"
        </p>
        <p className="verse-reference" style={{ color: isNight ? 'var(--night-accent)' : 'var(--accent-olive)' }}>
          {devotional.verseRef}
        </p>
      </motion.div>

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={isNight ? 'card-night' : 'card'}
        style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}
      >
        <div className="text-overline" style={{
          color: isNight ? 'var(--night-accent)' : 'var(--accent-gold)', marginBottom: '12px',
        }}>
          ✦ Reflexão
        </div>
        <p style={{
          fontStyle: 'italic', lineHeight: 1.8,
          color: isNight ? 'var(--night-text)' : 'var(--text-secondary)',
        }}>
          {devotional.reflection}
        </p>
      </motion.div>

      {/* Prayer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={isNight ? 'card-night' : 'card'}
        style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}
      >
        <div className="text-overline" style={{
          color: isNight ? 'var(--night-accent)' : 'var(--accent-terracotta)', marginBottom: '12px',
        }}>
          🙏 Oração
        </div>
        <p style={{
          fontFamily: 'var(--font-serif)', lineHeight: 1.8, fontSize: '1rem',
          color: isNight ? 'var(--night-text)' : 'var(--text-primary)',
        }}>
          {devotional.prayer}
        </p>
      </motion.div>

      {/* Audio player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ marginBottom: '24px' }}
      >
        <AudioPlayer
          prayer={{
            id: `devotional-${devotional.period}`,
            title: `Oração: ${devotional.title}`,
            category: devotional.period === 'noite' ? 'Noite' : 'Manhã',
            duration: devotional.audioDuration || '2:00',
            durationSeconds: devotional.audioDuration 
              ? (parseInt(devotional.audioDuration.split(':')[0]) * 60 + parseInt(devotional.audioDuration.split(':')[1]))
              : 120,
            emoji: isNight ? '🌙' : '☀️',
            bgGradient: isNight
              ? 'linear-gradient(135deg, #1A1926 0%, #2A2942 50%, #3A3960 100%)'
              : 'linear-gradient(135deg, #7B8F6A 0%, #A3B496 50%, #C5D4B8 100%)',
          }}
          compact
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-md"
      >
        <button
          className={`btn ${fav ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => toggleFavorite('messages', { id: devotional.title, ...devotional })}
          style={{ flex: 1 }}
        >
          <Heart size={16} fill={fav ? 'white' : 'none'} />
          {fav ? 'Salvo' : 'Salvar'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => openShareModal({ type: 'devotional', ...devotional })}
          style={{ flex: 1 }}
        >
          <Share2 size={16} />
          Compartilhar
        </button>
      </motion.div>
    </div>
  );
}
