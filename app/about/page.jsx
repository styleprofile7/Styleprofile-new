export default function About() {
  const personalities = [
    { name: 'The 1 Percenter', desc: 'Epitome of luxury and elegance', color: '#CC8B3C', emoji: '👑' },
    { name: 'The Influencer', desc: 'Stay on trend', color: '#8B9AAF', emoji: '🤳' },
    { name: 'The Creative', desc: 'Express individuality', color: '#2C3E50', emoji: '🎨' },
    { name: "The Hood's Finest", desc: 'Oversized and flashy', color: '#6B4C5C', emoji: '🔥' },
    { name: 'The Rich Housewife', desc: 'Luxuries and expression', color: '#B4838D', emoji: '🌹' },
    { name: 'The Executive', desc: 'Reliability and respect', color: '#5D6D7E', emoji: '💼' },
    { name: 'The 9to5er', desc: 'Work hard, look good', color: '#7F8C8D', emoji: '⭐' },
    { name: 'The Alt', desc: 'Rebellious individuality', color: '#34495E', emoji: '⚡' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'left' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.8rem', fontWeight: '600', color: '#2C2C2C', marginBottom: '1rem' }}>
          About StyleProfile
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#666', lineHeight: '1.8', marginBottom: '3rem' }}>
          StyleProfile is a new way to understand fashion. We've created a personality-driven experience
          that helps you discover your unique style identity — and connect with others who share your aesthetic.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: '600', color: '#2C2C2C', marginBottom: '1.5rem' }}>
          The 8 Fashion Personalities
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {personalities.map(({ name, desc, color, emoji }) => (
            <div key={name} style={{ padding: '1.2rem 1.5rem', background: '#F7F8FA', borderRadius: '12px', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
              <div>
                <strong style={{ color }}>{name}</strong>
                <span style={{ color: '#666' }}> — {desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', padding: '2rem', background: '#16302B', borderRadius: '12px', color: '#E8B87D', textAlign: 'center' }}>
          <h3 style={{ color: '#E8B87D', marginBottom: '1rem' }}>Not sure which personality fits you?</h3>
          <a href="/quiz" style={{ display: 'inline-block', padding: '0.8rem 2rem', background: '#A38560', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            ✨ Take the Style Quiz
          </a>
        </div>
      </div>
    </div>
  );
}
