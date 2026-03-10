export default function Loading() {
  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold text-gradient-gold animate-pulse">
          ULTRASTREAM
        </h2>
        <div className="mt-4 w-24 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
          <div className="h-full w-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full animate-[loadBar_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
