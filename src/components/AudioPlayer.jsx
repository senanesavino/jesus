import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import useStore from '../store/useStore';

export default function AudioPlayer({ prayer, compact = false }) {
  const { 
    isPlaying, currentPrayer, setPlaying, setCurrentPrayer, 
    audioProgress, toggleFavorite, isFavorite, lastError, audio,
    debugInfo, bgAudio
  } = useStore();
  
  const fav = isFavorite('prayers', prayer.id);

  const isThisPrayerInStore = currentPrayer?.id == prayer.id;
  const isThisPlayingNow = isPlaying && isThisPrayerInStore;

  const handlePlay = (e) => {
    e.stopPropagation();
    const audioEl = audio || document.getElementById('main-audio-engine');
    
    if (isThisPlayingNow) {
      // PARADA GERAL
      window.speechSynthesis.cancel();
      if (audioEl) audioEl.pause();
      if (bgAudio) bgAudio.pause();
      setPlaying(false);
    } else {
      if (!prayer.audio_url && !prayer.audio) {
        console.warn('Áudio ainda não disponível para esta oração.');
        return;
      }

      if (prayer.audio_url === 'native') {
        // Voz Nativa - Busca a melhor voz disponível
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        } else {
          const utterance = new SpeechSynthesisUtterance(prayer.prayer || prayer.text);
          
          // Tenta encontrar a voz do Google ou Microsoft que são mais humanas
          const voices = window.speechSynthesis.getVoices();
          const bestVoice = voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) || 
                            voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Microsoft')) ||
                            voices.find(v => v.lang.includes('pt-BR'));
          
          if (bestVoice) utterance.voice = bestVoice;
          
          utterance.lang = 'pt-BR';
          utterance.rate = 0.85; // Mais calmo
          utterance.pitch = 1.05; // Tom levemente mais acolhedor
          
          utterance.onend = () => setPlaying(false);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        // Áudio Profissional
        if (audioEl) {
          audioEl.play().catch(() => {});
        }
      }
      
      setCurrentPrayer(prayer);
      setPlaying(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Tempo baseado no progresso global e duração estimada/real
  const durationSeconds = prayer.durationSeconds || 120;
  const currentTime = (audioProgress / 100) * durationSeconds;

  if (compact) {
    return (
      <div className="flex items-center gap-md" style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <button className="play-btn" onClick={handlePlay} style={{ width: 44, height: 44, fontSize: '0.875rem' }}>
          {isThisPlayingNow ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>{prayer.title}</div>
          <div className="progress-bar" style={{ margin: 0 }}>
            <div className="progress-bar-fill" style={{ width: `${isThisPlayingNow ? audioProgress : 0}%` }} />
          </div>
        </div>
        <span className="text-caption">{prayer.duration}</span>
      </div>
    );
  }

  return (
    <div className="audio-player">
      <div className="audio-player-cover" style={{ background: prayer.bgGradient || 'var(--gradient-olive)' }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '12px', color: 'white', zIndex: 1,
        }}>
          <span style={{ fontSize: '3.5rem' }}>{prayer.emoji}</span>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {prayer.category}
          </div>
        </div>
        <div className="audio-player-cover-gradient" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)',
        }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h3 className="text-h3" style={{ marginBottom: 4 }}>{prayer.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="text-caption">{prayer.category} • {prayer.duration}</span>
        </div>
        {lastError && (
          <div style={{ 
            marginTop: '12px', padding: '8px', background: 'rgba(230, 92, 92, 0.1)', 
            borderRadius: '8px', color: '#E65C5C', fontSize: '0.75rem', fontWeight: 500 
          }}>
            ⚠️ {lastError}
          </div>
        )}
      </div>

      <div className="progress-bar" onClick={(e) => {
        // Opção de seek pode ser implementada via store se desejado
      }}>
        <div className="progress-bar-fill" style={{ width: `${isThisPlayingNow ? audioProgress : 0}%` }} />
      </div>

      <div className="progress-time">
        <span>{formatTime(isThisPlayingNow ? currentTime : 0)}</span>
        <span>{prayer.duration}</span>
      </div>

      <div className="audio-player-controls" style={{ marginTop: '16px' }}>
        <button className="btn-icon btn-ghost">
          <SkipBack size={22} />
        </button>
        <button className="play-btn" onClick={handlePlay}>
          {isThisPlayingNow ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
        </button>
        <button className="btn-icon btn-ghost">
          <SkipForward size={22} />
        </button>
      </div>

      <div className="flex justify-center gap-lg" style={{ marginTop: '20px' }}>
        <button
          className="btn-icon btn-ghost"
          onClick={() => toggleFavorite('prayers', prayer)}
          style={{ color: fav ? 'var(--accent-terracotta)' : 'var(--text-muted)' }}
        >
          <Heart size={20} fill={fav ? 'var(--accent-terracotta)' : 'none'} />
        </button>
      </div>
    </div>
  );
}
