import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Music, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useStore();
  const [activeTab, setActiveTab] = useState('messages');

  const tabs = [
    { key: 'messages', label: 'Mensagens', icon: BookOpen },
    { key: 'verses', label: 'Versículos', icon: Heart },
    { key: 'prayers', label: 'Orações', icon: Music },
  ];

  const items = favorites[activeTab] || [];

  return (
    <div className="screen" style={{ paddingTop: '56px' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-h1" style={{ marginBottom: '8px' }}>Meus favoritos</h1>
        <p className="text-body" style={{ marginBottom: '24px' }}>
          As palavras que tocaram o seu coração.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>
            {activeTab === 'messages' ? '📖' : activeTab === 'verses' ? '✝️' : '🎵'}
          </div>
          <h3 className="text-h3" style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Nenhum favorito ainda
          </h3>
          <p className="text-body-sm">
            {activeTab === 'messages'
              ? 'Salve mensagens que toquem seu coração.'
              : activeTab === 'verses'
              ? 'Salve versículos para reler depois.'
              : 'Salve orações para ouvir novamente.'}
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
              style={{ position: 'relative' }}
            >
              {activeTab === 'messages' && (
                <>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  {item.verse && (
                    <div style={{
                      padding: '12px', background: 'var(--accent-olive-bg)',
                      borderRadius: 'var(--radius-sm)', marginBottom: '8px',
                    }}>
                      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.875rem' }}>
                        "{item.verse}"
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-olive)', marginTop: '4px' }}>
                        {item.verseRef}
                      </p>
                    </div>
                  )}
                  {item.reflection && (
                    <p className="text-body-sm" style={{ fontStyle: 'italic' }}>
                      {item.reflection}
                    </p>
                  )}
                </>
              )}

              {activeTab === 'verses' && (
                <>
                  <p className="verse-text" style={{ fontSize: '0.9375rem' }}>"{item.text}"</p>
                  <p className="verse-reference">{item.reference}</p>
                </>
              )}

              {activeTab === 'prayers' && (
                <div className="flex items-center gap-md">
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                    background: item.bgGradient || 'var(--accent-olive-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', flexShrink: 0,
                  }}>
                    {item.emoji || '🙏'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.title}</h4>
                    <span className="text-caption">{item.category} • {item.duration}</span>
                  </div>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => toggleFavorite(activeTab, item)}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(192, 112, 112, 0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <Trash2 size={14} color="#C07070" />
              </button>

              {/* Saved date */}
              {item.savedAt && (
                <div className="text-caption" style={{ marginTop: '8px' }}>
                  Salvo em {new Date(item.savedAt).toLocaleDateString('pt-BR')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
