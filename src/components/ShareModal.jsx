import { useRef, useState } from 'react';
import { X, MessageCircle, Camera, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import useStore from '../store/useStore';
import StoryCard from './StoryCard';

export default function ShareModal() {
  const { shareModalOpen, shareContent, closeShareModal } = useStore();
  const storyRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!shareModalOpen || !shareContent) return null;

  const shareText = shareContent.type === 'verse'
    ? `"${shareContent.text}"\n— ${shareContent.reference}\n\n📖 ComDeusHoje`
    : `${shareContent.title}\n\n"${shareContent.verse}"\n— ${shareContent.verseRef}\n\n✝️ ComDeusHoje`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText);
    closeShareModal();
  };

  const handleStoryShare = async () => {
    if (!storyRef.current) return;
    setIsGenerating(true);
    
    // Força as imagens a carregarem completamente na DOM fantasma
    const images = Array.from(storyRef.current.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // ignora erro e segue pra não travar
      });
    }));

    // Atraso maior para garantir que o hardware do celular renderize tudo
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const dataUrl = await toPng(storyRef.current, {
        quality: 1, // Qualidade máxima
        pixelRatio: 2, 
        skipFonts: false, // Força o carregamento das fontes Premium
        useCORS: true, // Garante que a logo seja renderizada corretamente
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'story-com-deus-hoje.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Compartilhar Palavra',
          text: 'ComDeusHoje 🕊️'
        });
      } else {
        // Fallback: Download
        const link = document.createElement('a');
        link.download = 'story-com-deus-hoje.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Erro ao gerar Story:', err);
    } finally {
      setIsGenerating(false);
      closeShareModal();
    }
  };

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', color: '#25D366', action: () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`); closeShareModal(); } },
    { 
      icon: isGenerating ? Loader2 : Camera, 
      label: isGenerating ? 'Gerando...' : 'Stories', 
      color: '#E4405F', 
      action: handleStoryShare 
    },
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
            ComDeusHoje ✝️
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
        
        {/* Story Generator Hidden Instance */}
        <StoryCard ref={storyRef} content={shareContent} />

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    </div>
  );
}
