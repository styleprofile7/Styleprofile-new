'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { login, resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await resetPassword(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setError('No account found with this email.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '0 20px' }}>
      <div className="upload-section" style={{ textAlign: 'left' }}>
        {!showForgot ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>Welcome Back</h2>
              <p style={{ color: '#666' }}>Login to continue your fashion journey</p>
            </div>
            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#fdf0ef', borderRadius: '8px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button disabled={loading} type="submit" className="form-submit">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
              <span onClick={() => setShowForgot(true)} style={{ color: '#A38560', cursor: 'pointer', fontWeight: '500' }}>Forgot Password?</span>
              <br /><br />
              Don't have an account? <Link href="/signup" style={{ color: '#3a735b' }}>Sign up</Link>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>Reset Password</h2>
              <p style={{ color: '#666' }}>Enter your email to receive reset instructions</p>
            </div>
            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#3a735b' }}>
                <p>✅ Password reset email sent! Check your inbox.</p>
                <button onClick={() => setShowForgot(false)} className="form-submit" style={{ marginTop: '1rem' }}>Back to Login</button>
              </div>
            ) : (
              <>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleReset}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                  <button disabled={loading} type="submit" className="form-submit">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <span onClick={() => setShowForgot(false)} style={{ color: '#A38560', cursor: 'pointer' }}>← Back to Login</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
