import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import AudioPlayer from '../components/AudioPlayer';

export default function CustomPrayerScreen() {
  const navigate = useNavigate();
  const { generateAIPrayer, lastError, clearError, debugInfo } = useStore();
  
  const [feeling, setFeeling] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleGenerate = async () => {
    if (!feeling.trim()) return;
    setLoading(true);
    try {
      const prayer = await generateAIPrayer(feeling, true);
      if (prayer) {
        setResult({
          ...prayer,
          id: 'custom-' + Date.now(),
          category: 'Personalizada',
          emoji: '✨',
          bgGradient: 'linear-gradient(135deg, #7B8F6A 0%, #5B7A8C 100%)'
        });
      }
    } catch (e) {
      console.error('Erro custom prayer:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ paddingTop: '24px' }}>
      <button
        className="btn-ghost flex items-center gap-sm"
        onClick={() => result ? setResult(null) : navigate(-1)}
        style={{ marginBottom: '24px', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <AnimatePresence mode="wait">
        {!result && !loading && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {lastError && (
              <div style={{ 
                color: '#E65C5C', background: 'rgba(230, 92, 92, 0.1)', 
                padding: '16px', borderRadius: '12px', marginBottom: '24px',
                fontSize: '0.875rem', fontWeight: 500, border: '1px solid rgba(230, 92, 92, 0.2)'
              }}>
                ⚠️ {lastError}
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: 64, height: 64, background: 'var(--accent-olive-bg)', 
                borderRadius: '20px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-olive)'
              }}>
                <Sparkles size={32} />
              </div>
              <h1 className="text-h1" style={{ marginBottom: 12 }}>O que está em seu coração?</h1>
              <p className="text-body">Conte para Jesus o que você está sentindo e a nossa IA preparará uma oração especial para você.</p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Ex: Estou me sentindo ansioso com o trabalho amanhã..."
                style={{
                  width: '100%', minHeight: '120px', border: 'none', 
                  background: 'transparent', resize: 'none', fontSize: '1rem',
                  fontFamily: 'var(--font-sans)', color: 'var(--text-primary)',
                  marginBottom: '16px'
                }}
              />
              <button
                className="btn btn-primary btn-block"
                onClick={handleGenerate}
                disabled={!feeling.trim()}
                style={{ padding: '16px' }}
              >
                <Send size={18} />
                Gerar minha oração
              </button>
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              textAlign: 'center', padding: '60px 20px', display: 'flex', 
              flexDirection: 'column', alignItems: 'center', gap: '20px' 
            }}
          >
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-olive)' }} />
            <h2 className="text-h2">Inspirando sua oração...</h2>
            <p className="text-body">Buscando palavras de conforto e esperança para o seu momento.</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AudioPlayer prayer={result} />
            
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="text-overline" style={{ color: 'var(--accent-olive)', marginBottom: '12px' }}>
                Texto da sua oração
              </div>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
                lineHeight: 1.8, color: 'var(--text-primary)',
              }}>
                {result.prayer}
              </p>
            </div>

            <button
              className="btn btn-ghost btn-block"
              onClick={() => {
                setResult(null);
                setFeeling('');
              }}
              style={{ marginTop: '20px' }}
            >
              Criar outra oração
            </button>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

