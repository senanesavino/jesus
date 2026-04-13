import { useEffect } from 'react';
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

function AnimatedRoutes() {
  const location = useLocation();
  const showNav = !['/devotional', '/premium', '/favorites'].includes(location.pathname);

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
            <Route path="/emotions" element={<EmotionsScreen />} />
            <Route path="/prayers" element={<PrayerScreen />} />
            <Route path="/trails" element={<TrailsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/devotional" element={<DevotionalScreen />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/premium" element={<PremiumScreen />} />
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
          notifyButton: { enable: false }, // we will ask manually
        });
        
        // Link user to OneSignal if authenticated
        if (store.user?.id) {
          OneSignal.login(store.user.id);
        }
      } catch (e) {
        console.log('OneSignal init error', e);
      }
    };
    initOneSignal();
  }, [store.user?.id]);

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

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StoreProvider>
  );
}
