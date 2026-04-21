import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, BookOpen, Music, Compass, Heart, Moon, Clock, Sparkles } from 'lucide-react';
import useStore from '../store/useStore';

const benefits = [
  { icon: Compass, text: 'Todas as trilhas guiadas', desc: 'Jornadas completas de 7 a 21 dias' },
  { icon: Music, text: 'Biblioteca completa de orações', desc: 'Mais de 50 orações em áudio' },
  { icon: Sparkles, text: 'Conteúdos exclusivos', desc: 'Mensagens e reflexões especiais' },
  { icon: Heart, text: 'Mais temas por emoção', desc: 'Conteúdo expandido para cada sentimento' },
  { icon: Moon, text: 'Modo noite especial', desc: 'Experiência noturna premium' },
  { icon: Clock, text: 'Histórico completo', desc: 'Acesse todas as palavras anteriores' },
  { icon: BookOpen, text: 'Favoritos ilimitados', desc: 'Salve tudo o que tocar seu coração' },
];

export default function PremiumScreen() {
  const navigate = useNavigate();
  const { isPremium, setPremium } = useStore();

  return (
    <div className="screen" style={{ paddingTop: '20px', background: 'var(--bg-primary)' }}>
      {/* Back */}
      <button
        className="btn-ghost flex items-center gap-sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px', padding: '8px 0' }}
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center', padding: '32px 20px',
          background: 'var(--gradient-premium)', borderRadius: 'var(--radius-xl)',
          color: 'white', position: 'relative', overflow: 'hidden', marginBottom: '28px',
        }}
      >
        <div style={{
          position: 'absolute', top: '-40px', right: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-50px', left: '-20px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <img src="/logo.png" alt="Com Deus Hoje" style={{ height: '40px', width: 'auto', marginBottom: '16px' }} />
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={24} />
            </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.75rem',
            fontWeight: 600, marginBottom: '8px',
          }}>
            Com Deus Hoje
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-full)', fontSize: '0.75rem',
            fontWeight: 600, letterSpacing: '0.05em',
          }}>
            <Sparkles size={12} /> PREMIUM
          </div>
          <p style={{ marginTop: '16px', fontSize: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
            Vá mais fundo na sua jornada com Jesus. Conteúdos exclusivos, trilhas completas e uma experiência ainda mais íntima.
          </p>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '28px' }}
      >
        <h2 className="text-overline" style={{ color: 'var(--accent-gold)', marginBottom: '20px' }}>
          O que você ganha
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {benefits.map(({ icon: Icon, text, desc }, index) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: 'var(--accent-gold-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="var(--accent-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '2px' }}>{text}</div>
                <div className="text-caption">{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ marginBottom: '28px' }}
      >
        {/* Monthly */}
        <div className="card" style={{
          marginBottom: '12px', borderColor: 'rgba(44,40,37,0.08)',
          cursor: 'pointer', position: 'relative',
        }}>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Mensal</div>
              <div className="text-caption">Cancele quando quiser</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                R$ 14,90
              </div>
              <div className="text-caption">/mês</div>
            </div>
          </div>
        </div>

        {/* Annual — recommended */}
        <div className="card" style={{
          border: '2px solid var(--accent-gold)', cursor: 'pointer', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: '-10px', right: '16px',
            padding: '2px 10px', background: 'var(--gradient-premium)',
            borderRadius: 'var(--radius-full)', color: 'white',
            fontSize: '0.6875rem', fontWeight: 600,
          }}>
            Mais popular
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Anual</div>
              <div className="text-caption">Economize 40%</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                R$ 178,80
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                R$ 9,90
              </div>
              <div className="text-caption">/mês</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {isPremium ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
              background: 'var(--accent-olive-bg)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={24} color="var(--accent-olive)" />
            </div>
            <h3 className="text-h3" style={{ color: 'var(--accent-olive)' }}>Você é Premium!</h3>
            <p className="text-body-sm" style={{ marginTop: '4px' }}>
              Aproveite todos os conteúdos exclusivos.
            </p>
          </div>
        ) : (
          <>
            <button
              className="btn btn-gold btn-block"
              onClick={() => setPremium(true)}
              style={{ padding: '16px', fontSize: '1rem' }}
            >
              <Crown size={18} />
              Começar minha jornada Premium
            </button>
            <p style={{
              textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)',
              marginTop: '12px', lineHeight: 1.5,
            }}>
              7 dias grátis • Cancele quando quiser • Sem compromisso
            </p>
          </>
        )}
      </motion.div>

      {/* Testimonial */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '28px', padding: '20px', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)', textAlign: 'center',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          marginBottom: '12px',
        }}>
          "O Com Deus Hoje transformou minhas manhãs. Agora começo cada dia com paz e uma palavra de Deus no coração."
        </p>
        <div className="text-caption">— Maria, São Paulo</div>
      </motion.div>
    </div>
  );
}
