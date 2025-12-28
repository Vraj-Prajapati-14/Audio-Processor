import Link from 'next/link';
import { Music } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    const productLinks = [
        { href: '/', label: 'Processor' },
        { href: '/features', label: 'Features' },
        { href: '/guide', label: 'User Guide' },
        { href: '/examples', label: 'Examples' },
    ];

    const resourceLinks = [
        { href: '/guide', label: 'Documentation' },
        { href: '/examples', label: 'Examples' },
        { href: '/features', label: 'Audio Effects' },
    ];

    const legalLinks = [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brandSection}>
                        <Link href="/" className={styles.logo}>
                            <Music size={24} />
                            <span>AudioFX Pro</span>
                        </Link>
                        <p className={styles.description}>
                            Transform your audio with professional effects. Free, fast, and completely private.
                        </p>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>Product</h4>
                        <ul className={styles.linksList}>
                            {productLinks.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>Resources</h4>
                        <ul className={styles.linksList}>
                            {resourceLinks.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.linksSection}>
                        <h4 className={styles.linksTitle}>Legal</h4>
                        <ul className={styles.linksList}>
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className={styles.link}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} AudioFX Pro. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

