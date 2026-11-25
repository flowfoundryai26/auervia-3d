import { useEffect, useState } from 'react';
import { ShoppingBag, Menu, X, ArrowRight } from 'lucide-react';

const LINKS = [
  { label: 'Home', href: '#home' }, { label: 'Collection', href: '#collection' },
  { label: 'Our Story', href: '#story' }, { label: 'Craftsmanship', href: '#craft' }, { label: 'Contact', href: '#contact' },
];

export function Header({ bagCount, onBag }: { bagCount: number; onBag: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0908]/88 backdrop-blur-xl border-b border-white/8' : 'bg-gradient-to-b from-black/60 to-transparent'}`}>
      <div className="bg-[#c6a15b] text-[#0a0908] text-center text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase py-1.5 px-3">
        Fictional concept boutique — portfolio experience · No real orders are processed
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-3 shrink-0" aria-label="AUREVIA home">
          <span className="w-9 h-9 border border-[#c6a15b]/70 rotate-45 grid place-items-center"><span className="-rotate-45 font-serif text-[#c6a15b] text-lg leading-none">A</span></span>
          <span className="leading-none">
            <span className="block font-serif text-[22px] tracking-[0.32em] text-[#f5efe6]">AUREVIA</span>
            <span className="block text-[8px] tracking-[0.42em] text-[#c6a15b] mt-1">PARIS · MAISON DE PARFUM</span>
          </span>
        </a>
        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
          {LINKS.map(l => <a key={l.href} href={l.href} className="text-[12px] tracking-[0.18em] uppercase text-[#f5efe6]/75 hover:text-[#e8c87a] transition-colors">{l.label}</a>)}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onBag} aria-label={`Open shopping bag, ${bagCount} items`} className="relative w-10 h-10 grid place-items-center rounded-full border border-white/15 text-[#f5efe6] hover:border-[#c6a15b] hover:text-[#e8c87a] transition">
            <ShoppingBag size={18} />
            {bagCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c6a15b] text-[#0a0908] text-[11px] font-bold grid place-items-center">{bagCount}</span>}
          </button>
          <a href="#collection" className="hidden md:inline-flex items-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] text-[11px] font-bold tracking-[0.16em] uppercase px-5 py-3 transition">Discover Collection <ArrowRight size={14} /></a>
          <button className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-white/15 text-[#f5efe6]" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden bg-[#0d0b09]/97 backdrop-blur-xl border-t border-white/8 px-6 py-6 space-y-1" aria-label="Mobile">
          {LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-2xl text-[#f5efe6] border-b border-white/6 hover:text-[#e8c87a]">{l.label}</a>)}
          <a href="#collection" onClick={() => setOpen(false)} className="mt-5 inline-flex items-center gap-2 bg-[#c6a15b] text-[#0a0908] text-[11px] font-bold tracking-[0.16em] uppercase px-5 py-3.5">Discover Collection <ArrowRight size={14} /></a>
          <p className="text-[11px] text-white/40 pt-4">A fictional portfolio concept by FlowFoundry AI Solutions.</p>
        </nav>
      )}
    </header>
  );
}
