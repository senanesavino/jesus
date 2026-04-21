import React, { useState, useEffect } from 'react';
import logoBrand from '../assets/logo-story.png';

const StoryCard = React.forwardRef(({ content }, ref) => {
  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    // Carrega a imagem nativamente e converte para texto Base64, à prova d'água de bloqueios do iOS/html-to-image
    fetch(logoBrand)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(err => console.error("Erro ao converter logo:", err));
  }, []);

  if (!content) return null;

  const verse = content.verse || content.text;
  const reference = content.verseRef || content.reference;
  const title = content.title || "Palavra do Dia";

  return (
    <div 
      ref={ref}
      style={{
        width: '1080px',
        height: '1920px',
        backgroundColor: '#FDFDFD',
        backgroundImage: 'linear-gradient(180deg, #FDFDFD 0%, #F5F7F2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 80px',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: -2000,
        visibility: 'visible',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        fontFamily: "'Playfair Display', serif"
      }}
    >
      {/* Luz Suave no fundo */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'rgba(123, 143, 106, 0.05)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      {/* Logo Transparente */}
      {logoBase64 && (
        <img 
          src={logoBase64} 
          alt="Logo" 
          style={{ 
            width: '240px', 
            height: '240px', 
            marginBottom: '80px',
            zIndex: 1,
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.05))'
          }} 
        />
      )}

      {/* Título */}
      <div style={{
        fontSize: '42px',
        color: '#7B8F6A',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        fontWeight: 600,
        marginBottom: '60px',
        zIndex: 1,
        fontFamily: "'Inter', sans-serif"
      }}>
        {title}
      </div>

      {/* Frase Divisória */}
      <div style={{
        width: '80px',
        height: '2px',
        background: '#7B8F6A',
        opacity: 0.3,
        marginBottom: '80px',
        zIndex: 1
      }} />

      {/* Versículo Principal */}
      <div style={{
        fontSize: '72px',
        lineHeight: '1.4',
        color: '#2C2825',
        textAlign: 'center',
        padding: '0 40px',
        fontStyle: 'italic',
        zIndex: 1,
        marginBottom: '60px',
        position: 'relative'
      }}>
        <span style={{ 
          position: 'absolute', 
          left: '-20px', 
          top: '-40px', 
          fontSize: '160px', 
          opacity: 0.05, 
          fontStyle: 'normal' 
        }}>“</span>
        {verse}
        <span style={{ 
          position: 'absolute', 
          right: '-20px', 
          bottom: '-100px', 
          fontSize: '160px', 
          opacity: 0.05, 
          fontStyle: 'normal' 
        }}>”</span>
      </div>

      {/* Referência */}
      <div style={{
        fontSize: '36px',
        color: '#5F734E',
        fontWeight: 500,
        zIndex: 1,
        fontFamily: "'Inter', sans-serif"
      }}>
        — {reference}
      </div>

      {/* Rodapé / URL */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        fontSize: '28px',
        color: '#7B8F6A',
        opacity: 0.8,
        letterSpacing: '0.05em',
        zIndex: 1,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '500'
      }}>
        ComDeusHoje ✝️
      </div>
    </div>
  );
});

export default StoryCard;
