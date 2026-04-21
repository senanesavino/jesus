import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Lock, Sparkles, BookOpen, Quote } from 'lucide-react';
import useStore from '../store/useStore';
import { trails } from '../data/trails';

export default function TrailDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userTrails, generateTrailDayContent, completeTrailDay, isPremium } = useStore();
  
  const trail = trails.find(t => t.id === parseInt(id));
  const completedDays = userTrails[id] || 0;
  const currentDay = Math.min(completedDays + 1, trail?.days || 1);
  
  const [loading, setLoading] = useState(true);
  const [dayContent, setDayContent] = useState(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (!trail) return;
    
    async function loadDay() {
      setLoading(true);
      try {
        const content = await generateTrailDayContent(trail.title, currentDay);
        setDayContent(content);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    loadDay();
  }, [trail, currentDay, generateTrailDayContent]);

  if (!trail) return <div>Trilha não encontrada</div>;

  const handleComplete = async () => {
    setMarkingComplete(true);
    await completeTrailDay(trail.id);
    setTimeout(() => {
        setMarkingComplete(false);
        if (currentDay === trail.days) {
            alert('Parabéns! Você concluiu esta trilha! 🎉');
            navigate('/trails');
        }
    }, 1500);
  };

  return (
    <div className="screen" style={{ paddingTop: '24px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/trails')} className="btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 className="text-h3" style={{ fontSize: '1.1rem' }}>{trail.title}</h1>
          <span className="text-caption">{trail.days} dias de jornada</span>
        </div>
      </div>

      {/* Progress Mini Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="text-caption" style={{ fontWeight: 600, color: trail.color }}>Dia {currentDay} de {trail.days}</span>
            <span className="text-caption">{Math.round((completedDays / trail.days) * 100)}% concluído</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedDays / trail.days) * 100}%` }}
                style={{ height: '100%', background: trail.color }}
            />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '60px 0' }}
          >
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p className="text-body">A IA está preparando sua reflexão do dia...</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="trail-content"
          >
            {/* Top Badge */}
            <div style={{ 
                background: trail.bgColor, color: trail.color, 
                padding: '12px 20px', borderRadius: '16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px'
            }}>
                <Sparkles size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dayContent?.title}</span>
            </div>

            {/* Verse Section */}
            <div className="card" style={{ marginBottom: '20px', borderLeft: `4px solid ${trail.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.6 }}>
                    <Quote size={14} />
                    <span className="text-overline">Versículo do Dia</span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '8px' }}>
                    "{dayContent?.verse}"
                </p>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: trail.color }}>
                    {dayContent?.reference}
                </span>
            </div>

            {/* Reflection */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <BookOpen size={18} color={trail.color} />
                    <h3 className="text-h3" style={{ fontSize: '1rem' }}>Reflexão</h3>
                </div>
                <p className="text-body" style={{ lineHeight: '1.8', fontSize: '1rem' }}>
                    {dayContent?.content}
                </p>
            </div>

            {/* Practical Task */}
            <div style={{ 
                background: 'rgba(123, 143, 106, 0.05)', 
                padding: '20px', borderRadius: '20px', 
                border: '1px dashed var(--accent-olive)',
                marginBottom: '32px'
            }}>
                <div style={{ color: 'var(--accent-olive)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Tarefa Prática
                </div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{dayContent?.task}</p>
            </div>

            {/* Complete Button */}
            <button 
                className={`btn btn-primary btn-block ${markingComplete ? 'loading' : ''}`}
                onClick={handleComplete}
                disabled={markingComplete}
                style={{ background: trail.color, boxShadow: `0 10px 20px ${trail.color}33` }}
            >
                {markingComplete ? 'Salvando progresso...' : (
                    <>
                        <CheckCircle2 size={18} />
                        Concluir Dia {currentDay}
                    </>
                )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
