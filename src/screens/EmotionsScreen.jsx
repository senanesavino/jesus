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
  const { toggleFavorite, isFavorite, openShareModal, generateEmotionInsight } = useStore();
  const [selected, setSelected] = useState(location.state?.selectedEmotion || null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelect = async (emotion) => {
    setIsGenerating(true);
    try {
      const insight = await generateEmotionInsight(emotion.name);
      // Mesclar os dados base (cores/emojis) com o conteúdo novo da IA
      setSelected({
        ...emotion,
        ...insight
      });
    } catch (err) {
      console.error('Failed to generate insight:', err);
      setSelected(emotion); // Fallback para o estático se a IA falhar
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    setSelected(null);
  };

  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--bg-primary)', zIndex: 1000,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px', textAlign: 'center'
      }}
    >
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'var(--accent-blue-bg)', filter: 'blur(30px)',
          }}
        />
        <img src="/logo.png" alt="Logo" style={{ width: '120px', height: 'auto', position: 'relative' }} />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)',
          marginBottom: '12px', fontWeight: 500
        }}
      >
        Preparando uma palavra para você...
      </motion.p>
      
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
      >
        Sintonizando com o céu. Um instante...
      </motion.p>
    </motion.div>
  );

  if (selected && !isGenerating) {
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
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-h1" 
              style={{ marginBottom: '8px' }}
            >
              {selected.title}
            </motion.h1>
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
                id: selected.id || `emotion-${selected.id}-${Date.now()}`,
                title: selected.title,
                category: selected.name,
                duration: '2:00',
                durationSeconds: 120,
                emoji: selected.emoji,
                bgGradient: `linear-gradient(135deg, ${selected.color} 0%, ${selected.color}88 100%)`,
                audio_url: selected.audio_url,
                prayer: selected.prayer
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
      <AnimatePresence>
        {isGenerating && <LoadingOverlay />}
      </AnimatePresence>

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
            onClick={() => handleSelect(emotion)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
