import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

export default function AuthScreen() {
  const { login, signup } = useStore();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const translateError = (message) => {
    if (message === 'Failed to fetch') return 'Falha na conexão. Verifique sua internet ou a configuração do banco.';
    if (message === 'Invalid login credentials') return 'E-mail ou senha incorretos.';
    if (message === 'Email not confirmed') return 'Por favor, confirme seu e-mail antes de entrar.';
    if (message === 'User already registered') return 'Este e-mail já está em uso.';
    if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    return message; // Retorna a original caso não combine com nenhuma
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else if (mode === 'signup') {
        await signup(form.email, form.password, form.name || 'Amado(a)');
      } else {
        // forgot password flow here later
        setMode('login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(translateError(err.message || 'Ocorreu um erro desconhecido.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    // Implement Google Auth later
    setErrorMsg('Login via Google em breve!');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(145deg, #FAF8F5 0%, #F3EDE7 50%, #EDE4D8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 24px',
        margin: '0 auto',
      }}>
        {/* Logo area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #7B8F6A 0%, #6A7D5A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(123, 143, 106, 0.3)',
            fontSize: '1.75rem',
          }}>
            ✝️
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2rem',
            fontWeight: 600,
            color: '#2C2825',
            marginBottom: '8px',
          }}>
            Perto de Jesus
          </h1>
          <p style={{
            color: '#6B635A',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}>
            Seu momento diário com Jesus começa aqui.
          </p>
        </motion.div>

        {/* Tabs */}
        {mode !== 'forgot' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '4px',
              padding: '4px',
              background: '#F3EDE7',
              borderRadius: '9999px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                textAlign: 'center',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 250ms ease',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#2C2825' : '#9E958B',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(44,40,37,0.04)' : 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                textAlign: 'center',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 250ms ease',
                background: mode === 'signup' ? '#FFFFFF' : 'transparent',
                color: mode === 'signup' ? '#2C2825' : '#9E958B',
                boxShadow: mode === 'signup' ? '0 1px 3px rgba(44,40,37,0.04)' : 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Criar conta
            </button>
          </motion.div>
        )}

        {errorMsg && (
          <div style={{
            background: '#FCE8E8',
            color: '#D84B4B',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            marginBottom: '16px',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
          >
            {mode === 'forgot' && (
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.375rem',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}>Recuperar senha</h2>
                <p style={{ fontSize: '0.875rem', color: '#6B635A' }}>
                  Digite seu e-mail para receber um link de recuperação.
                </p>
              </div>
            )}

            {mode === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#6B635A',
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif",
                }}>Nome</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#9E958B" style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 1,
                  }} />
                  <input
                    type="text"
                    placeholder="Como podemos te chamar?"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '16px 20px 16px 44px',
                      background: '#F3EDE7',
                      border: '1.5px solid transparent',
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      color: '#2C2825',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 250ms ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#7B8F6A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(123,143,106,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#F3EDE7';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#6B635A',
                marginBottom: '4px',
                fontFamily: "'Inter', sans-serif",
              }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#9E958B" style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 1,
                }} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 44px',
                    background: '#F3EDE7',
                    border: '1.5px solid transparent',
                    borderRadius: '12px',
                    fontSize: '0.9375rem',
                    color: '#2C2825',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 250ms ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.borderColor = '#7B8F6A';
                    e.target.style.boxShadow = '0 0 0 3px rgba(123,143,106,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F3EDE7';
                    e.target.style.borderColor = 'transparent';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#6B635A',
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif",
                }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#9E958B" style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 1,
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '16px 44px 16px 44px',
                      background: '#F3EDE7',
                      border: '1.5px solid transparent',
                      borderRadius: '12px',
                      fontSize: '0.9375rem',
                      color: '#2C2825',
                      outline: 'none',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all 250ms ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = '#FFFFFF';
                      e.target.style.borderColor = '#7B8F6A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(123,143,106,0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = '#F3EDE7';
                      e.target.style.borderColor = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      padding: 4, background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} color="#9E958B" /> : <Eye size={18} color="#9E958B" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-8px' }}>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#7B8F6A',
                    padding: '4px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
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
                cursor: loading ? 'default' : 'pointer',
                background: 'linear-gradient(135deg, #7B8F6A 0%, #6A7D5A 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(123, 143, 106, 0.25)',
                marginTop: '8px',
                opacity: loading ? 0.7 : 1,
                transition: 'all 250ms ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {loading ? (
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar minha conta' : 'Enviar link'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#6B635A',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Voltar para o login
              </button>
            )}
          </motion.form>
        </AnimatePresence>

        {/* Google login */}
        {mode !== 'forgot' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '24px 0',
              color: '#9E958B',
              fontSize: '0.8125rem',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(44,40,37,0.1)' }} />
              <span>ou</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(44,40,37,0.1)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                background: '#FFFFFF',
                color: '#2C2825',
                border: '1.5px solid rgba(44,40,37,0.08)',
                boxShadow: '0 1px 3px rgba(44,40,37,0.04)',
                cursor: 'pointer',
                transition: 'all 250ms ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
