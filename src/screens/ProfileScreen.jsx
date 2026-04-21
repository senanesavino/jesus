import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ChevronRight, LogOut, Crown, Bell, Moon, Clock, Heart } from 'lucide-react';
import useStore from '../store/useStore';
import StreakBadge from '../components/StreakBadge';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, isPremium, preferences } = useStore();

  const menuItems = [
    { icon: Heart, label: 'Meus favoritos', color: '#C08B6E', action: () => navigate('/favorites') },
    { icon: Crown, label: isPremium ? 'Meu plano Premium' : 'Conhecer o Premium', color: '#C4A265', action: () => navigate('/premium') },
    { icon: Bell, label: 'Notificações', color: '#7B8F6A', action: () => {} },
    { icon: Clock, label: `Horário: ${preferences.period || 'manhã'}`, color: '#5B7A8C', action: () => {} },
    { icon: Moon, label: 'Modo noturno', color: '#8B9DC3', action: () => {} },
    { icon: Settings, label: 'Configurações', color: '#9E958B', action: () => {} },
  ];

  return (
    <div className="screen" style={{ paddingTop: '20px' }}>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '28px' }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
          background: 'var(--gradient-olive)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', color: 'white', boxShadow: 'var(--shadow-glow-olive)',
        }}>
          {user?.name?.[0]?.toUpperCase() || '✝'}
        </div>
        <h1 className="text-h2" style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>{user?.name || 'Amado(a)'}</h1>
        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email || 'usuario@email.com'}</p>
        {isPremium && (
          <span className="badge badge-gold" style={{ marginTop: '8px' }}>
            <Crown size={10} /> Premium
          </span>
        )}
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '24px' }}
      >
        <StreakBadge />
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
        style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}
      >
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid rgba(44,40,37,0.05)' : 'none',
              textAlign: 'left', transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: `${item.color}15`, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {item.label}
            </span>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          className="btn btn-ghost btn-block"
          onClick={logout}
          style={{ color: '#C07070', marginTop: '8px' }}
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      </motion.div>

      {/* App version */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p className="text-caption">Com Deus Hoje • Versão 1.0</p>
        <p className="text-caption" style={{ marginTop: '4px' }}>Feito com ❤️ e fé</p>
      </div>
    </div>
  );
}
