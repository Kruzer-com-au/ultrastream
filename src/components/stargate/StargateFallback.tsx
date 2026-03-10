"use client";

/**
 * CSS-only fallback for the Stargate portal on low-GPU devices.
 * Multiple layered radial gradients, animated CSS rings with rotating
 * borders, and particle-like dot animations. Still delivers an
 * impressive portal aesthetic without WebGL.
 */
export function StargateFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 45%, rgba(5, 5, 5, 1) 0%, rgba(10, 10, 10, 1) 100%)
        `,
      }}
    >
      {/* Outer ring -- large rotating border */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[min(80vw,500px)] h-[min(80vw,500px)] rounded-full"
          style={{
            border: "2px solid rgba(136, 136, 153, 0.3)",
            animation: "ringRotate 20s linear infinite",
            boxShadow: `
              0 0 30px rgba(0, 212, 255, 0.1),
              inset 0 0 30px rgba(139, 92, 246, 0.05)
            `,
          }}
        />
      </div>

      {/* Inner ring -- counter-rotating */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[min(72vw,450px)] h-[min(72vw,450px)] rounded-full"
          style={{
            border: "1.5px solid rgba(136, 136, 153, 0.2)",
            animation: "ringRotateReverse 15s linear infinite",
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.08)",
          }}
        />
      </div>

      {/* Event horizon gradient -- shimmering portal center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[min(68vw,430px)] h-[min(68vw,430px)] rounded-full"
          style={{
            background: `
              radial-gradient(circle,
                rgba(0, 212, 255, 0.15) 0%,
                rgba(139, 92, 246, 0.1) 30%,
                rgba(255, 215, 0, 0.05) 50%,
                transparent 70%
              )
            `,
            animation: "portalPulse 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Concentric ripple rings */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="rounded-full"
            style={{
              width: `${min80(20 + i * 12)}%`,
              height: `${min80(20 + i * 12)}%`,
              maxWidth: `${130 + i * 75}px`,
              maxHeight: `${130 + i * 75}px`,
              border: `1px solid rgba(0, 212, 255, ${0.15 - i * 0.025})`,
              animation: `rippleExpand 3s ease-out ${i * 0.6}s infinite`,
              opacity: 0,
            }}
          />
        </div>
      ))}

      {/* Chevron indicators -- 9 glowing dots around the ring */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
        const radius = 38; // % from center
        const left = 50 + Math.cos(angle) * radius;
        const top = 50 + Math.sin(angle) * radius;
        return (
          <div
            key={`chevron-${i}`}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, rgba(0, 212, 255, 0) 70%)`,
              animation: `chevronPulse 2s ease-in-out ${i * 0.22}s infinite`,
              boxShadow: "0 0 8px rgba(0, 212, 255, 0.5)",
            }}
          />
        );
      })}

      {/* Floating particle dots */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 20;
        const left = 50 + Math.cos(angle) * radius;
        const top = 50 + Math.sin(angle) * radius;
        const size = 1 + Math.random() * 3;
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 5;
        const isBlue = Math.random() > 0.4;
        return (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: isBlue
                ? "rgba(0, 212, 255, 0.6)"
                : "rgba(139, 92, 246, 0.5)",
              animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
              boxShadow: isBlue
                ? "0 0 4px rgba(0, 212, 255, 0.4)"
                : "0 0 4px rgba(139, 92, 246, 0.3)",
            }}
          />
        );
      })}

      {/* Spiral overlay -- rotating gradient for depth */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-[min(60vw,380px)] h-[min(60vw,380px)] rounded-full opacity-30"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              rgba(0, 212, 255, 0.1) 60deg,
              transparent 120deg,
              rgba(139, 92, 246, 0.08) 180deg,
              transparent 240deg,
              rgba(255, 215, 0, 0.05) 300deg,
              transparent 360deg
            )`,
            animation: "spiralRotate 8s linear infinite",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Noise texture overlay for grain */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />

      <style jsx>{`
        @keyframes ringRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ringRotateReverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes portalPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes rippleExpand {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes chevronPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
        }
        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0px, 0px);
            opacity: 0.3;
          }
          25% {
            transform: translate(10px, -8px);
            opacity: 0.8;
          }
          50% {
            transform: translate(-5px, -15px);
            opacity: 0.5;
          }
          75% {
            transform: translate(-12px, -5px);
            opacity: 0.7;
          }
        }
        @keyframes spiralRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/** Clamp percentage to a max of 80% of viewport to prevent overflow */
function min80(pct: number): number {
  return Math.min(pct, 80);
}
