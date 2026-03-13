'use client';

import { useState, useEffect, useCallback } from 'react';
import { CustomCursor } from "@/components/animations/custom-cursor";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#revolution', label: 'Revolution' },
    { href: '#join', label: 'Join' },
  ];

  return (
    <div className="cursor-custom">
      <CustomCursor />
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-12 py-4 bg-abyss/80 backdrop-blur-md border-b border-white/5"
      >
        <a
          href="#hero"
          className="font-display font-bold text-xl tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm"
          aria-label="ULTRASTREAM - back to top"
        >
          <span className="text-gradient-gold">ULTRA</span>
          <span className="text-text-primary">STREAM</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-text-primary transition-colors text-sm tracking-wide uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm focus-visible:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-md text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            /* X icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] bg-abyss/95 backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Tap backdrop to close */}
          <div className="absolute inset-0" onClick={closeMenu} />
          <nav
            className="relative flex flex-col items-center justify-center h-full gap-2"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="w-full max-w-xs text-center py-4 text-lg font-display font-semibold tracking-wider uppercase text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <main role="main" className="min-h-screen pt-[77px]">
        {children}
      </main>

      <footer role="contentinfo" className="border-t border-white/5 bg-void py-12 md:py-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          {/* Top section: Logo + Links */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-12 mb-12">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <div className="font-display font-bold text-2xl tracking-wider">
                <span className="text-gradient-gold">ULTRA</span>
                <span className="text-text-primary">STREAM</span>
              </div>
              <p className="text-text-muted text-sm max-w-xs">
                The decentralized streaming platform for creators and gamers.
                For the people. By the people. Against the machine.
              </p>
              <p className="text-text-muted text-xs mt-1">
                Part of{" "}
                <span className="text-neon-purple font-medium">ULTRAVERSE.games</span>
              </p>
            </div>

            {/* Link columns — stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
              <div>
                <h3 className="text-text-primary font-display font-semibold text-sm tracking-wider uppercase mb-4">
                  Platform
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-text-muted hover:text-text-primary transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#join" className="text-text-muted hover:text-text-primary transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm">
                      Join Waitlist
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-text-primary font-display font-semibold text-sm tracking-wider uppercase mb-4">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <span className="text-text-muted/50 text-sm cursor-default" title="Coming soon">About</span>
                  </li>
                  <li>
                    <span className="text-text-muted/50 text-sm cursor-default" title="Coming soon">Press</span>
                  </li>
                  <li>
                    <span className="text-text-muted/50 text-sm cursor-default" title="Coming soon">Careers</span>
                  </li>
                  <li>
                    <span className="text-text-muted/50 text-sm cursor-default" title="Coming soon">Legal</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Social links — with adequate touch targets */}
            <div>
              <h3 className="text-text-primary font-display font-semibold text-sm tracking-wider uppercase mb-4">
                Community
              </h3>
              <div className="flex items-center gap-2">
                {/* Twitter/X */}
                <a
                  href="https://twitter.com/ultrastream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm"
                  aria-label="Follow ULTRASTREAM on X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Discord */}
                <a
                  href="https://discord.gg/ultrastream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm"
                  aria-label="Join ULTRASTREAM Discord"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com/@ultrastream"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:rounded-sm"
                  aria-label="Subscribe to ULTRASTREAM on YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Bottom: Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs text-center sm:text-left">
              &copy; {new Date().getFullYear()} ULTRASTREAM by ULTRAVERSE.games. All rights reserved.
            </p>
            <p className="text-text-muted/50 text-xs">
              For the people. By the people. Against the machine.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
