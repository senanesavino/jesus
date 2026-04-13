import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Share2, Play } from 'lucide-react';
import { emotions } from '../data/emotions';
import EmotionCard from '../components/EmotionCard';
import AudioPlayer from '../components/AudioPlayer';
import useStore from '../store/useStore';

export default function EmotionsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, openShareModal } = useStore();
  const [selected, setSelected] = useState(location.state?.selectedEmotion || null);

  const handleSelect = (emotion) => {
    setSelected(emotion);
  };

  const handleBack = () => {
    setSelected(null);
  };

  if (selected) {
    const fav = isFavorite('messages', selected.id);

    return (
      <div className="screen" style={{ paddingTop: '20px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back button */}
          <button
            className="btn-ghost flex items-center gap-sm"
            onClick={handleBack}
            style={{ marginBottom: '20px', padding: '8px 0' }}
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>

          {/* Emotion header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
              background: selected.bgColor, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
            }}>
              {selected.emoji}
            </div>
            <h1 className="text-h1" style={{ marginBottom: '8px' }}>{selected.title}</h1>
            <span className="badge" style={{ background: selected.bgColor, color: selected.color }}>
              {selected.name}
            </span>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
            style={{ marginBottom: '16px' }}
          >
            <p className="text-body" style={{ lineHeight: 1.8, color: 'var(--text-primary)' }}>
              {selected.message}
            </p>
          </motion.div>

          {/* Verse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: '20px', background: selected.bgColor,
              borderRadius: 'var(--radius-lg)', marginBottom: '16px',
            }}
          >
            <p className="verse-text">"{selected.verse}"</p>
            <p className="verse-reference" style={{ color: selected.color }}>
              {selected.verseRef}
            </p>
          </motion.div>

          {/* Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
            style={{ marginBottom: '16px' }}
          >
            <div className="text-overline" style={{ color: selected.color, marginBottom: '8px' }}>
              Reflexão
            </div>
            <p className="text-body" style={{ fontStyle: 'italic' }}>
              {selected.reflection}
            </p>
          </motion.div>

          {/* Prayer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
            style={{ marginBottom: '16px' }}
          >
            <div className="text-overline" style={{ color: selected.color, marginBottom: '8px' }}>
              Oração
            </div>
            <p className="text-body" style={{ fontFamily: 'var(--font-serif)', lineHeight: 1.8, color: 'var(--text-primary)' }}>
              {selected.prayer}
            </p>
          </motion.div>

          {/* Audio player compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: '16px' }}
          >
            <AudioPlayer
              prayer={{
                id: `emotion-${selected.id}`,
                title: `Oração: ${selected.name}`,
                category: selected.name,
                duration: selected.audioDuration,
                durationSeconds: 120,
                emoji: selected.emoji,
                bgGradient: `linear-gradient(135deg, ${selected.color} 0%, ${selected.color}88 100%)`,
              }}
              compact
            />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-md"
          >
            <button
              className={`btn ${fav ? 'btn-primary' : 'btn-secondary'} flex-1`}
              onClick={() => toggleFavorite('messages', { id: selected.id, ...selected })}
              style={{ flex: 1 }}
            >
              <Heart size={16} fill={fav ? 'white' : 'none'} />
              {fav ? 'Salvo' : 'Salvar'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => openShareModal({ type: 'devotional', ...selected })}
              style={{ flex: 1 }}
            >
              <Share2 size={16} />
              Compartilhar
            </button>
          </motion.div>
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
        <h1 className="text-h1" style={{ marginBottom: '8px' }}>Como você está hoje?</h1>
        <p className="text-body" style={{ marginBottom: '28px' }}>
          Escolha o que melhor descreve seu coração agora. Deus tem uma palavra para você.
        </p>
      </motion.div>

      <div className="emotion-grid">
        {emotions.map((emotion, index) => (
          <EmotionCard
            key={emotion.id}
            emotion={emotion}
            onClick={handleSelect}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
