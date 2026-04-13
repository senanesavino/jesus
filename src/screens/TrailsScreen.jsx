import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { trails } from '../data/trails';
import TrailCard from '../components/TrailCard';
import useStore from '../store/useStore';

export default function TrailsScreen() {
  const navigate = useNavigate();
  const { isPremium } = useStore();

  const activeTrails = trails.filter((t) => t.progress > 0);
  const freeTrails = trails.filter((t) => !t.isPremium && t.progress === 0);
  const premiumTrails = trails.filter((t) => t.isPremium);

  const handleTrailClick = (trail) => {
    // In a real app, navigate to trail detail
  };

  return (
    <div className="screen" style={{ paddingTop: '56px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-h1" style={{ marginBottom: '8px' }}>Trilhas guiadas</h1>
        <p className="text-body" style={{ marginBottom: '28px' }}>
          Jornadas espirituais para transformar seus dias com Jesus.
        </p>
      </motion.div>

      {/* Active trails */}
      {activeTrails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '28px' }}
        >
          <h2 className="text-overline" style={{ color: 'var(--accent-olive)', marginBottom: '16px' }}>
            📖 Em andamento
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeTrails.map((trail, i) => (
              <TrailCard key={trail.id} trail={trail} onClick={handleTrailClick} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Free trails */}
      {freeTrails.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '28px' }}
        >
          <h2 className="text-overline" style={{ color: 'var(--accent-blue)', marginBottom: '16px' }}>
            🌿 Trilhas gratuitas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {freeTrails.map((trail, i) => (
              <TrailCard key={trail.id} trail={trail} onClick={handleTrailClick} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Premium trails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-overline" style={{ color: 'var(--accent-gold)', marginBottom: '16px' }}>
          ✦ Trilhas Premium
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {premiumTrails.map((trail, i) => (
            <TrailCard
              key={trail.id}
              trail={trail}
              onClick={isPremium ? handleTrailClick : () => navigate('/premium')}
              index={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom spacer for discovery */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/premium')}
          style={{
            marginTop: '24px', padding: '20px', textAlign: 'center',
            background: 'var(--gradient-premium)', borderRadius: 'var(--radius-lg)',
            color: 'white', cursor: 'pointer',
          }}
        >
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 500 }}>
            Desbloqueie todas as trilhas ✝️
          </p>
          <p style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '4px' }}>
            Comece sua jornada completa com Jesus
          </p>
        </motion.div>
      )}
    </div>
  );
}
