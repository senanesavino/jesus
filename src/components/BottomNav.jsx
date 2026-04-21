import { NavLink, useLocation } from 'react-router-dom';
import { Home, Heart, BookOpen, Compass, Calendar, User } from 'lucide-react';

const navItems = [
  { to: '/home', icon: Home, label: 'Início' },
  { to: '/journey', icon: Calendar, label: 'Jornada' },
  { to: '/emotions', icon: Heart, label: 'Emoções' },
  { to: '/trails', icon: Compass, label: 'Trilhas' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={`nav-item ${location.pathname.startsWith(to) ? 'active' : ''}`}
        >
          <Icon size={22} strokeWidth={location.pathname.startsWith(to) ? 2.2 : 1.8} />
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
