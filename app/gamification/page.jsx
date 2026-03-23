'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/firebase';
import {
  doc, updateDoc, increment, collection,
  query, orderBy, limit, getDocs, getDoc
} from 'firebase/firestore';
import {
  getLevelInfo, getEarnedBadges, getWeeklyChallenges,
  calcNewStreak, getTodayKey, XP_ACTIONS, LEVELS, BADGES
} from '../../utils/gamification';

export default function GamificationPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('dashboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);
  const [claimedStreak, setClaimedStreak] = useState(false);
  const [toast, setToast] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  if (!currentUser) { router.push('/'); return null; }

  const levelInfo = getLevelInfo(currentUser.points || 0);
  const earnedBadges = getEarnedBadges(currentUser);
  const unearnedBadges = BADGES.filter(b => !earnedBadges.find(e => e.id === b.id));
  const challenges = getWeeklyChallenges();
  const streak = currentUser.currentStreak || 0;
  const longestStreak = currentUser.longestStreak || 0;
  const lastLogin = currentUser.lastLoginDate || '';

  const showToast = (msg, color = '#4CAF50') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Claim daily streak
  const claimDailyStreak = async () => {
    const today = getTodayKey();
    if (lastLogin === today) { showToast('Already claimed today! Come back tomorrow 🌅', '#A38560'); return; }
    const newStreak = calcNewStreak(lastLogin, streak);
    const bonus = newStreak >= 7 ? XP_ACTIONS.STREAK_BONUS.points : 0;
    const pts = XP_ACTIONS.LOGIN_DAILY.points + bonus;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, longestStreak),
        lastLoginDate: today,
        points: increment(pts),
      });
      setClaimedStreak(true);
      showToast(`🔥 Day ${newStreak} streak! +${pts} XP`);
    } catch (e) { console.error(e); }
  };

  // Complete a challenge (demo — in production link to real actions)
  const completeChallenge = async (challenge) => {
    if (completedChallenges.includes(challenge.id)) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        points: increment(challenge.reward),
      });
      setCompletedChallenges(prev => [...prev, challenge.id]);
      showToast(`✅ Challenge complete! +${challenge.reward} XP`);
    } catch (e) { console.error(e); }
  };

  // Load leaderboard
  useEffect(() => {
    async function fetchLB() {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
        const snap = await getDocs(q);
        setLeaderboard(snap.docs.map((d, i) => ({ rank: i + 1, id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoadingLB(false); }
    }
    fetchLB();
  }, []);

  const tabs = [
    { id: 'dashboard', label: '🏠 Overview' },
    { id: 'streak',    label: '🔥 Streak'   },
    { id: 'badges',    label: '🏅 Badges'   },
    { id: 'challenges',label: '⚡ Challenges'},
    { id: 'leaderboard',label:'🏆 Rankings' },
    { id: 'levels',    label: '📈 Levels'   },
  ];

  const G = { // styles
    page: { maxWidth: '900px', margin: '0 auto', padding: '32px 20px 80px' },
    header: { background: 'linear-gradient(135deg, #16302B 0%, #1e4a3d 100%)', borderRadius: '20px', padding: '28px', marginBottom: '24px', color: 'white', position: 'relative', overflow: 'hidden' },
    tabs: { display: 'flex', gap: '6px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' },
    tab: (active) => ({ padding: '8px 16px', borderRadius: '8px', border: 'none', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', background: active ? '#16302B' : '#F0EDE8', color: active ? 'white' : '#444', transition: 'all 0.2s', flexShrink: 0 }),
    card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' },
    statCard: (color) => ({ background: color || '#F7F6F3', borderRadius: '14px', padding: '20px', textAlign: 'center' }),
    label: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '6px' },
    bigNum: (color) => ({ fontFamily: "'Cormorant Garamond', serif", fontSize: '3rem', fontWeight: '300', color: color || '#1A1A1A', lineHeight: '1' }),
    sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: '400', color: '#1A1A1A', marginBottom: '16px' },
    btn: (bg, color) => ({ background: bg || '#16302B', color: color || 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-block' }),
  };

  return (
    <div style={G.page}>
      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.color, color: 'white', padding: '14px 20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 9999, fontWeight: '600', fontSize: '14px', animation: 'slideInRight 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={G.header}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(163,133,96,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#A38560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: 'white', flexShrink: 0 }}>
            {currentUser.initial || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Style Dashboard</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'white', fontWeight: '300' }}>{currentUser.name || 'Style Icon'}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{levelInfo.current.emoji} Level {levelInfo.current.level}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#C9A84C' }}>{levelInfo.current.title}</div>
          </div>
        </div>
        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
            <span>{currentUser.points || 0} XP</span>
            <span>{levelInfo.next ? `${levelInfo.next.xpRequired} XP to Level ${levelInfo.next.level}` : 'MAX LEVEL'}</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${levelInfo.progress}%`, background: 'linear-gradient(90deg, #A38560, #C9A84C)', borderRadius: '50px', transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
            {[
              { label: 'XP',      val: currentUser.points || 0 },
              { label: 'Streak',  val: `${streak}🔥` },
              { label: 'Badges',  val: earnedBadges.length },
              { label: 'Posts',   val: currentUser.postsCount || 0 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={G.tabs}>
        {tabs.map(t => <button key={t.id} style={G.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      {/* ── DASHBOARD ── */}
      {tab === 'dashboard' && (
        <>
          <div style={G.grid3}>
            {[
              { emoji: '🔥', label: 'Current Streak', val: `${streak} days`, bg: '#FFF3E0' },
              { emoji: '🏅', label: 'Badges Earned',  val: `${earnedBadges.length} / ${BADGES.length}`, bg: '#E8F5E9' },
              { emoji: '📈', label: 'Current Level',  val: levelInfo.current.title, bg: '#F3E5F5' },
            ].map(s => (
              <div key={s.label} style={{ ...G.statCard(s.bg) }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.emoji}</div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#1A1A1A' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Daily Claim */}
          <div style={{ ...G.card, background: 'linear-gradient(135deg, #16302B, #1e4a3d)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', marginBottom: '4px' }}>🔥 Daily Check-In</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                  {lastLogin === getTodayKey() ? "You've checked in today ✅" : `Claim your ${streak + 1}-day streak bonus`}
                </div>
              </div>
              <button
                onClick={claimDailyStreak}
                disabled={lastLogin === getTodayKey() || claimedStreak}
                style={{ ...G.btn('#C9A84C', '#0E0E0F'), opacity: (lastLogin === getTodayKey() || claimedStreak) ? 0.5 : 1 }}
              >
                {(lastLogin === getTodayKey() || claimedStreak) ? 'Claimed ✓' : `+${XP_ACTIONS.LOGIN_DAILY.points} XP`}
              </button>
            </div>
          </div>

          {/* Active Challenges preview */}
          <div style={G.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={G.sectionTitle}>⚡ This Week's Challenges</div>
              <button onClick={() => setTab('challenges')} style={{ background: 'none', border: 'none', color: '#A38560', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>See all →</button>
            </div>
            {challenges.slice(0, 2).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F7F6F3', borderRadius: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{c.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{c.desc}</div>
                </div>
                <div style={{ background: '#16302B', color: '#C9A84C', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>+{c.reward}</div>
              </div>
            ))}
          </div>

          {/* Recent badges */}
          <div style={G.card}>
            <div style={G.sectionTitle}>🏅 Recent Badges</div>
            {earnedBadges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No badges yet — start posting and rating!</div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {earnedBadges.slice(0, 6).map(b => (
                  <div key={b.id} style={{ textAlign: 'center', width: '72px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 6px', border: '2px solid #C9A84C' }}>{b.emoji}</div>
                    <div style={{ fontSize: '10px', color: '#444', fontWeight: '600', lineHeight: '1.3' }}>{b.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── STREAK ── */}
      {tab === 'streak' && (
        <>
          <div style={{ ...G.card, textAlign: 'center', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}>
            <div style={{ fontSize: '72px', marginBottom: '8px' }}>🔥</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '4rem', fontWeight: '300', color: 'white', lineHeight: '1' }}>{streak}</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '6px' }}>Day Streak</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Longest: {longestStreak} days</div>
            <button
              onClick={claimDailyStreak}
              disabled={lastLogin === getTodayKey() || claimedStreak}
              style={{ ...G.btn('rgba(255,255,255,0.25)', 'white'), marginTop: '20px', opacity: (lastLogin === getTodayKey() || claimedStreak) ? 0.5 : 1 }}
            >
              {(lastLogin === getTodayKey() || claimedStreak) ? '✅ Claimed Today' : `Claim Day ${streak + 1} (+${XP_ACTIONS.LOGIN_DAILY.points} XP)`}
            </button>
          </div>

          {/* Weekly calendar */}
          <div style={G.card}>
            <div style={G.sectionTitle}>This Week</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {['M','T','W','T','F','S','S'].map((day, i) => {
                const filled = i < Math.min(streak, 7);
                return (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{day}</div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', background: filled ? '#FF6B35' : '#F0EDE8', border: filled ? 'none' : '2px dashed #DDD' }}>
                      {filled ? '🔥' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak milestones */}
          <div style={G.card}>
            <div style={G.sectionTitle}>Streak Milestones</div>
            {[
              { days: 3,  emoji: '🔥', label: 'On Fire',      bonus: 20,  done: streak >= 3 },
              { days: 7,  emoji: '⚡', label: 'Electric Week', bonus: 50,  done: streak >= 7 },
              { days: 14, emoji: '💪', label: 'Two Weeks Strong', bonus: 100, done: streak >= 14 },
              { days: 30, emoji: '🏆', label: 'Unstoppable',   bonus: 300, done: streak >= 30 },
            ].map(m => (
              <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', marginBottom: '10px', background: m.done ? '#E8F5E9' : '#F7F6F3', border: m.done ? '1px solid #4CAF50' : '1px solid transparent' }}>
                <span style={{ fontSize: '24px' }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.days}-Day Streak — {m.label}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>+{m.bonus} XP bonus</div>
                </div>
                <div style={{ fontSize: '20px' }}>{m.done ? '✅' : `${streak}/${m.days}`}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BADGES ── */}
      {tab === 'badges' && (
        <>
          <div style={{ ...G.card, background: '#F7F6F3' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', marginBottom: '4px' }}>
              {earnedBadges.length} <span style={{ color: '#888', fontSize: '1.2rem' }}>/ {BADGES.length} badges</span>
            </div>
            <div style={{ height: '8px', background: '#E0D9D0', borderRadius: '50px', overflow: 'hidden', marginTop: '10px' }}>
              <div style={{ height: '100%', width: `${Math.round((earnedBadges.length / BADGES.length) * 100)}%`, background: 'linear-gradient(90deg, #A38560, #C9A84C)', borderRadius: '50px' }} />
            </div>
          </div>

          {['Posts', 'Points', 'Streaks', 'Social', 'Special'].map(cat => {
            const catBadges = BADGES.filter(b => b.category === cat);
            return (
              <div key={cat} style={G.card}>
                <div style={G.sectionTitle}>{cat}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '14px' }}>
                  {catBadges.map(b => {
                    const earned = !!earnedBadges.find(e => e.id === b.id);
                    return (
                      <div key={b.id} style={{ textAlign: 'center', opacity: earned ? 1 : 0.4 }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: earned ? '#F0EDE8' : '#F7F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 6px', border: earned ? '2px solid #C9A84C' : '2px solid #DDD', filter: earned ? 'none' : 'grayscale(1)' }}>
                          {b.emoji}
                        </div>
                        <div style={{ fontSize: '10px', color: '#333', fontWeight: '600', lineHeight: '1.3', marginBottom: '2px' }}>{b.name}</div>
                        <div style={{ fontSize: '9px', color: '#888', lineHeight: '1.3' }}>{b.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── CHALLENGES ── */}
      {tab === 'challenges' && (
        <>
          <div style={{ ...G.card, background: 'linear-gradient(135deg, #16302B, #1e4a3d)', color: 'white' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '6px' }}>⚡ Weekly Challenges</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Complete challenges to earn bonus XP. Resets every Monday.</div>
          </div>
          {challenges.map(c => {
            const done = completedChallenges.includes(c.id);
            return (
              <div key={c.id} style={{ ...G.card, border: done ? '2px solid #4CAF50' : '2px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: done ? '#E8F5E9' : '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>{c.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{c.title}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>{c.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ background: '#F0EDE8', color: '#A38560', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>+{c.reward} XP</span>
                        <span style={{ background: '#F0F0F0', color: '#666', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>{c.type}</span>
                      </div>
                      <button
                        onClick={() => completeChallenge(c)}
                        disabled={done}
                        style={{ ...G.btn(done ? '#4CAF50' : '#16302B'), padding: '8px 20px', fontSize: '13px', opacity: done ? 0.8 : 1 }}
                      >
                        {done ? '✅ Completed' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bonus challenges */}
          <div style={G.card}>
            <div style={G.sectionTitle}>🎁 Bonus Missions</div>
            {[
              { emoji: '🤝', title: 'Refer a Friend',    desc: 'Get someone to join StyleProfile',    reward: 200 },
              { emoji: '💬', title: 'Ask StyleAI',       desc: 'Get a tip from your AI style advisor', reward: 30  },
              { emoji: '👗', title: 'Fill Your Closet',  desc: 'Add 3 items to your digital closet',  reward: 60  },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F7F6F3', borderRadius: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{m.desc}</div>
                </div>
                <div style={{ background: '#16302B', color: '#C9A84C', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>+{m.reward}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── LEADERBOARD ── */}
      {tab === 'leaderboard' && (
        <>
          <div style={{ ...G.card, background: 'linear-gradient(135deg, #C9A84C, #A38560)', color: '#0E0E0F' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', marginBottom: '4px' }}>🏆 Weekly Rankings</div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>Top 10 StyleProfile members by XP</div>
          </div>

          {loadingLB ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading rankings...</div>
          ) : (
            <div style={G.card}>
              {leaderboard.map((user, i) => {
                const isMe = user.id === currentUser.uid;
                const medals = ['🥇', '🥈', '🥉'];
                const lvl = getLevelInfo(user.points || 0);
                return (
                  <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 12px', borderRadius: '12px', marginBottom: '8px', background: isMe ? '#F0EDE8' : '#F7F6F3', border: isMe ? '2px solid #C9A84C' : '2px solid transparent' }}>
                    <div style={{ width: '32px', textAlign: 'center', fontSize: i < 3 ? '22px' : '15px', fontWeight: '700', color: '#888', flexShrink: 0 }}>
                      {i < 3 ? medals[i] : `#${i + 1}`}
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#A38560', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>
                      {user.initial || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{user.name || 'Anonymous'} {isMe ? '(you)' : ''}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{lvl.current.emoji} {lvl.current.title}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#A38560', fontSize: '15px' }}>{(user.points || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#888' }}>XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── LEVELS ── */}
      {tab === 'levels' && (
        <>
          <div style={G.card}>
            <div style={G.sectionTitle}>Your Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#F0EDE8', borderRadius: '14px', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: levelInfo.current.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>{levelInfo.current.emoji}</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>{levelInfo.current.title}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Level {levelInfo.current.level} · {currentUser.points || 0} XP</div>
              </div>
              {levelInfo.next && (
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#888' }}>Next level</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{levelInfo.next.title}</div>
                  <div style={{ fontSize: '11px', color: '#A38560' }}>{levelInfo.next.xpRequired - (currentUser.points || 0)} XP away</div>
                </div>
              )}
            </div>
            <div style={{ height: '10px', background: '#E0D9D0', borderRadius: '50px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${levelInfo.progress}%`, background: `linear-gradient(90deg, ${levelInfo.current.color}, #C9A84C)`, borderRadius: '50px', transition: 'width 1s ease' }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#888', marginTop: '6px' }}>{levelInfo.progress}%</div>
          </div>

          <div style={G.card}>
            <div style={G.sectionTitle}>All Levels</div>
            {LEVELS.map(l => {
              const unlocked = (currentUser.points || 0) >= l.xpRequired;
              const isCurrent = l.level === levelInfo.current.level;
              return (
                <div key={l.level} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '12px', marginBottom: '8px', background: isCurrent ? '#F0EDE8' : unlocked ? '#F7F6F3' : '#FAFAFA', border: isCurrent ? `2px solid ${l.color}` : '2px solid transparent', opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: l.color + '25', border: `2px solid ${l.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{l.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>Level {l.level} — {l.title}</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{l.xpRequired.toLocaleString()} XP required</div>
                  </div>
                  <div style={{ fontSize: '18px' }}>{unlocked ? '✅' : '🔒'}</div>
                </div>
              );
            })}
          </div>

          <div style={G.card}>
            <div style={G.sectionTitle}>How to Earn XP</div>
            {Object.entries(XP_ACTIONS).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EDE8' }}>
                <span style={{ fontSize: '13px', color: '#444' }}>{val.label.replace(/^\+\d+ /, '')}</span>
                <span style={{ background: '#F0EDE8', color: '#A38560', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{val.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
