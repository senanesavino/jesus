import { X, MessageCircle, Camera, Copy, ExternalLink } from 'lucide-react';
import useStore from '../store/useStore';

export default function ShareModal() {
  const { shareModalOpen, shareContent, closeShareModal } = useStore();

  if (!shareModalOpen || !shareContent) return null;

  const shareText = shareContent.type === 'verse'
    ? `"${shareContent.text}"\n— ${shareContent.reference}\n\n📖 Perto de Jesus`
    : `${shareContent.title}\n\n"${shareContent.verse}"\n— ${shareContent.verseRef}\n\n✝️ Perto de Jesus`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    closeShareModal();
  };

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', color: '#25D366', action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`); closeShareModal(); } },
    { icon: Camera, label: 'Stories', color: '#E4405F', action: closeShareModal },
    { icon: Copy, label: 'Copiar texto', color: 'var(--text-secondary)', action: handleCopy },
    { icon: ExternalLink, label: 'Mais opções', color: 'var(--accent-blue)', action: () => { navigator.share?.({ text: shareText }).catch(() => {}); closeShareModal(); } },
  ];

  return (
    <div className="modal-overlay" onClick={closeShareModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h3 className="text-h3">Compartilhar</h3>
          <button className="btn-icon btn-ghost" onClick={closeShareModal}>
            <X size={20} />
          </button>
        </div>

        {/* Preview card */}
        <div style={{
          padding: '20px',
          background: 'var(--gradient-morning)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <p className="verse-text" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>
            "{shareContent.verse || shareContent.text}"
          </p>
          <p className="verse-reference" style={{ fontSize: '0.75rem' }}>
            {shareContent.verseRef || shareContent.reference}
          </p>
          <div style={{ marginTop: '12px', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Perto de Jesus ✝️
          </div>
        </div>

        {/* Share options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {shareOptions.map(({ icon: Icon, label, color, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '12px 8px', borderRadius: 'var(--radius-md)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--bg-secondary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={color} />
              </div>
              <span className="text-caption">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
