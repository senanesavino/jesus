import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import useStore from '../store/useStore';

export default function AudioPlayer({ prayer, compact = false }) {
  const { isPlaying, currentPrayer, setPlaying, setCurrentPrayer, audioProgress, setAudioProgress, toggleFavorite, isFavorite } = useStore();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const isThisPlaying = isPlaying && currentPrayer?.id === prayer.id;
  const fav = isFavorite('prayers', prayer.id);

  useEffect(() => {
    if (isThisPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            setPlaying(false);
            return 0;
          }
          return prev + (100 / (prayer.durationSeconds || 120));
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isThisPlaying]);

  const handlePlay = () => {
    if (isThisPlaying) {
      setPlaying(false);
    } else {
      setCurrentPrayer(prayer);
      setProgress(0);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTime = Math.floor((progress / 100) * (prayer.durationSeconds || 120));
  const totalTime = prayer.durationSeconds || 120;

  if (compact) {
    return (
      <div className="flex items-center gap-md" style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
        <button className="play-btn" onClick={handlePlay} style={{ width: 44, height: 44, fontSize: '0.875rem' }}>
          {isThisPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>{prayer.title}</div>
          <div className="progress-bar" style={{ margin: 0 }}>
            <div className="progress-bar-fill" style={{ width: `${isThisPlaying ? progress : 0}%` }} />
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
        <span className="text-caption">{prayer.category} • {prayer.duration}</span>
      </div>

      <div className="progress-bar" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setProgress((x / rect.width) * 100);
      }}>
        <div className="progress-bar-fill" style={{ width: `${isThisPlaying || progress > 0 ? progress : 0}%` }} />
      </div>

      <div className="progress-time">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(totalTime)}</span>
      </div>

      <div className="audio-player-controls" style={{ marginTop: '16px' }}>
        <button className="btn-icon btn-ghost" onClick={() => setProgress(Math.max(0, progress - 10))}>
          <SkipBack size={22} />
        </button>
        <button className="play-btn" onClick={handlePlay}>
          {isThisPlaying ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
        </button>
        <button className="btn-icon btn-ghost" onClick={() => setProgress(Math.min(100, progress + 10))}>
          <SkipForward size={22} />
        </button>
      </div>

      <div className="flex justify-center gap-lg" style={{ marginTop: '20px' }}>
        <button
          className="btn-icon btn-ghost"
          onClick={() => toggleFavorite('prayers', prayer)}
          style={{ color: fav ? '#C08B6E' : 'var(--text-muted)' }}
        >
          <Heart size={20} fill={fav ? '#C08B6E' : 'none'} />
        </button>
      </div>
    </div>
  );
}
