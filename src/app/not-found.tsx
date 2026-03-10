import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center text-center px-4">
      <h1
        className="text-[10rem] md:text-[14rem] font-display font-bold leading-none text-gradient-neon"
        style={{
          textShadow:
            "0 0 60px rgba(0, 212, 255, 0.3), 0 0 120px rgba(123, 47, 247, 0.2)",
        }}
      >
        404
      </h1>
      <p className="text-display-sm text-text-secondary mt-4">
        This page has been lost to the void.
      </p>
      <Link
        href="/"
        className="mt-8 px-8 py-3 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
      >
        Return to Base
      </Link>
    </div>
  );
}
