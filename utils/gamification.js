// ─── LEVELS ───────────────────────────────────────────────
export const LEVELS = [
  { level: 1, title: 'Fresh Fit',       xpRequired: 0,    color: '#9E9E9E', emoji: '👟' },
  { level: 2, title: 'Style Curious',   xpRequired: 100,  color: '#8BC34A', emoji: '🌱' },
  { level: 3, title: 'Outfit Builder',  xpRequired: 250,  color: '#4CAF50', emoji: '🧩' },
  { level: 4, title: 'Trend Spotter',   xpRequired: 500,  color: '#00BCD4', emoji: '🔍' },
  { level: 5, title: 'Style Savant',    xpRequired: 1000, color: '#2196F3', emoji: '💡' },
  { level: 6, title: 'Fashion Voice',   xpRequired: 2000, color: '#9C27B0', emoji: '🎤' },
  { level: 7, title: 'Tastemaker',      xpRequired: 3500, color: '#FF5722', emoji: '🔥' },
  { level: 8, title: 'Icon',            xpRequired: 5000, color: '#FF9800', emoji: '👑' },
  { level: 9, title: 'Style Legend',    xpRequired: 8000, color: '#A38560', emoji: '💎' },
  { level: 10, title: 'The 1%',         xpRequired: 12000,color: '#C9A84C', emoji: '✦' },
];

export function getLevelInfo(points) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next
    ? Math.min(100, Math.round(((points - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100))
    : 100;
  return { current, next, progress };
}

// ─── BADGES ───────────────────────────────────────────────
export const BADGES = [
  // Posting
  { id: 'first_post',    emoji: '📸', name: 'First Look',      desc: 'Post your first outfit',          category: 'Posts',    check: (u) => (u.postsCount || 0) >= 1 },
  { id: 'five_posts',    emoji: '🖼️', name: 'Gallery',         desc: 'Post 5 outfits',                  category: 'Posts',    check: (u) => (u.postsCount || 0) >= 5 },
  { id: 'ten_posts',     emoji: '🎬', name: 'Content Creator', desc: 'Post 10 outfits',                 category: 'Posts',    check: (u) => (u.postsCount || 0) >= 10 },
  { id: 'fifty_posts',   emoji: '🏛️', name: 'Archivist',       desc: 'Post 50 outfits',                 category: 'Posts',    check: (u) => (u.postsCount || 0) >= 50 },
  // Points
  { id: 'pts_100',       emoji: '💫', name: 'Style Starter',   desc: 'Earn 100 points',                 category: 'Points',   check: (u) => (u.points || 0) >= 100 },
  { id: 'pts_500',       emoji: '⭐', name: 'Rising Star',     desc: 'Earn 500 points',                 category: 'Points',   check: (u) => (u.points || 0) >= 500 },
  { id: 'pts_1000',      emoji: '🌟', name: 'Star Power',      desc: 'Earn 1,000 points',               category: 'Points',   check: (u) => (u.points || 0) >= 1000 },
  { id: 'pts_5000',      emoji: '💎', name: 'Diamond Drip',    desc: 'Earn 5,000 points',               category: 'Points',   check: (u) => (u.points || 0) >= 5000 },
  // Streaks
  { id: 'streak_3',      emoji: '🔥', name: 'On Fire',         desc: '3-day login streak',              category: 'Streaks',  check: (u) => (u.longestStreak || 0) >= 3 },
  { id: 'streak_7',      emoji: '⚡', name: 'Electric Week',   desc: '7-day streak',                    category: 'Streaks',  check: (u) => (u.longestStreak || 0) >= 7 },
  { id: 'streak_30',     emoji: '🏆', name: 'Unstoppable',     desc: '30-day streak',                   category: 'Streaks',  check: (u) => (u.longestStreak || 0) >= 30 },
  // Social
  { id: 'first_like',    emoji: '❤️', name: 'Spread Love',     desc: 'Like your first outfit',          category: 'Social',   check: (u) => (u.likesGiven || 0) >= 1 },
  { id: 'rate_10',       emoji: '🎯', name: 'Critic',          desc: 'Rate 10 outfits',                 category: 'Social',   check: (u) => (u.ratingsGiven || 0) >= 10 },
  { id: 'referral_1',    emoji: '🤝', name: 'Connector',       desc: 'Refer your first friend',         category: 'Social',   check: (u) => (u.referrals || 0) >= 1 },
  { id: 'referral_5',    emoji: '🌐', name: 'Community Builder',desc: 'Refer 5 friends',               category: 'Social',   check: (u) => (u.referrals || 0) >= 5 },
  // Special
  { id: 'quiz_done',     emoji: '✨', name: 'Self-Aware',      desc: 'Complete the Style Quiz',         category: 'Special',  check: (u) => !!u.personality },
  { id: 'closet_5',      emoji: '👗', name: 'Curator',         desc: 'Add 5 items to your closet',      category: 'Special',  check: (u) => (u.closetCount || 0) >= 5 },
  { id: 'early_adopter', emoji: '🚀', name: 'Early Adopter',   desc: 'Join in the first month',         category: 'Special',  check: (u) => true }, // granted on signup
];

export function getEarnedBadges(user) {
  return BADGES.filter(b => b.check(user));
}

export function getNewBadges(oldUser, newUser) {
  const oldEarned = new Set(getEarnedBadges(oldUser).map(b => b.id));
  return getEarnedBadges(newUser).filter(b => !oldEarned.has(b.id));
}

// ─── WEEKLY CHALLENGES ────────────────────────────────────
export function getWeeklyChallenges() {
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const challenges = [
    [
      { id: 'c1', emoji: '🖤', title: 'All Black Everything',    desc: 'Post a monochrome black outfit',          reward: 150, type: 'post' },
      { id: 'c2', emoji: '🌿', title: 'Earth Tones Only',        desc: 'Rate 5 neutral-toned outfits',            reward: 75,  type: 'rate' },
      { id: 'c3', emoji: '👟', title: 'Sneaker Week',            desc: 'Post an outfit featuring sneakers',       reward: 120, type: 'post' },
    ],
    [
      { id: 'c4', emoji: '🏙️', title: 'City Slicker',           desc: 'Upload a streetwear look',                reward: 130, type: 'post' },
      { id: 'c5', emoji: '⭐', title: 'Critic\'s Choice',        desc: 'Rate 10 outfits this week',               reward: 100, type: 'rate' },
      { id: 'c6', emoji: '🎨', title: 'Bold Color Drop',         desc: 'Post an outfit with one statement color', reward: 140, type: 'post' },
    ],
    [
      { id: 'c7', emoji: '♻️', title: 'Thrift & Vintage',        desc: 'Post a thrifted or vintage outfit',       reward: 160, type: 'post' },
      { id: 'c8', emoji: '🤝', title: 'Community Builder',       desc: 'Refer 1 new user this week',              reward: 200, type: 'refer' },
      { id: 'c9', emoji: '💼', title: 'Work Mode',               desc: 'Post a professional or business look',    reward: 120, type: 'post' },
    ],
  ];
  return challenges[week % challenges.length];
}

// ─── STREAK HELPERS ────────────────────────────────────────
export function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function calcNewStreak(lastLoginDate, currentStreak) {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  if (lastLoginDate === today) return currentStreak; // already logged today
  if (lastLoginDate === yesterday) return currentStreak + 1; // consecutive
  return 1; // streak broken
}

// ─── POINT ACTIONS ────────────────────────────────────────
export const XP_ACTIONS = {
  LOGIN_DAILY:     { points: 10,  label: '+10 Daily login' },
  POST_OUTFIT:     { points: 50,  label: '+50 Post outfit' },
  RATE_OUTFIT:     { points: 10,  label: '+10 Rate outfit' },
  LIKE_OUTFIT:     { points: 5,   label: '+5 Like outfit'  },
  VOTE_WEAR:       { points: 2,   label: '+2 Vote'         },
  REFER_USER:      { points: 100, label: '+100 Referral'   },
  STREAK_BONUS:    { points: 20,  label: '+20 Streak bonus'},
  COMPLETE_CHALLENGE: { points: 150, label: '+150 Challenge' },
};
