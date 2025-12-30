'use client';

import { Music, Menu, X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navLinks = [
    { href: '/', label: 'Processor' },
    { href: '/guide', label: 'Guide' },
    { href: '/features', label: 'Features' },
    { href: '/examples', label: 'Examples' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Music size={28} />
          <span>AudioFX Pro</span>
        </Link>
        
        <button 
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={styles.navLink}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {status === 'loading' ? null : session ? (
            <>
              <Link 
                href="/subscription" 
                className={`${styles.navLink} ${styles.subscriptionLink}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {session.user?.subscription === 'free' ? 'Upgrade' : 'Subscription'}
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.userName}>
                  <User size={16} />
                  {session.user?.name || session.user?.email?.split('@')[0]}
                </span>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={styles.signOutButton}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link 
              href="/auth/signin" 
              className={`${styles.navLink} ${styles.signInLink}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

