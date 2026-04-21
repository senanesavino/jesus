import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, History, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';

export default function JourneyScreen() {
  const navigate = useNavigate();
  const { dailyMessage } = useStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJourney() {
      try {
        const { data, error } = await supabase
          .from('daily_messages')
          .select('*')
          .order('publish_date', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error('Journey error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJourney();
  }, []);

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(date);
  };

  return (
    <div className="screen header-gradient" style={{ minHeight: '100dvh', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '32px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'rgba(123, 143, 106, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-olive)'
          }}>
            <History size={20} />
          </div>
          <div>
            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.75rem', 
              fontWeight: 600, 
              color: 'var(--text-primary)' 
            }}>Jornada</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Relembre as palavras que Deus já te deu.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, index) => {
            const isToday = msg.publish_date === dailyMessage?.publish_date;
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate('/devotional', { 
                  state: { 
                    devotional: {
                      title: msg.title,
                      verse: msg.verse,
                      verseRef: msg.reference,
                      message: msg.content,
                      prayer: msg.prayer,
                      audio_url: msg.audio_url
                    } 
                  } 
                })}
                style={{
                  background: isToday ? 'rgba(123, 143, 106, 0.05)' : 'white',
                  borderRadius: '20px',
                  padding: '16px',
                  border: `1px solid ${isToday ? 'var(--accent-olive)' : 'rgba(0,0,0,0.05)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--accent-olive)',
                    color: 'white',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderBottomLeftRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    Hoje
                  </div>
                )}

                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {msg.publish_date.split('-')[1] === '01' ? 'Jan' : 
                     msg.publish_date.split('-')[1] === '02' ? 'Fev' : 
                     msg.publish_date.split('-')[1] === '03' ? 'Mar' : 
                     msg.publish_date.split('-')[1] === '04' ? 'Abr' : 
                     msg.publish_date.split('-')[1] === '05' ? 'Mai' : 
                     msg.publish_date.split('-')[1] === '06' ? 'Jun' : 
                     msg.publish_date.split('-')[1] === '07' ? 'Jul' : 
                     msg.publish_date.split('-')[1] === '08' ? 'Ago' : 
                     msg.publish_date.split('-')[1] === '09' ? 'Set' : 
                     msg.publish_date.split('-')[1] === '10' ? 'Out' : 
                     msg.publish_date.split('-')[1] === '11' ? 'Nov' : 'Dez'}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {msg.publish_date.split('-')[2]}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: 'var(--text-primary)',
                    marginBottom: '2px',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {msg.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.8125rem', 
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {msg.verse || msg.content}
                  </p>
                </div>

                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            );
          })}
          
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>Sua jornada está apenas começando.</p>
              <p style={{ fontSize: '0.875rem' }}>Amanhã teremos uma nova palavra aqui.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
