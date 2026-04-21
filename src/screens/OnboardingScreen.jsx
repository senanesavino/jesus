import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import OneSignal from 'react-onesignal';

const steps = [
  {
    title: 'Quando você quer receber sua palavra?',
    subtitle: 'Escolha o melhor momento do seu dia.',
    key: 'period',
    options: [
      { value: 'manhã', label: 'Manhã', emoji: '☀️', desc: 'Ao acordar' },
      { value: 'tarde', label: 'Tarde', emoji: '🌤️', desc: 'Depois do almoço' },
      { value: 'noite', label: 'Noite', emoji: '🌙', desc: 'Antes de dormir' },
    ],
  },
  {
    title: 'O que você mais precisa hoje?',
    subtitle: 'Vamos personalizar sua experiência.',
    key: 'need',
    options: [
      { value: 'paz', label: 'Paz', emoji: '🕊️', desc: 'Acalmar o coração' },
      { value: 'força', label: 'Força', emoji: '💪', desc: 'Para continuar' },
      { value: 'direção', label: 'Direção', emoji: '🧭', desc: 'Clareza nos passos' },
      { value: 'esperança', label: 'Esperança', emoji: '🌅', desc: 'Um novo olhar' },
      { value: 'recomeço', label: 'Recomeço', emoji: '🌱', desc: 'Partir de novo' },
    ],
  },
  {
    title: 'Como você prefere receber?',
    subtitle: 'Você pode mudar isso depois.',
    key: 'format',
    options: [
      { value: 'leitura', label: 'Leitura', emoji: '📖', desc: 'Ler as mensagens' },
      { value: 'audio', label: 'Áudio', emoji: '🎧', desc: 'Ouvir as orações' },
      { value: 'ambos', label: 'Ambos', emoji: '✨', desc: 'Ler e ouvir' },
    ],
  },
];

export default function OnboardingScreen() {
  const { setPreference, completeOnboarding, preferences } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const selectedValue = preferences[step.key];

  const handleSelect = (value) => {
    setPreference(step.key, value);
  };

  const [requestingPush, setRequestingPush] = useState(false);

  const handleNext = async () => {
    if (!selectedValue) return;
    if (isLast) {
      setRequestingPush(true);
      try {
        // Salvar a preferência do usuário (Manhã, Tarde, Noite) como etiqueta invisível no celular
        const userPeriod = preferences.period || 'manhã';
        if (OneSignal.User) {
          OneSignal.User.addTag('periodo', userPeriod);
        }

        // Tenta o prompt nativo (mais direto)
        if (OneSignal.Notifications) {
          await OneSignal.Notifications.requestPermission();
        } else {
          // Fallback para Slidedown caso o nativo não esteja disponível
          await OneSignal.Slidedown.promptPush({ force: true });
        }
      } catch (e) {
        console.error('Push error:', e);
      } finally {
        setRequestingPush(false);
        completeOnboarding();
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
      }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '50px', width: 'auto' }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1 }}
          >
            {/* Step indicator */}
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent-blue)',
              marginBottom: '12px',
              fontFamily: "'Inter', sans-serif",
            }}>
              Passo {currentStep + 1} de {steps.length}
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.75rem',
              fontWeight: 600,
              lineHeight: 1.25,
              marginBottom: '8px',
              color: 'var(--text-primary)',
            }}>
              {step.title}
            </h1>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '32px',
            }}>
              {step.subtitle}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {step.options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px 24px',
                      background: isSelected ? 'rgba(123,143,106,0.08)' : '#FFFFFF',
                      border: `2px solid ${isSelected ? '#7B8F6A' : 'rgba(44,40,37,0.06)'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 250ms ease',
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(123,143,106,0.1)' : '#F3EDE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.125rem',
                    }}>
                      {option.emoji}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        marginBottom: 2,
                        color: '#2C2825',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {option.label}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9E958B',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {option.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom area */}
        <div style={{ padding: '24px 0 48px' }}>
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedValue}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: selectedValue ? 'pointer' : 'default',
              background: 'linear-gradient(135deg, #7B8F6A 0%, #6A7D5A 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(123, 143, 106, 0.25)',
              opacity: selectedValue ? 1 : 0.4,
              transition: 'all 250ms ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isLast ? 'Começar minha jornada' : 'Continuar'}
            <ArrowRight size={18} />
          </button>

          {/* Dots */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginTop: '24px',
          }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: i === currentStep ? '4px' : '50%',
                  background: i === currentStep ? '#7B8F6A' : 'rgba(44,40,37,0.12)',
                  transition: 'all 250ms ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
