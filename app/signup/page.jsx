'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { personalityOptions } from '../../utils/quizData';

function SignupForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personality, setPersonality] = useState(searchParams.get('personality') || '');
  const [referral, setReferral] = useState(searchParams.get('ref') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      await signup(email, password, name, personality, referral);
      router.push('/');
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
      <div className="upload-section" style={{ textAlign: 'left' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Join StyleProfile</h2>
          <p style={{ color: '#666' }}>Start discovering your fashion identity</p>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#fdf0ef', borderRadius: '8px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fashion Personality</label>
            <select required value={personality} onChange={(e) => setPersonality(e.target.value)}>
              <option value="">Select your style...</option>
              {personalityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Referral Code (Optional)</label>
            <input type="text" placeholder="Enter referral code" value={referral} onChange={(e) => setReferral(e.target.value)} />
          </div>
          <button disabled={loading} type="submit" className="form-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
          Already have an account? <Link href="/login" style={{ color: '#3a735b' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
