'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const dropdownRef = useRef();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent('styleProfileSearch', { detail: query }));
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try { await signOut(auth); router.push('/'); }
      catch (error) { console.error('Logout failed', error); }
    }
  };

  const streak = currentUser?.currentStreak || 0;

  return (
    <>
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="nav-container">
          {/* LEFT - SP Logo */}
          <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-start' }}>
            <Link href="/" className="logo" style={{ textDecoration: 'none', fontSize: '1.4rem' }}>SP</Link>
          </div>

          {/* CENTER - Brand */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.6rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: '600', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              StyleProfile
            </Link>
          </div>

          {/* RIGHT */}
          <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
            {!currentUser ? (
              <>
                {/* Desktop links - hidden on mobile */}
                <div className="nav-desktop-links">
                  <Link href="/about" style={{ textDecoration: 'none', color: '#A38560', fontWeight: '500', fontSize: '0.9rem' }}>About</Link>
                  <Link href="/quiz" style={{ textDecoration: 'none', color: '#C9A84C', fontWeight: '600', fontSize: '0.9rem' }}>✨ Quiz</Link>
                  <Link href="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Login</Link>
                  <Link href="/signup" className="btn-primary" style={{ color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Get Started</Link>
                </div>
                {/* Mobile hamburger */}
                <button className="nav-hamburger" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                  <span /><span /><span />
                </button>
              </>
            ) : (
              <>
                {/* Streak pill */}
                {streak > 0 && (
                  <Link href="/gamification" style={{ textDecoration: 'none', background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.4)', color: '#FF8C42', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    🔥 {streak}
                  </Link>
                )}

                {/* Search */}
                <div className="nav-search-wrap" style={{ display: 'flex', alignItems: 'center', backgroundColor: isSearchExpanded ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '20px', padding: isSearchExpanded ? '4px 12px' : '4px', border: isSearchExpanded ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', transition: 'all 0.3s ease-in-out' }}>
                  <svg onClick={() => setIsSearchExpanded(!isSearchExpanded)} style={{ cursor: 'pointer', minWidth: '20px' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange}
                    style={{ width: isSearchExpanded ? '120px' : '0px', opacity: isSearchExpanded ? 1 : 0, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', color: 'white', padding: isSearchExpanded ? '0 0 0 8px' : '0', transition: 'width 0.3s ease, opacity 0.3s ease', pointerEvents: isSearchExpanded ? 'auto' : 'none' }}
                  />
                </div>

                {/* Profile dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <div onClick={() => setShowDropdown(!showDropdown)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#A38560', color: 'white', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
                    {currentUser.profileImage
                      ? <img src={currentUser.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : <span>{currentUser.initial || 'U'}</span>}
                  </div>

                  {showDropdown && (
                    <div className="dropdown-menu">
                      <Link href="/profile"      className="dropdown-item" onClick={() => setShowDropdown(false)}>👤 My Profile</Link>
                      <Link href="/upload"       className="dropdown-item" onClick={() => setShowDropdown(false)}>📸 Upload Outfit</Link>
                      <Link href="/closet"       className="dropdown-item" onClick={() => setShowDropdown(false)}>👗 My Closet</Link>
                      <Link href="/gamification" className="dropdown-item" onClick={() => setShowDropdown(false)}>🎮 Gamification</Link>
                      <Link href="/style-ai"     className="dropdown-item" onClick={() => setShowDropdown(false)}>✨ StyleAI</Link>
                      <Link href="/ambassador"   className="dropdown-item" onClick={() => setShowDropdown(false)}>🌟 Ambassador</Link>
                      <Link href="/quiz"         className="dropdown-item" onClick={() => setShowDropdown(false)}>🧩 Style Quiz</Link>
                      <div className="dropdown-item" style={{ cursor: 'default' }}>
                        💰 Points: <strong>{currentUser.points || 0}</strong>
                      </div>
                      <div className="dropdown-item" onClick={handleLogout} style={{ color: '#d9534f', fontWeight: 'bold' }}>
                        🚪 Logout
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER */}
      {showMobileMenu && !currentUser && (
        <div style={{ position: 'fixed', top: '73px', left: 0, right: 0, background: '#16302B', borderBottom: '3px solid #A38560', zIndex: 999, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/about"   onClick={() => setShowMobileMenu(false)} style={{ color: '#A38560', textDecoration: 'none', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>About</Link>
          <Link href="/privacy" onClick={() => setShowMobileMenu(false)} style={{ color: '#A38560', textDecoration: 'none', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Privacy</Link>
          <Link href="/quiz"    onClick={() => setShowMobileMenu(false)} style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: '600', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>✨ Style Quiz</Link>
          <Link href="/login"   onClick={() => setShowMobileMenu(false)} style={{ color: 'white', textDecoration: 'none', fontWeight: '500', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Login</Link>
          <Link href="/signup"  onClick={() => setShowMobileMenu(false)} className="btn-primary" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', padding: '12px' }}>Get Started</Link>
        </div>
      )}
    </>
  );
}