import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext(null);

const initialState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  preferences: { period: null, need: null, format: null },
  favorites: { messages: [], verses: [], prayers: [] },
  streak: { current: 0, best: 0, totalDays: 0, totalMinutes: 0, lastDate: new Date().toISOString().split('T')[0] },
  isPlaying: false,
  currentPrayer: null,
  audioProgress: 0,
  isPremium: false,
  shareModalOpen: false,
  shareContent: null,
};

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleUserLogin(session.user);
      } else {
        setIsInitializing(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserLogin(session.user);
      } else {
        setState(initialState);
        setIsInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserLogin = async (user) => {
    try {
      // Fetch profile and preferences
      const [{ data: profile }, { data: prefs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('preferences').select('*').eq('user_id', user.id).single()
      ]);

      setState((s) => ({
        ...s,
        isAuthenticated: true,
        hasCompletedOnboarding: !!prefs,
        user: { ...user, name: profile?.name || 'Amado(a)' },
        preferences: prefs || { period: null, need: null, format: null },
      }));
    } catch (e) {
      console.error('Error fetching user data', e);
    } finally {
      setIsInitializing(false);
    }
  };

  const actions = {
    fetchDailyMessage: useCallback(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Check if we already have it in the database
        const { data: existingMsg } = await supabase
          .from('daily_messages')
          .select('*')
          .eq('publish_date', today)
          .single();
          
        if (existingMsg) {
          setState(s => ({ ...s, dailyMessage: existingMsg }));
          return;
        }

        // 2. Not found! Generate using Gemini AI (Automático pelo primeiro a abrir!)
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const prompt = `Você é um conselheiro cristão amoroso. Crie um devocional diário curto focado em esperança e recomeço. Siga estritamente este formato JSON:
        {
          "title": "Um título encorajador de 4 palavras",
          "verse": "O texto bíblico completo na versão NVI",
          "reference": "Livro Capitulo:Versiculo",
          "content": "A mensagem de 3 parágrafos curtos falando diretamente ao coração da pessoa. Use palavras gentis.",
          "prayer": "Uma oração de 2 frases em primeira pessoa (Senhor, ajuda-me a...)"
        }`;

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        const aiData = await aiResponse.json();
        const resultText = aiData.candidates[0].content.parts[0].text;
        const devocional = JSON.parse(resultText);

        // 3. Save to Supabase for the rest of the users today
        const { data: insertedMsg, error: insertError } = await supabase
          .from('daily_messages')
          .insert({
            publish_date: today,
            title: devocional.title,
            verse: devocional.verse,
            reference: devocional.reference,
            content: devocional.content,
            prayer: devocional.prayer
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setState(s => ({ ...s, dailyMessage: insertedMsg }));
      } catch (error) {
        console.error('Erro ao gerar mensagem automática:', error);
      }
    }, []),

    login: useCallback(async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }, []),

    signup: useCallback(async (email, password, name) => {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      });
      if (error) throw error;
    }, []),

    logout: useCallback(async () => {
      await supabase.auth.signOut();
    }, []),

    completeOnboarding: useCallback(async () => {
      const { preferences, user } = state;
      if (!user) return;
      
      await supabase.from('preferences').upsert({
        user_id: user.id,
        period: preferences.period,
        need: preferences.need,
        format: preferences.format,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      setState((s) => ({ ...s, hasCompletedOnboarding: true }));
    }, [state]),

    setPreference: useCallback((key, value) => {
      setState((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } }));
    }, []),

    toggleFavorite: useCallback(async (type, item) => {
      const { user, favorites } = state;
      if (!user) return;
      
      const list = favorites[type] || [];
      const exists = list.find((f) => f.id === item.id);
      
      if (exists) {
        await supabase.from('favorites').delete().match({ user_id: user.id, item_id: item.id.toString() });
        setState((s) => ({
          ...s,
          favorites: { ...s.favorites, [type]: list.filter((f) => f.id !== item.id) }
        }));
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id, type, item_id: item.id.toString(), data: item
        });
        setState((s) => ({
          ...s,
          favorites: { ...s.favorites, [type]: [...list, { ...item, savedAt: new Date().toISOString() }] }
        }));
      }
    }, [state]),

    setPlaying: useCallback((playing) => setState((s) => ({ ...s, isPlaying: playing })), []),
    setCurrentPrayer: useCallback((prayer) => setState((s) => ({ ...s, currentPrayer: prayer, isPlaying: true, audioProgress: 0 })), []),
    setAudioProgress: useCallback((progress) => setState((s) => ({ ...s, audioProgress: progress })), []),
    setPremium: useCallback((val) => setState((s) => ({ ...s, isPremium: val })), []),
    openShareModal: useCallback((content) => setState((s) => ({ ...s, shareModalOpen: true, shareContent: content })), []),
    closeShareModal: useCallback(() => setState((s) => ({ ...s, shareModalOpen: false, shareContent: null })), []),
  };

  const isFavorite = useCallback((type, id) => {
    return (state.favorites[type] || []).some((f) => f.id === id);
  }, [state.favorites]);

  if (isInitializing) {
    return <div style={{ minHeight: '100dvh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 30, height: 30, border: '3px solid rgba(123,143,106,0.2)', borderTopColor: '#7B8F6A', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /></div>;
  }

  return (
    <StoreContext.Provider value={{ ...state, ...actions, isFavorite }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useStore(selector) {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  if (selector) return selector(store);
  return store;
}
