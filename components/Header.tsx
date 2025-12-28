'use client';

import { Music, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Processor' },
    { href: '/guide', label: 'Guide' },
    { href: '/features', label: 'Features' },
    { href: '/examples', label: 'Examples' },
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
        </nav>
      </div>
    </header>
  );
}

