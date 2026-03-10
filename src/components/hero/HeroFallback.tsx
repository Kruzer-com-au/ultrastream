"use client";

/**
 * CSS-only fallback for mobile/low-GPU devices.
 * Multi-layer gradient background with floating SVG geometry.
 * Still feels premium -- not a compromise, an alternative expression.
 */
export function HeroFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(0, 60, 120, 0.35) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 80%, rgba(80, 20, 120, 0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 60%, rgba(120, 20, 40, 0.15) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 50%, rgba(10, 10, 25, 1) 0%, rgba(3, 3, 5, 1) 100%)
        `,
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />

      {/* Floating SVG geometric shapes */}
      <FloatingShape
        className="absolute top-[15%] right-[20%] w-24 h-24 md:w-32 md:h-32"
        animationDuration="20s"
        animationDelay="0s"
        color="rgba(0, 212, 255, 0.15)"
      >
        <IcosahedronWireframe />
      </FloatingShape>

      <FloatingShape
        className="absolute bottom-[25%] left-[15%] w-16 h-16 md:w-24 md:h-24"
        animationDuration="25s"
        animationDelay="3s"
        color="rgba(139, 92, 246, 0.12)"
      >
        <OctahedronWireframe />
      </FloatingShape>

      <FloatingShape
        className="absolute top-[40%] left-[10%] w-20 h-20 md:w-28 md:h-28"
        animationDuration="22s"
        animationDelay="1.5s"
        color="rgba(212, 168, 67, 0.1)"
      >
        <DiamondWireframe />
      </FloatingShape>

      <FloatingShape
        className="absolute bottom-[15%] right-[12%] w-14 h-14 md:w-20 md:h-20"
        animationDuration="18s"
        animationDelay="5s"
        color="rgba(255, 51, 102, 0.1)"
      >
        <TriangleWireframe />
      </FloatingShape>

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
          animation: "scanline 8s linear infinite",
        }}
      />

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}

interface FloatingShapeProps {
  className: string;
  animationDuration: string;
  animationDelay: string;
  color: string;
  children: React.ReactNode;
}

function FloatingShape({
  className,
  animationDuration,
  animationDelay,
  color,
  children,
}: FloatingShapeProps) {
  return (
    <div
      className={className}
      style={{
        color,
        animation: `floatRotate ${animationDuration} ease-in-out ${animationDelay} infinite`,
        willChange: "transform",
      }}
    >
      {children}
      <style jsx>{`
        @keyframes floatRotate {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(90deg);
          }
          50% {
            transform: translateY(-8px) rotate(180deg);
          }
          75% {
            transform: translateY(-20px) rotate(270deg);
          }
        }
      `}</style>
    </div>
  );
}

function IcosahedronWireframe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <polygon points="50,5 90,30 80,75 20,75 10,30" />
      <line x1="50" y1="5" x2="50" y2="95" />
      <line x1="10" y1="30" x2="80" y2="75" />
      <line x1="90" y1="30" x2="20" y2="75" />
      <polygon points="50,95 80,75 90,30" />
      <polygon points="50,95 20,75 10,30" />
    </svg>
  );
}

function OctahedronWireframe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <polygon points="50,5 95,50 50,95 5,50" />
      <line x1="50" y1="5" x2="50" y2="95" />
      <line x1="5" y1="50" x2="95" y2="50" />
      <line x1="50" y1="5" x2="5" y2="50" />
      <line x1="50" y1="5" x2="95" y2="50" />
    </svg>
  );
}

function DiamondWireframe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <polygon points="50,2 98,35 80,98 20,98 2,35" />
      <line x1="50" y1="2" x2="20" y2="98" />
      <line x1="50" y1="2" x2="80" y2="98" />
      <line x1="2" y1="35" x2="98" y2="35" />
      <line x1="2" y1="35" x2="80" y2="98" />
      <line x1="98" y1="35" x2="20" y2="98" />
    </svg>
  );
}

function TriangleWireframe() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
      <polygon points="50,5 95,90 5,90" />
      <line x1="50" y1="5" x2="50" y2="90" />
      <line x1="27" y1="47" x2="95" y2="90" />
      <line x1="73" y1="47" x2="5" y2="90" />
    </svg>
  );
}
