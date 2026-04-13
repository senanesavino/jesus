export default function EmotionCard({ emotion, onClick, index = 0 }) {
  return (
    <div
      className={`emotion-card animate-fade-in-up stagger-${index + 1}`}
      onClick={() => onClick(emotion)}
      style={{ opacity: 0 }}
    >
      <div
        className="emotion-icon"
        style={{ background: emotion.bgColor }}
      >
        {emotion.emoji}
      </div>
      <span className="emotion-name">{emotion.name}</span>
    </div>
  );
}
