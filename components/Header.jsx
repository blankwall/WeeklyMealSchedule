import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css'; // Import the CSS file for styling

const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Current', href: '/' },
    { label: 'Next Week', href: '/next' },
    { label: 'Shopping List', href: '/shoppinglist' },
    { label: 'Recipes', href: '/recipes' }
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${
                  pathname === item.href ? styles.activeLink : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
