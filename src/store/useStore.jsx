import React, { useState, createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext(null);

// Helper: retorna data local no formato YYYY-MM-DD (sem depender de UTC)
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const initialState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  user: null,
  preferences: { period: null, need: null, format: null },
  favorites: { messages: [], verses: [], prayers: [] },
  streak: JSON.parse(localStorage.getItem('userStreak')) || { current: 0, best: 0, totalDays: 0, totalMinutes: 0, lastDate: '1970-01-01' },
  isPlaying: false,
  currentPrayer: null,
  audioProgress: 0,
  isPremium: false,
  shareModalOpen: false,
  shareContent: null,
  lastError: null,
  debugInfo: 'Pronto',
  userTrails: JSON.parse(localStorage.getItem('userTrails') || '{}'),
};

export function StoreProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [isInitializing, setIsInitializing] = useState(true);
  const stateRef = useRef(state);
  
  // Manter ref sempre atualizada com o estado mais recente
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  const globalAudioRef = useRef(null);
  const bgAudioRef = useRef(null);
  const [audioElement, setAudioElement] = useState(null);

  // Buffer silencioso para "aquecer" o hardware de som
  const silentBuffer = 'data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

  useEffect(() => {
    if (globalAudioRef.current) {
      setAudioElement(globalAudioRef.current);
    }
  }, []);

  // Monitorar tempo e estados do áudio diretamente do elemento DOM
  const onTimeUpdate = () => {
    const audio = globalAudioRef.current;
    if (audio && audio.duration) {
      setState(s => ({ ...s, audioProgress: (audio.currentTime / audio.duration) * 100 }));
    }
  };

  const onEnded = () => setState(s => ({ ...s, isPlaying: false, audioProgress: 0, debugInfo: 'Finalizado' }));
  
  const onError = (e) => {
    console.error('Audio DOM Error:', e);
    // Sem fallback - apenas para o áudio silenciosamente
  };

  const bgAudioEngine = useRef(new Audio('/audio/ambient-piano.mp3'));

  const onPlay = () => {
    const bg = bgAudioEngine.current;
    if (bg) {
      bg.volume = 0.3;
      bg.loop = true;
      bg.play().catch(() => {});
    }
    setState(s => ({ ...s, isPlaying: true, lastError: null, debugInfo: 'Reproduzindo...' }));
  };

  const onPause = () => {
    if (bgAudioEngine.current) bgAudioEngine.current.pause();
    setState(s => ({ ...s, isPlaying: false, debugInfo: 'Pausado' }));
  };
  const onLoading = () => setState(s => ({ ...s, debugInfo: 'Carregando som...' }));

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
        const today = getLocalDateString();

        // --- Lógica de Streak (Contador de dias) ---
        setState(s => {
          const last = s.streak.lastDate;
          if (last === today) return s; // Já abriu hoje, não faz nada

          const lastDateObj = new Date(last);
          const todayObj = new Date(today);
          const diffInDays = Math.floor((todayObj - lastDateObj) / (1000 * 60 * 60 * 24));

          let newCurrent = s.streak.current;
          if (diffInDays === 1) {
            newCurrent += 1; // Dia consecutivo!
          } else {
            newCurrent = 1; // Falhou um dia ou é o primeiro acesso
          }

          const newBest = Math.max(s.streak.best, newCurrent);
          
          const newStreak = {
            ...s.streak,
            current: newCurrent,
            best: newBest,
            totalDays: s.streak.totalDays + 1,
            lastDate: today
          };
          localStorage.setItem('userStreak', JSON.stringify(newStreak));
          
          return {
            ...s,
            streak: newStreak
          };
        });

        // --- Resto da busca de mensagem ---
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

        if (!aiResponse.ok) {
          const rawError = await aiResponse.text();
          throw new Error(`Google API (Daily): ${aiResponse.status} - ${rawError}`);
        }

        const aiData = await aiResponse.json();
        const resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) throw new Error('A IA não retornou um texto válido. Tente novamente.');
        
        const devocional = JSON.parse(resultText.replace(/```json/g, '').replace(/```/g, '').trim());

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

        // --- GERAÇÃO DE ÁUDIO (Google Cloud TTS Neural2) ---
        try {
          if (geminiKey) {
            setState(s => ({ ...s, debugInfo: 'Gerando voz (Google Neural2)...' }));
            
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: { text: devocional.prayer },
                voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-A', ssmlGender: 'FEMALE' },
                audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 0.95 }
              })
            });

            if (response.ok) {
              const { audioContent } = await response.json();
              if (audioContent) {
                const sanitizedBase64 = audioContent.trim().replace(/\s/g, '');
                const byteCharacters = atob(sanitizedBase64);
                const byteArray = new Uint8Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteArray[i] = byteCharacters.charCodeAt(i);
                }
                const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });

                const fileName = `daily_${today}.mp3`;
                
                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('devotionals')
                  .upload(fileName, audioBlob, { contentType: 'audio/mpeg', upsert: true });

                if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('devotionals')
                    .getPublicUrl(fileName);

                  await supabase
                    .from('daily_messages')
                    .update({ audio_url: publicUrl })
                    .eq('id', insertedMsg.id);
                  
                  insertedMsg.audio_url = publicUrl;
                }
              }
            }
          }
        } catch (audioErr) {
          console.error('Erro na geração de áudio Google:', audioErr);
        }
        
        setState(s => ({ ...s, dailyMessage: insertedMsg }));
      } catch (error) {
        console.error('Erro ao gerar mensagem automática:', error);
      }
    }, [state.streak]),

    generateAIPrayer: useCallback(async (topic, isCustom = true, prayerId = null, forcedText = null) => {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const model = 'gemini-2.5-flash';
      let lastErr = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          setState(s => ({ ...s, lastError: null, debugInfo: attempt > 1 ? `Tentando novamente (${attempt}/3)...` : 'Iniciando IA...' }));
          
          let customPrayer;

          if (forcedText) {
            // Se já temos o texto, não precisamos da IA do Google!
            customPrayer = { title: topic, prayer: forcedText };
          } else {
            const prompt = isCustom 
              ? `Você é um conselheiro cristão amoroso. Gere uma oração poderosa e confortante para alguém que está sentindo: "${topic}". Siga estritamente este formato JSON: {"title": "Oração para afastar a ${topic}", "prayer": "O texto completa da oração (máximo 400 caracteres)."}`
              : `Você é um conselheiro cristão amoroso. Gere uma oração poderosa sobre o tema: "${topic}". Siga estritamente este formato JSON: {"title": "${topic}", "prayer": "O texto completo da oração (máximo 400 caracteres)."}`;

            const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' }
              })
            });

            if (!aiResponse.ok) {
              const rawError = await aiResponse.text();
              if (aiResponse.status === 503 || aiResponse.status === 429) {
                console.warn(`Tentativa ${attempt} falhou com ${aiResponse.status}. Aguardando...`);
                await new Promise(r => setTimeout(r, 1500 * attempt));
                continue; 
              }
              throw new Error(`Erro na IA do Google: ${aiResponse.status}`);
            }

            const aiData = await aiResponse.json();
            let resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!resultText) throw new Error('A IA não retornou texto.');
            
            resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            customPrayer = JSON.parse(resultText);
          }

          // --- GERAÇÃO DE ÁUDIO (Google Cloud TTS Neural2) ---
          if (geminiKey) {
            try {
              setState(s => ({ ...s, debugInfo: 'Gerando voz (Google Neural2)...' }));
              
              const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  input: { text: customPrayer.prayer },
                  voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-C', ssmlGender: 'FEMALE' },
                  audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 0.95 }
                })
              });
              
              if (response.ok) {
                const { audioContent } = await response.json();
                if (audioContent) {
                  const sanitizedBase64 = audioContent.trim().replace(/\s/g, '');
                  const byteCharacters = atob(sanitizedBase64);
                  const byteArray = new Uint8Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteArray[i] = byteCharacters.charCodeAt(i);
                  }
                  const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
                  
                  // --- LÓGICA DE SALVAMENTO NO SUPABASE ---
                  if (!isCustom && prayerId) {
                    const fileName = `fixed_prayer_${prayerId}_v2.mp3`;
                    const { error: uploadError } = await supabase.storage
                      .from('devotionals')
                      .upload(fileName, audioBlob, { contentType: 'audio/mpeg', upsert: true });

                    if (!uploadError) {
                      const { data: { publicUrl } } = supabase.storage
                        .from('devotionals')
                        .getPublicUrl(fileName);
                      customPrayer.audio_url = publicUrl;
                    } else {
                      customPrayer.audio_url = URL.createObjectURL(audioBlob);
                    }
                  } else {
                    customPrayer.audio_url = URL.createObjectURL(audioBlob);
                  }
                }
                
                setState(s => ({ ...s, debugInfo: 'Voz Google Neural2 Pronta!' }));
              } else {
                throw new Error(`Google TTS Error: ${response.status}`);
              }
            } catch (e) {
              console.warn('Google TTS falhou, usando voz nativa...', e.message);
              customPrayer.audio_url = 'native'; 
              setState(s => ({ ...s, debugInfo: 'Voz reserva ativa' }));
            }
          }

          return customPrayer;
        } catch (error) {
          lastErr = error;
          if (attempt === 3) break;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      setState(s => ({ ...s, lastError: `O servidor do Google está instável (Erro 503). Tente novamente em alguns segundos.` }));
      throw lastErr;
    }, []),

    generateEmotionInsight: useCallback(async (emotionName) => {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const model = 'gemini-2.5-flash';
      let lastErr = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          setState(s => ({ ...s, lastError: null, debugInfo: 'Preparando sua palavra...' }));
          
          const prompt = `Você é um conselheiro cristão amoroso. O usuário está se sentindo: "${emotionName}". 
          Gere um conteúdo de conforto e direção espiritual profundo e encorajador.
          Siga estritamente este formato JSON:
          {
            "title": "Um título encorajador de 4-6 palavras focado em ${emotionName}",
            "message": "Uma mensagem de 2 parágrafos curtos falando diretamente ao coração.",
            "verse": "Um versículo bíblico relevante que traga paz sobre ${emotionName} (NVI)",
            "verseRef": "Livro Capitulo:Versiculo",
            "reflection": "Uma reflexão curta de 1-2 frases para meditar no dia",
            "prayer": "Uma oração poderosa de 2-3 frases em primeira pessoa (Senhor, eu Te entrego...)"
          }`;

          const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });

          if (!aiResponse.ok) {
            if (aiResponse.status === 503 || aiResponse.status === 429) {
              await new Promise(r => setTimeout(r, 1500 * attempt));
              continue; 
            }
            throw new Error(`Google AI Error: ${aiResponse.status}`);
          }

          const aiData = await aiResponse.json();
          let resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!resultText) throw new Error('A IA não retornou texto.');
          
          resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
          const insight = JSON.parse(resultText);

          // GERA O ÁUDIO AUTOMATICAMENTE PARA A ORAÇÃO
          setState(s => ({ ...s, debugInfo: 'Sintonizando áudio...' }));
          
          const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text: insight.prayer },
              voice: { languageCode: 'pt-BR', name: 'pt-BR-Neural2-C', ssmlGender: 'FEMALE' },
              audioConfig: { audioEncoding: 'MP3', pitch: 0, speakingRate: 0.95 }
            })
          });

          if (ttsResponse.ok) {
            const { audioContent } = await ttsResponse.json();
            if (audioContent) {
              const sanitizedBase64 = audioContent.trim().replace(/\s/g, '');
              const byteCharacters = atob(sanitizedBase64);
              const byteArray = new Uint8Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
              }
              const audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
              insight.audio_url = URL.createObjectURL(audioBlob);
            }
          }

          return insight;
        } catch (error) {
          lastErr = error;
          if (attempt === 3) break;
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      throw lastErr;
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
      // Lê o estado mais atual via ref para evitar stale closure
      const current = stateRef.current;
      const { preferences, user } = current;
      if (!user) return;
      
      // Garantir que todas as preferências existem antes de salvar
      if (!preferences.period || !preferences.need || !preferences.format) {
        console.error('Onboarding incompleto: preferências faltando', preferences);
        return;
      }
      
      try {
        const { error } = await supabase.from('preferences').upsert({
          user_id: user.id,
          period: preferences.period,
          need: preferences.need,
          format: preferences.format,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
        if (error) {
          console.error('Erro ao salvar preferências:', error);
          throw error;
        }
        
        setState((s) => ({ ...s, hasCompletedOnboarding: true }));
      } catch (e) {
        console.error('Erro no completeOnboarding:', e);
        // Mesmo com erro no banco, permite continuar para não travar a tela
        setState((s) => ({ ...s, hasCompletedOnboarding: true }));
      }
    }, []),

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

    setPlaying: useCallback((playing) => {
      const audio = globalAudioRef.current || document.getElementById('main-audio-engine');
      if (playing) {
        if (audio) audio.play().catch(() => {});
      } else {
        if (audio) audio.pause();
      }
    }, []),
    setCurrentPrayer: useCallback((prayer) => {
      if (!prayer) return;
      const audio = globalAudioRef.current || document.getElementById('main-audio-engine');
      if (!audio) return;

      const voiceUrl = prayer.audio_url || prayer.audio;
      
      setState(s => ({ 
        ...s, 
        currentPrayer: prayer, 
        lastError: null,
        debugInfo: voiceUrl ? 'Carregando...' : 'Sem áudio'
      }));
      
      if (voiceUrl) {
        audio.src = voiceUrl;
        audio.play().catch(() => {
          setState(s => ({ ...s, debugInfo: 'Toque Play para ouvir' }));
        });
      }
    }, []),
    setAudioProgress: useCallback((progress) => setState((s) => ({ ...s, audioProgress: progress })), []),
    setPremium: useCallback((val) => setState((s) => ({ ...s, isPremium: val })), []),
    openShareModal: useCallback((content) => setState((s) => ({ ...s, shareModalOpen: true, shareContent: content })), []),
    closeShareModal: useCallback(() => setState((s) => ({ ...s, shareModalOpen: false, shareContent: null })), []),
    clearError: useCallback(() => setState((s) => ({ ...s, lastError: null })), []),
    
    // --- LÓGICA DE TRILHAS ---
    completeTrailDay: useCallback(async (trailId) => {
      setState(s => {
        const current = s.userTrails[trailId] || 0;
        const newTrails = { ...s.userTrails, [trailId]: current + 1 };
        localStorage.setItem('userTrails', JSON.stringify(newTrails));
        return {
          ...s,
          userTrails: newTrails
        };
      });
    }, []),

    generateTrailDayContent: useCallback(async (trailTitle, day) => {
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const model = 'gemini-2.5-flash';
      
      try {
        setState(s => ({ ...s, debugInfo: `Preparando Dia ${day}...` }));
        
        const prompt = `Você faz parte de um app cristão. Gere o conteúdo do Dia ${day} da trilha espiritual "${trailTitle}". 
        O conteúdo deve ser encorajador e profundo. Siga estritamente este formato JSON:
        {
          "day": ${day},
          "title": "Título inspirador para hoje",
          "verse": "Versículo bíblico completo (NVI)",
          "reference": "Livro Cap:Ver",
          "content": "Reflexão curta de 2 parágrafos",
          "prayer": "Uma oração curta de 2 frases",
          "task": "Uma pequena tarefa prática para aplicar hoje (ex: Ligar para alguém, Jejuar de redes sociais, etc)"
        }`;

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (!aiResponse.ok) throw new Error(`IA Error: ${aiResponse.status}`);

        const aiData = await aiResponse.json();
        let resultText = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const content = JSON.parse(resultText);
        setState(s => ({ ...s, debugInfo: 'Pronto' }));
        return content;
      } catch (error) {
        console.error('Erro trail gen:', error);
        setState(s => ({ ...s, debugInfo: 'Erro ao carregar trilha' }));
        throw error;
      }
    }, []),

    bgAudio: bgAudioEngine.current // Expõe o motor para o botão
  };

  const isFavorite = useCallback((type, id) => {
    return (state.favorites[type] || []).some((f) => f.id === id);
  }, [state.favorites]);

  if (isInitializing) {
    return (
      <div style={{ 
        minHeight: '100dvh', 
        background: '#0A2A5E', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '24px'
      }}>
        <style>{`
          @keyframes pulse-soft {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          @keyframes spin-premium {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ 
            height: '220px', 
            width: 'auto',
            animation: 'pulse-soft 2s infinite ease-in-out'
          }} 
        />
        <div style={{ 
          width: 24, 
          height: 24, 
          border: '2px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#FFFFFF', 
          borderRadius: '50%', 
          animation: 'spin-premium 0.8s linear infinite' 
        }} />
      </div>
    );
  }

  // onCanPlay removido - play só acontece por ação do usuário

  return (
    <StoreContext.Provider value={{ ...state, ...actions, isFavorite, audio: audioElement }}>
      {children}
      <audio
        ref={globalAudioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={onError}
        onPlay={onPlay}
        onPause={onPause}
        id="main-audio-engine"
        style={{ display: 'none' }}
      />
    </StoreContext.Provider>
  );
}

export default function useStore(selector) {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used within StoreProvider');
  if (selector) return selector(store);
  return store;
}
