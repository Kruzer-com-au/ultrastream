'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative w-full border-t"
      style={{
        background: '#050505',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Top section: Logo + tagline */}
        <div className="flex flex-col items-center text-center mb-12">
          <h3
            className="text-3xl md:text-4xl font-display font-bold tracking-[0.15em] uppercase mb-4"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #7b2ff7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ULTRASTREAM
          </h3>
          <p
            className="text-sm font-body tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255, 215, 0, 0.7)' }}
          >
            Built for Creators. Owned by the Community.
          </p>
        </div>

        {/* Middle section: Links */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <FooterLink href="#portal-journey">Home</FooterLink>
          <FooterLink href="#battle">Battle</FooterLink>
          <FooterLink href="#features">Features</FooterLink>
          <FooterLink href="#ultraverse">Ultraverse</FooterLink>
          <FooterLink href="#cta">Join</FooterLink>
        </div>

        {/* Divider */}
        <div
          className="w-24 h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent)' }}
        />

        {/* Bottom section: Copyright + social + TDS credit */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p
            className="text-xs font-body"
            style={{ color: 'rgba(160, 160, 176, 0.5)' }}
          >
            &copy; {currentYear} ULTRASTREAM. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <SocialIcon label="X" href="https://www.x.com/Ultrastream_US" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.642l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            <SocialIcon label="Facebook" href="https://www.facebook.com/profile.php?id=61575437310610" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            <SocialIcon label="TikTok" href="https://www.tiktok.com/@ultrastream.kruzer" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.25 8.25 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z" />
            <SocialIcon label="Instagram" href="https://www.instagram.com/ultrastream.kruzer" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
          </div>
        </div>

        {/* TDS Australia credit */}
        <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
          <p
            className="text-xs font-body"
            style={{ color: 'rgba(160, 160, 176, 0.4)' }}
          >
            Made by Tokyo Design Studio Australia
          </p>
          <a
            href="https://tdsaustralia.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-body mt-1 inline-block transition-colors duration-300 text-[rgba(0,212,255,0.5)] hover:text-[#00d4ff] active:text-[#00d4ff]"
          >
            Top Branding Design Agency in Australia
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs font-body tracking-[0.15em] uppercase transition-colors duration-300 py-3 min-h-[44px] inline-flex items-center text-[rgba(160,160,176,0.5)] hover:text-[#00d4ff] active:text-[#00d4ff]"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ label, href, d }: { label: string; href: string; d: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-105 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.05)] active:border-[rgba(0,212,255,0.3)] active:bg-[rgba(0,212,255,0.05)]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="rgba(160, 160, 176, 0.6)"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={d} />
      </svg>
    </a>
  );
}
