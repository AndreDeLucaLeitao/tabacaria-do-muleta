export function Footer() {
  return (
    <footer className="border-t border-gold-600/15 bg-ink-900/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-cream-300/70">
        <div className="divider-gold mb-6" />
        <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="font-display text-lg text-cream-200">Tabacaria do Muleta</p>
          <p>Venda exclusiva para maiores de 18 anos. Beba e fume com moderação.</p>
        </div>
      </div>
    </footer>
  );
}
