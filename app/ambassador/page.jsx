'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Ambassador() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!currentUser) { router.push('/'); return null; }

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${currentUser.referralCode}`
    : `https://styleprofile.co/signup?ref=${currentUser.referralCode}`;

  const referrals = currentUser.referrals || 0;

  const getLevel = (refs) => {
    if (refs >= 50) return 'Diamond';
    if (refs >= 25) return 'Gold';
    if (refs >= 10) return 'Silver';
    if (refs >= 5) return 'Bronze';
    return 'Starter';
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <div className="ambassador-stats">
        <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>🌟 Ambassador Program</h2>
        <p style={{ opacity: 0.85 }}>Refer friends, earn points, unlock rewards</p>
        <div className="stats-grid">
          <div className="stat-card">
            <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.3rem 0', color: 'white' }}>{referrals}</h3>
            <p style={{ opacity: 0.85 }}>Referrals</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.3rem 0', color: 'white' }}>{referrals * 100}</h3>
            <p style={{ opacity: 0.85 }}>Points Earned</p>
          </div>
          <div className="stat-card">
            <h3 style={{ fontSize: '2rem', margin: '0 0 0.3rem 0', color: 'white' }}>{getLevel(referrals)}</h3>
            <p style={{ opacity: 0.85 }}>Level</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Your Referral Link</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            readOnly
            value={referralLink}
            style={{ flex: 1, padding: '0.9rem', border: '2px solid #E8E6E1', borderRadius: '8px', fontSize: '0.9rem', background: '#F7F8FA', fontFamily: 'Inter, sans-serif' }}
          />
          <button className="btn-primary" onClick={copyLink}>
            {copied ? '✅ Copied!' : 'Copy Link'}
          </button>
        </div>

        <h3 style={{ marginBottom: '1rem' }}>How It Works</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            ['1️⃣', 'Share your unique referral link with friends'],
            ['2️⃣', 'When they sign up and post their first outfit, you earn 100 points'],
            ['3️⃣', 'Reach 10 referrals to become a Silver Ambassador'],
            ['4️⃣', 'Unlock exclusive perks and bonuses as you level up'],
          ].map(([emoji, text]) => (
            <div key={emoji} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F7F8FA', borderRadius: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
              <p style={{ margin: 0, color: '#444' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Ambassador Levels</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { level: 'Starter', refs: '0', color: '#8B9AAF' },
            { level: 'Bronze', refs: '5+', color: '#CD7F32' },
            { level: 'Silver', refs: '10+', color: '#95A5A6' },
            { level: 'Gold', refs: '25+', color: '#C9A84C' },
            { level: 'Diamond', refs: '50+', color: '#5DADE2' },
          ].map(({ level, refs, color }) => (
            <div key={level} style={{ textAlign: 'center', padding: '1.2rem', border: `2px solid ${getLevel(referrals) === level ? color : '#E8E6E1'}`, borderRadius: '12px', background: getLevel(referrals) === level ? `${color}15` : 'white' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {level === 'Starter' ? '🌱' : level === 'Bronze' ? '🥉' : level === 'Silver' ? '🥈' : level === 'Gold' ? '🥇' : '💎'}
              </div>
              <div style={{ fontWeight: '700', color, marginBottom: '0.3rem' }}>{level}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{refs} referrals</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
