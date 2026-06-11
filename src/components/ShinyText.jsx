import './ShinyText.css';

const ShinyText = ({
  text,
  disabled = false,
  speed = 3,
  className = '',
  color = '#b5b5b5',
  shineColor = '#ffffff',
  spread = 120,
  pauseOnHover = false,
  delay = 0
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    '--shine-speed': `${speed}s`,
    '--shine-delay': `${delay}s`,
  };

  return (
    <span
      className={`shiny-text ${pauseOnHover ? 'paused' : ''} ${disabled ? '' : ''} ${className}`}
      style={disabled ? { color, WebkitTextFillColor: color } : gradientStyle}
    >
      {text}
    </span>
  );
};

export default ShinyText;
