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
            <SocialIcon label="Twitter / X" d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            <SocialIcon label="Discord" d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" />
            <SocialIcon label="YouTube" d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
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

function SocialIcon({ label, d }: { label: string; d: string }) {
  return (
    <a
      href="#"
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
