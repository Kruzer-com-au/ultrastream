export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-neon-purple/20 bg-abyss/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="font-display font-bold text-xl tracking-wider">
            <span className="text-gradient-gold">ULTRA</span>
            <span className="text-text-primary">STREAM</span>
            <span className="ml-3 text-xs text-neon-purple font-body tracking-widest uppercase">
              Portal
            </span>
          </div>
          <span className="text-text-muted text-sm">Coming Soon</span>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
