import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore, { StoreProvider } from './store/useStore';
import BottomNav from './components/BottomNav';
import ShareModal from './components/ShareModal';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import EmotionsScreen from './screens/EmotionsScreen';
import PrayerScreen from './screens/PrayerScreen';
import TrailsScreen from './screens/TrailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import DevotionalScreen from './screens/DevotionalScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import PremiumScreen from './screens/PremiumScreen';
import CustomPrayerScreen from './screens/CustomPrayerScreen';
import TrailDetailScreen from './screens/TrailDetailScreen';
import JourneyScreen from './screens/JourneyScreen';

function AnimatedRoutes() {
  const location = useLocation();
  const showNav = !['/devotional', '/premium', '/favorites', '/trail'].some(p => location.pathname.startsWith(p));

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ flex: 1 }}
        >
          <Routes location={location}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/journey" element={<JourneyScreen />} />
            <Route path="/emotions" element={<EmotionsScreen />} />
            <Route path="/prayers" element={<PrayerScreen />} />
            <Route path="/trails" element={<TrailsScreen />} />
            <Route path="/trail/:id" element={<TrailDetailScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/devotional" element={<DevotionalScreen />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/premium" element={<PremiumScreen />} />
            <Route path="/custom-prayer" element={<CustomPrayerScreen />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
      <ShareModal />
    </>
  );
}

import OneSignal from 'react-onesignal';

function AppContent() {
  const store = useStore();

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
        if (!appId) return;
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: false },
          welcomeNotification: { enable: true },
        });
        
        // Link user to OneSignal if authenticated
        if (store.user?.id) {
          OneSignal.login(store.user.id);
        }

        // Pedir permissão de notificação se ainda não concedida
        if (OneSignal.Notifications) {
          const permission = OneSignal.Notifications.permission;
          if (!permission) {
            // Aguarda um pouco para não ser intrusivo logo ao abrir
            setTimeout(async () => {
              try {
                await OneSignal.Notifications.requestPermission();
              } catch (e) {
                console.log('Push permission denied or error:', e);
              }
            }, 3000);
          }
        }

        // Salvar a tag do período do usuário (para segmentação das notificações)
        if (store.preferences?.period && OneSignal.User) {
          OneSignal.User.addTag('periodo', store.preferences.period);
        }
      } catch (e) {
        console.log('OneSignal init error', e);
      }
    };
    initOneSignal();
  }, [store.user?.id, store.preferences?.period]);

  if (!store.isAuthenticated) {
    return <AuthScreen />;
  }

  if (!store.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <div className="app-container">
      <AnimatedRoutes />
    </div>
  );
}

// Componente de segurança para capturar erros e evitar tela branca
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', minHeight: '100vh', color: '#ff4d4f' }}>
          <h2>Ops! Algo deu errado.</h2>
          <pre style={{ textAlign: 'left', background: '#f5f5f5', padding: '20px', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: '20px' }}>
            Tentar Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}
