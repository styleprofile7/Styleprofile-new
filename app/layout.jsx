import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'StyleProfile — Discover Your Fashion Identity',
  description: 'Join our community, share your style, and connect with fashion enthusiasts worldwide.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: '80px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
