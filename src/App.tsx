import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, ArrowDown, ShoppingBag, Eye, RotateCw, ZoomIn, ZoomOut, Play, Pause,
  Sparkles, Leaf, FlaskConical, Gem, Droplets, Hand, Clock3, MapPin, Mail, Phone,
  Instagram, Facebook, Twitter, Youtube, Send, CheckCircle2, AlertCircle, MousePointer2,
  BadgeCheck, Gift, RefreshCcw, ChevronRight, Layers, Sun, Moon, Star,
} from 'lucide-react';
import { Header } from './components/Header';
import { ProductModal, CartDrawer, LegalModal, MiniBottle } from './components/Modals';
import { FRAGRANCES, fmt, priceFor, type CartItem, type Fragrance } from './lib/data';

function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}

gsap.registerPlugin(ScrollTrigger);
const BottleCanvas = lazy(() => import('./components/Bottle3D').then(m => ({ default: m.BottleCanvas })));

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function SectionHead({ eyebrow, title, copy, light = false }: { eyebrow: string; title: React.ReactNode; copy?: string; light?: boolean }) {
  return (
    <div data-reveal className="max-w-3xl mx-auto text-center px-5">
      <p className="text-[11px] tracking-[0.34em] uppercase text-[#c6a15b] flex items-center justify-center gap-3"><span className="gold-line w-10" />{eyebrow}<span className="gold-line w-10" /></p>
      <h2 className={`font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.02] mt-4 ${light ? 'text-[#15110c]' : 'text-[#f5efe6]'}`}>{title}</h2>
      {copy && <p className={`text-[15px] leading-relaxed mt-5 ${light ? 'text-[#15110c]/65' : 'text-white/55'}`}>{copy}</p>}
    </div>
  );
}

function HeroFallback({ f }: { f: Fragrance }) {
  return (
    <div className="relative w-full h-full grid place-items-center">
      <img src="/images/hero-fallback.jpg" alt={`AUREVIA ${f.name} perfume flacon — static photograph fallback`} className="absolute inset-0 w-full h-full object-cover opacity-40 rounded-none" />
      <div className="relative group animate-floaty w-64"><MiniBottle f={f} /></div>
      <p className="absolute bottom-4 text-[10px] tracking-[0.2em] uppercase text-white/50 bg-black/50 px-3 py-1.5 border border-white/15">Static view — optimised for your device</p>
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState('aurelia-dor');
  const selected = useMemo(() => FRAGRANCES.find(f => f.id === selectedId)!, [selectedId]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [modal, setModal] = useState<Fragrance | null>(null);
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);
  const [toast, setToast] = useState('');
  const [use3D, setUse3D] = useState(() => typeof window !== 'undefined' && webglAvailable() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [capOpen, setCapOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [expSize, setExpSize] = useState<50 | 100>(100);
  const [familyFilter, setFamilyFilter] = useState('All');
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  // Newsletter
  const [nlEmail, setNlEmail] = useState(''); const [nlErr, setNlErr] = useState(''); const [nlDone, setNlDone] = useState(false);
  // Contact
  const [cForm, setCForm] = useState({ name: '', email: '', topic: 'Fragrance consultation', message: '' });
  const [cErr, setCErr] = useState<Record<string, string>>({}); const [cDone, setCDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => {
        gsap.fromTo(el, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-note]').forEach((el, i) => {
        gsap.fromTo(el, { y: 60, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, delay: i * 0.12, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      });
    }, rootRef);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const t = setTimeout(onLoad, 1200);
    return () => { window.removeEventListener('load', onLoad); clearTimeout(t); ctx.revert(); };
  }, []);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 3200); return () => clearTimeout(t); }, [toast]);

  const addToBag = (id: string, size: 50 | 100, qty = 1) => {
    const key = `${id}-${size}`;
    setCart(prev => { const ex = prev.find(i => i.key === key); return ex ? prev.map(i => i.key === key ? { ...i, qty: Math.min(9, i.qty + qty) } : i) : [...prev, { key, fragranceId: id, size, qty }]; });
    const f = FRAGRANCES.find(x => x.id === id)!;
    setToast(`${f.name} ${size} ml added to your bag`);
  };
  const bagCount = cart.reduce((s, i) => s + i.qty, 0);
  const families = ['All', ...Array.from(new Set(FRAGRANCES.map(f => f.family)))];
  const visible = familyFilter === 'All' ? FRAGRANCES : FRAGRANCES.filter(f => f.family === familyFilter);
  const showcase = FRAGRANCES[showcaseIdx];

  const submitNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk(nlEmail)) { setNlErr('Please enter a valid email address, e.g. you@example.com'); return; }
    setNlErr(''); setNlDone(true);
  };
  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (cForm.name.trim().length < 2) errs.name = 'Please enter your full name.';
    if (!emailOk(cForm.email)) errs.email = 'Please enter a valid email address.';
    if (cForm.message.trim().length < 12) errs.message = 'Please write a little more (at least 12 characters) so we can help.';
    setCErr(errs);
    if (Object.keys(errs).length === 0) setCDone(true);
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/15 px-4 py-3.5 text-sm text-[#f5efe6] placeholder:text-white/30 focus:border-[#c6a15b] focus:bg-white/[0.06] outline-none transition";
  const errCls = "flex items-center gap-1.5 text-[12px] text-red-300 mt-1.5";

  return (
    <div ref={rootRef} className="min-h-screen bg-[#0a0908] text-[#f5efe6] overflow-x-clip">
      <Header bagCount={bagCount} onBag={() => setBagOpen(true)} />

      {/* ---------- HERO ---------- */}
      <section id="home" className="relative min-h-screen grain overflow-hidden pt-32 lg:pt-36" aria-label="AUREVIA hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,#33260f_0%,#171208_38%,#0a0908_72%)]" />
        <div className="absolute -top-24 right-[8%] w-[520px] h-[520px] rounded-full bg-[#c6a15b]/14 blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[#7a2438]/12 blur-[120px]" />
        <div className="absolute inset-x-0 top-1/2 font-serif text-[19vw] leading-none text-white/[0.025] tracking-[0.08em] text-center select-none pointer-events-none" aria-hidden="true">AUREVIA</div>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-10 items-center pb-16">
          <div className="lg:col-span-6 pt-6">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-flex items-center gap-2 border border-[#c6a15b]/45 bg-[#c6a15b]/8 text-[#e8c87a] text-[10px] font-bold tracking-[0.24em] uppercase px-4 py-2"><Sparkles size={13} /> Maison de Parfum · Fictional Concept</span>
              <h1 className="font-serif text-[54px] sm:text-7xl xl:text-[92px] leading-[0.94] mt-7">
                The Art of<br />Being<br /><span className="text-gold-grad italic">Remembered.</span>
              </h1>
              <p className="text-[15px] sm:text-base leading-relaxed text-white/60 max-w-xl mt-6">
                Four signature creations composed like jewellery for the skin — rare-feeling accords, a hand-finished glass flacon, and a trail that lingers long after you have left the room. Explore the flacon in 3D, turn it in the light, and find the scent they will remember you by.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href="#collection" className="inline-flex items-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[12px] tracking-[0.16em] uppercase px-7 py-4 transition shadow-[0_16px_40px_rgba(198,161,91,.25)]">Discover Collection <ArrowRight size={15} /></a>
                <a href="#experience" className="inline-flex items-center gap-2 border border-white/25 hover:border-[#c6a15b] hover:text-[#e8c87a] text-[12px] font-bold tracking-[0.16em] uppercase px-7 py-4 transition"><RotateCw size={15} /> 360° Experience</a>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-[11px] tracking-[0.14em] uppercase text-white/45">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#c6a15b]" /> Hand-finished flacon</span>
                <span className="inline-flex items-center gap-1.5"><Gift size={14} className="text-[#c6a15b]" /> Signature gift coffret</span>
                <span className="inline-flex items-center gap-1.5"><Leaf size={14} className="text-[#c6a15b]" /> Responsibly-sourced concept</span>
              </div>
              <div className="mt-10 max-w-md">
                <p className="text-[10px] tracking-[0.26em] uppercase text-white/40 mb-3">Now presenting — {selected.family}</p>
                <div className="flex gap-2" role="group" aria-label="Choose hero fragrance">
                  {FRAGRANCES.map(f => (
                    <button key={f.id} onClick={() => setSelectedId(f.id)} aria-pressed={selectedId === f.id} title={f.name}
                      className={`flex-1 border px-2 py-2.5 text-center transition ${selectedId === f.id ? 'border-[#c6a15b] bg-[#c6a15b]/10' : 'border-white/12 hover:border-white/35'}`}>
                      <span className="block w-5 h-5 rounded-full mx-auto border border-white/30" style={{ background: `linear-gradient(135deg, ${f.liquid}, ${f.liquidDeep})` }} />
                      <span className="block text-[9px] tracking-[0.08em] uppercase mt-1.5 text-white/70 leading-tight">{f.name}</span>
                    </button>
                  ))}
                </div>
                <p className="font-serif italic text-lg text-[#e8c87a] mt-4" aria-live="polite">{selected.name} — {selected.tagline}</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.15 }}
              className="relative h-[480px] sm:h-[560px] xl:h-[640px] border border-[#c6a15b]/20 bg-[radial-gradient(circle_at_50%_38%,rgba(198,161,91,.16),rgba(255,255,255,.02)_55%,transparent)]">
              <div className="absolute inset-4 border border-white/6 pointer-events-none z-10" />
              {use3D ? (
                <Suspense fallback={<div className="h-full grid place-items-center text-white/40 text-sm tracking-widest uppercase">Preparing the flacon…</div>}>
                  <BottleCanvas fragrance={selected} mode="hero" />
                </Suspense>
              ) : <HeroFallback f={selected} />}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                <button onClick={() => setUse3D(v => !v)} className="bg-black/60 backdrop-blur border border-white/20 hover:border-[#c6a15b] text-[10px] font-bold tracking-[0.18em] uppercase px-3.5 py-2 transition" aria-pressed={use3D}>{use3D ? 'View: Interactive 3D' : 'View: Static'}</button>
              </div>
              <div className="absolute bottom-5 right-5 z-10 hidden sm:flex items-center gap-2 bg-black/55 backdrop-blur border border-white/15 px-3.5 py-2 text-[10px] tracking-[0.16em] uppercase text-white/60"><MousePointer2 size={13} className="text-[#c6a15b]" /> Move to turn · Scroll to rotate</div>
              <div className="absolute bottom-5 left-5 z-10 bg-black/55 backdrop-blur border border-[#c6a15b]/30 px-4 py-3">
                <div className="text-[9px] tracking-[0.24em] uppercase text-[#c6a15b]">Eau de Parfum · 100 ml</div>
                <div className="flex items-center gap-3 mt-1"><span className="font-serif text-2xl">{fmt(selected.price100)}</span>
                  <button onClick={() => addToBag(selected.id, 100)} className="inline-flex items-center gap-1.5 bg-[#c6a15b] text-[#0a0908] text-[10px] font-bold tracking-[0.14em] uppercase px-3.5 py-2 hover:bg-[#e8c87a] transition"><ShoppingBag size={13} /> Add</button></div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="relative flex justify-center pb-8">
          <a href="#collection" className="flex flex-col items-center gap-2 text-white/40 hover:text-[#e8c87a] transition" aria-label="Scroll to collection">
            <span className="w-6 h-10 rounded-full border border-current grid justify-center pt-2"><span className="scroll-cue-dot w-1.5 h-1.5 rounded-full bg-current" /></span>
            <span className="text-[9px] tracking-[0.3em] uppercase">Scroll</span><ArrowDown size={13} />
          </a>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-[#c6a15b]/20 bg-[#0d0b09] py-4 overflow-hidden" aria-hidden="true">
        <div className="flex gap-10 whitespace-nowrap font-serif italic text-lg text-white/45 w-max" style={{ animation: 'marquee 36s linear infinite' }}>
          {Array.from({ length: 2 }).map((_, k) => <span key={k} className="flex gap-10">{FRAGRANCES.concat(FRAGRANCES).map((f, i) => <span key={i} className="flex items-center gap-10">{f.name} <Star size={11} className="text-[#c6a15b]" /></span>)}</span>)}
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}} @media (prefers-reduced-motion: reduce){div[style*=\"marquee\"]{animation:none!important}}`}</style>
      </div>

      {/* ---------- COLLECTION ---------- */}
      <section id="collection" className="py-24 lg:py-32 scroll-mt-24" aria-label="Signature collection">
        <SectionHead eyebrow="Signature Collection" title={<>Four creations.<br /><span className="italic text-gold-grad">One signature — yours.</span></>} copy="Each fragrance is composed as a complete story in three acts. Hover to lift the flacon, open the details to read its notes, or add it directly to your bag." />
        <div className="flex flex-wrap justify-center gap-2 mt-10 px-5" data-reveal role="group" aria-label="Filter by fragrance family">
          {families.map(fm => <button key={fm} onClick={() => setFamilyFilter(fm)} aria-pressed={familyFilter === fm} className={`text-[11px] font-bold tracking-[0.16em] uppercase px-4.5 py-2.5 px-4 border transition ${familyFilter === fm ? 'bg-[#c6a15b] text-[#0a0908] border-[#c6a15b]' : 'border-white/15 text-white/55 hover:border-[#c6a15b] hover:text-[#e8c87a]'}`}>{fm}</button>)}
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
          {visible.map((f, i) => (
            <motion.article key={f.id} data-reveal layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="group relative border border-white/10 bg-gradient-to-b from-white/[0.045] to-white/[0.015] hover:border-[#c6a15b]/55 transition-colors duration-500 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c6a15b]/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <button onClick={() => setModal(f)} className="block w-full text-left" aria-label={`View ${f.name} details`}>
                <div className="relative pt-4"><MiniBottle f={f} />
                  <span className="absolute top-4 left-4 text-[9px] font-bold tracking-[0.2em] uppercase border border-white/15 bg-black/40 px-2.5 py-1.5 text-white/65">{f.family}</span>
                  <span className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full border border-white/15 bg-black/40 opacity-0 group-hover:opacity-100 transition text-[#e8c87a]"><Eye size={16} /></span>
                </div>
                <div className="px-6 pb-2 text-center">
                  <h3 className="font-serif text-[28px] leading-none group-hover:text-[#e8c87a] transition-colors">{f.name}</h3>
                  <p className="font-serif italic text-white/45 mt-1.5">{f.tagline}</p>
                  <p className="text-[11px] tracking-wide text-white/40 mt-3">{f.notes.top[0]} · {f.notes.heart[0]} · {f.notes.base[0]}</p>
                </div>
              </button>
              <div className="px-6 pb-6 pt-3">
                <div className="flex items-center justify-between border-t border-white/8 pt-4">
                  <span className="text-[11px] text-white/40">From <strong className="font-serif text-xl text-[#f5efe6] font-medium">{fmt(f.price50)}</strong></span>
                  <span className="text-[10px] uppercase tracking-widest text-white/35">50 / 100 ml</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setSelectedId(f.id); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex-1 border border-white/18 hover:border-[#c6a15b] hover:text-[#e8c87a] text-[10px] font-bold tracking-[0.14em] uppercase py-3 transition">View in 3D</button>
                  <button onClick={() => addToBag(f.id, 100)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] text-[10px] font-bold tracking-[0.14em] uppercase py-3 transition"><ShoppingBag size={13} /> Add to Bag</button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="text-center text-[11px] text-white/35 mt-8 px-5">Concept pricing for demonstration only — AUREVIA is a fictional house and no orders are fulfilled.</p>
      </section>

      {/* ---------- INTERACTIVE EXPERIENCE ---------- */}
      <section id="experience" className="relative py-24 lg:py-32 bg-[#0d0b09] border-y border-white/6 grain scroll-mt-24" aria-label="Interactive 3D product experience">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(198,161,91,.10),transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHead eyebrow="Interactive Product Experience" title={<>Turn the flacon<br /><span className="italic text-gold-grad">in the light</span></>} copy="Drag to rotate a full 360°, scroll or use the controls to zoom, lift the cap, and change the fragrance to watch the liquid and label transform." />
          <div className="grid lg:grid-cols-12 gap-6 mt-14 items-stretch">
            <div data-reveal className="lg:col-span-7 relative border border-[#c6a15b]/22 bg-[radial-gradient(circle_at_50%_35%,rgba(198,161,91,.14),#0a0908_68%)] h-[520px] sm:h-[600px] overflow-hidden">
              {use3D ? (
                <Suspense fallback={<div className="h-full grid place-items-center text-white/40 text-sm tracking-widest uppercase">Preparing the flacon…</div>}>
                  <BottleCanvas fragrance={selected} mode="interactive" capOpen={capOpen} autoRotate={autoRotate} zoom={zoom} />
                </Suspense>
              ) : <HeroFallback f={selected} />}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <button onClick={() => setAutoRotate(v => !v)} aria-pressed={autoRotate} className="inline-flex items-center gap-1.5 bg-black/60 backdrop-blur border border-white/20 hover:border-[#c6a15b] text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-2">{autoRotate ? <Pause size={12} /> : <Play size={12} />} {autoRotate ? 'Pause rotation' : 'Auto-rotate'}</button>
                <button onClick={() => setCapOpen(v => !v)} aria-pressed={capOpen} className="bg-black/60 backdrop-blur border border-white/20 hover:border-[#c6a15b] text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-2">{capOpen ? 'Replace Cap' : 'Lift the Cap'}</button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 flex items-center gap-2 bg-black/60 backdrop-blur border border-white/15 px-3 py-2.5">
                <button onClick={() => setZoom(z => Math.max(0, +(z - 0.5).toFixed(1)))} aria-label="Zoom out" className="w-8 h-8 grid place-items-center border border-white/15 hover:border-[#c6a15b]"><ZoomOut size={15} /></button>
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/55">Zoom
                  <input type="range" min={0} max={2.6} step={0.1} value={zoom} onChange={e => setZoom(+e.target.value)} className="accent-[#c6a15b] w-28 sm:w-36" aria-label="Zoom level" /></label>
                <button onClick={() => setZoom(z => Math.min(2.6, +(z + 0.5).toFixed(1)))} aria-label="Zoom in" className="w-8 h-8 grid place-items-center border border-white/15 hover:border-[#c6a15b]"><ZoomIn size={15} /></button>
                <button onClick={() => { setZoom(1); setCapOpen(false); }} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/55 hover:text-[#e8c87a] px-1"><RefreshCcw size={13} /> Reset</button>
              </div>
              <p className="absolute bottom-4 right-4 z-10 hidden md:block text-[10px] tracking-[0.16em] uppercase text-white/40 bg-black/50 px-3 py-2 border border-white/10">Drag · Pinch · Scroll</p>
            </div>

            <div data-reveal className="lg:col-span-5 border border-white/10 bg-white/[0.025] p-7 sm:p-9 flex flex-col">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#c6a15b]">Configure your flacon</p>
              <h3 className="font-serif text-4xl mt-3" aria-live="polite">{selected.name}</h3>
              <p className="font-serif italic text-white/50">{selected.tagline} · {selected.family}</p>
              <p className="text-sm leading-relaxed text-white/60 mt-4">{selected.description}</p>

              <fieldset className="mt-7"><legend className="text-[10px] font-bold tracking-[0.24em] uppercase text-white/45">Fragrance</legend>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {FRAGRANCES.map(f => (
                    <button key={f.id} onClick={() => setSelectedId(f.id)} aria-pressed={selectedId === f.id} className={`flex items-center gap-2.5 border px-3 py-3 text-left transition ${selectedId === f.id ? 'border-[#c6a15b] bg-[#c6a15b]/10' : 'border-white/12 hover:border-white/35'}`}>
                      <span className="w-6 h-6 rounded-full border border-white/30 shrink-0" style={{ background: `linear-gradient(135deg, ${f.liquid}, ${f.liquidDeep})` }} />
                      <span><span className="block text-[12px] font-semibold leading-tight">{f.name}</span><span className="block text-[10px] text-white/40">{f.family}</span></span>
                    </button>
                  ))}
                </div></fieldset>

              <fieldset className="mt-6"><legend className="text-[10px] font-bold tracking-[0.24em] uppercase text-white/45">Size</legend>
                <div className="flex gap-2 mt-3">{([50, 100] as const).map(s => (
                  <button key={s} onClick={() => setExpSize(s)} aria-pressed={expSize === s} className={`flex-1 border py-3 text-sm transition ${expSize === s ? 'border-[#c6a15b] bg-[#c6a15b]/12 text-[#e8c87a]' : 'border-white/15 text-white/55'}`}>{s} ml — {fmt(priceFor(selected, s))}</button>))}
                </div></fieldset>

              <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                {([['Top', selected.notes.top], ['Heart', selected.notes.heart], ['Base', selected.notes.base]] as const).map(([k, v]) => (
                  <div key={k} className="border border-white/10 bg-black/25 p-3"><div className="text-[9px] tracking-[0.22em] uppercase text-[#c6a15b]">{k}</div><div className="text-[11px] text-white/65 mt-1.5 leading-snug">{v.join(' · ')}</div></div>
                ))}
              </div>

              <button onClick={() => addToBag(selected.id, expSize)} className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[12px] tracking-[0.16em] uppercase py-4 transition"><ShoppingBag size={16} /> Add to Bag — {fmt(priceFor(selected, expSize))}</button>
              <button onClick={() => setModal(selected)} className="mt-2.5 w-full border border-white/18 hover:border-[#c6a15b] hover:text-[#e8c87a] text-[11px] font-bold tracking-[0.16em] uppercase py-3.5 transition">Full Product Details</button>
              <p className="text-[11px] text-white/35 mt-4 leading-relaxed">Glass, liquid and cap are rendered live in 3D. Prefer a lighter page? Use the Static view toggle in the hero — ideal for low-performance devices and reduced-motion settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FRAGRANCE NOTES ---------- */}
      <section id="notes" className="relative py-24 lg:py-32 overflow-hidden scroll-mt-24" aria-label="Fragrance notes">
        <img src="/images/notes.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-14" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#0a0908]/80 to-[#0a0908]" />
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <SectionHead eyebrow={`Fragrance Notes — ${selected.name}`} title={<>A story told<br /><span className="italic text-gold-grad">in three acts</span></>} copy="Scroll to reveal how the fragrance unfolds on skin — the bright opening, the floral heart, and the warm trace that remains. Select any creation above and the pyramid follows." />
          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {[
              { icon: Sun, act: 'Act I · Top Notes', time: 'The first impression', notes: selected.notes.top, copy: 'The luminous opening — the first fifteen minutes, bright and inviting, designed to turn heads as you arrive.' },
              { icon: Sparkles, act: 'Act II · Heart Notes', time: 'The character', notes: selected.notes.heart, copy: 'The soul of the fragrance blooms here, carrying the composition through its most expressive hours.' },
              { icon: Moon, act: 'Act III · Base Notes', time: 'The memory', notes: selected.notes.base, copy: 'The dry-down that stays on skin, fabric and in the room — the part they remember after you have gone.' },
            ].map((a, i) => (
              <article key={a.act} data-note className={`relative border border-white/10 bg-[#12100d]/85 backdrop-blur p-8 ${i === 1 ? 'md:-translate-y-5 border-[#c6a15b]/40' : ''}`}>
                <span className="absolute top-5 right-6 font-serif text-6xl text-white/6" aria-hidden="true">0{i + 1}</span>
                <span className="w-12 h-12 grid place-items-center rounded-full border border-[#c6a15b]/50 bg-[#c6a15b]/10 text-[#e8c87a]"><a.icon size={20} /></span>
                <h3 className="font-serif text-[26px] mt-5">{a.act}</h3>
                <p className="text-[10px] tracking-[0.24em] uppercase text-[#c6a15b] mt-1">{a.time}</p>
                <ul className="mt-5 space-y-2.5">{a.notes.map(n => <li key={n} className="flex items-center gap-2.5 text-sm text-white/75 border-b border-white/6 pb-2.5"><span className="w-1.5 h-1.5 rotate-45 bg-[#c6a15b] shrink-0" />{n}</li>)}</ul>
                <p className="text-[13px] leading-relaxed text-white/45 mt-4">{a.copy}</p>
              </article>
            ))}
          </div>
          <div data-reveal className="mt-10 border border-[#c6a15b]/25 bg-black/40 backdrop-blur px-7 py-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <p className="text-sm text-white/60 max-w-2xl"><strong className="text-[#e8c87a] font-serif text-lg font-medium">Perfumer&rsquo;s note — </strong>{selected.ingredientsNote} {selected.intensity}. Mood: {selected.mood.toLowerCase()}.</p>
            <button onClick={() => setModal(selected)} className="shrink-0 inline-flex items-center gap-2 border border-[#c6a15b] text-[#e8c87a] text-[11px] font-bold tracking-[0.16em] uppercase px-5 py-3 hover:bg-[#c6a15b] hover:text-[#0a0908] transition">Explore {selected.name} <ChevronRight size={14} /></button>
          </div>
        </div>
      </section>

      {/* ---------- OUR STORY ---------- */}
      <section id="story" className="py-24 lg:py-32 bg-[#f5efe6] text-[#15110c] scroll-mt-24" aria-label="Our story">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div data-reveal className="lg:col-span-5 relative">
            <div className="absolute -top-4 -left-4 w-full h-full border border-[#c6a15b]/60 pointer-events-none" />
            <img src="/images/story.jpg" alt="Editorial portrait evoking the AUREVIA muse" className="relative w-full h-[520px] object-cover" loading="lazy" />
            <figure className="absolute -bottom-7 -right-3 sm:right-6 bg-[#0a0908] text-[#f5efe6] px-6 py-5 max-w-[270px] shadow-2xl">
              <blockquote className="font-serif italic text-[19px] leading-snug">“A fragrance should enter the room a heartbeat after you do — and leave long after.”</blockquote>
              <figcaption className="text-[10px] tracking-[0.22em] uppercase text-[#c6a15b] mt-3">The AUREVIA Philosophy (Concept)</figcaption>
            </figure>
          </div>
          <div className="lg:col-span-7 lg:pl-6 pt-8 lg:pt-0">
            <div data-reveal>
              <p className="text-[11px] tracking-[0.34em] uppercase text-[#9a7434] flex items-center gap-3"><span className="gold-line w-10" /> Our Story</p>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.02] mt-4">Born from a single<br /><span className="italic text-[#9a7434]">unforgettable evening</span></h2>
            </div>
            <div data-reveal className="text-[15px] leading-[1.85] text-[#15110c]/68 space-y-5 mt-7 max-w-2xl">
              <p>AUREVIA began — in this concept narrative — with a question posed in a candle-lit Paris atelier: why do we remember certain people by their scent years later, when faces blur and words fade? The house&rsquo;s answer became its founding principle: compose not for the first moment, but for the last impression.</p>
              <p>Every AUREVIA creation is therefore built backwards, from the dry-down up. The base is written first — amber, woods, musk, suede — the part that lives on a coat collar and in a memory. Only then are the heart and the opening composed around it, like light arranged around a jewel.</p>
              <p>The flacon follows the same philosophy: weighted glass, a hand-polished shoulder, and a cap that closes with the quiet certainty of a jewellery box. An object designed to be kept, refilled and remembered.</p>
            </div>
            <div data-reveal className="grid sm:grid-cols-3 gap-4 mt-9">
              {[['The Idea', 'A house composed around memory, not trends'], ['The Atelier', 'Small-batch maceration & hand finishing (concept)'], ['The Flacon', 'Weighted glass, designed to be kept for years']].map(([t, c]) => (
                <div key={t} className="border-t-2 border-[#c6a15b] pt-4"><h3 className="font-serif text-xl">{t}</h3><p className="text-[13px] text-[#15110c]/60 mt-1 leading-relaxed">{c}</p></div>
              ))}
            </div>
            <p data-reveal className="text-[11px] text-[#15110c]/45 mt-8 border border-[#15110c]/12 bg-white/50 px-4 py-3 inline-block">Editorial note: AUREVIA is a fictional brand created for this portfolio concept. The story above is illustrative copy, not a record of a real company, and no customer reviews, awards or sales figures are claimed.</p>
          </div>
        </div>
      </section>

      {/* ---------- CRAFTSMANSHIP ---------- */}
      <section id="craft" className="py-24 lg:py-32 scroll-mt-24" aria-label="Craftsmanship">
        <SectionHead eyebrow="Craftsmanship" title={<>Composed slowly.<br /><span className="italic text-gold-grad">Finished by hand.</span></>} copy="From ingredient accord to polished glass, each stage of the AUREVIA concept process is designed to be felt — in the weight of the bottle and in the smoothness of the dry-down." />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-5 mt-14">
          <div data-reveal className="relative overflow-hidden border border-white/10 min-h-[420px] group">
            <img src="/images/atelier.jpg" alt="Perfumer at work blending fragrance in an atelier" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[1400ms]" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative mt-auto p-8 pt-56">
              <span className="w-11 h-11 grid place-items-center rounded-full bg-[#c6a15b] text-[#0a0908]"><FlaskConical size={19} /></span>
              <h3 className="font-serif text-3xl mt-4">The Composition</h3>
              <p className="text-sm text-white/65 leading-relaxed mt-2 max-w-md">Accords are balanced in small trials and rested — macerated — so the top, heart and base marry into a single, seamless character rather than three separate scents.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: Leaf, t: 'Considered Ingredients', c: 'Bergamot from Calabria, jasmine sambac, vanilla bourbon and sandalwood form the conceptual palette — chosen for smoothness and a clean, elegant evolution on skin.', img: '/images/ingredients.jpg' },
              { icon: Gem, t: 'The Flacon as Jewellery', c: 'Weighted, hand-polished glass with a thick sculpted base. The metallic cap is finished to close with a soft, precise click — an object of the dressing table, not the bathroom shelf.' },
              { icon: Droplets, t: 'The Liquid', c: 'Each parfum is tinted by its own character — champagne gold, deep amber, ivory, velvet plum — and rendered in 3D on this page exactly as the concept intends it to catch light.' },
              { icon: Hand, t: 'Hand Finishing', c: 'Labels are aligned, shoulders polished and coffrets wrapped by hand in the concept atelier process — the final, human signature on every bottle.', img: '/images/boutique.jpg' },
            ].map(card => (
              <article key={card.t} data-reveal className="relative border border-white/10 bg-white/[0.025] hover:border-[#c6a15b]/45 transition overflow-hidden group">
                {card.img && <img src={card.img} alt="" className="h-32 w-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-1000" loading="lazy" />}
                <div className="p-6">
                  <span className="w-10 h-10 grid place-items-center rounded-full border border-[#c6a15b]/50 bg-[#c6a15b]/10 text-[#e8c87a]"><card.icon size={17} /></span>
                  <h3 className="font-serif text-[22px] mt-3.5 leading-tight">{card.t}</h3>
                  <p className="text-[13px] leading-relaxed text-white/50 mt-2">{card.c}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12">
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10" data-reveal>
            {[['01', 'Accord Design', 'The base is composed first — the memory of the scent.'], ['02', 'Maceration', 'Blends rest until harsh edges soften into silk.'], ['03', 'Flacon & Fill', 'Glass is polished, filled and sealed under the cap.'], ['04', 'The Coffret', 'Wrapped, labelled and finished entirely by hand.']].map(([n, t, c]) => (
              <li key={n} className="bg-[#0d0b09] p-7"><span className="font-serif text-4xl text-gold-grad">{n}</span><h3 className="font-serif text-xl mt-3">{t}</h3><p className="text-[13px] text-white/45 mt-1.5 leading-relaxed">{c}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- SHOWCASE ---------- */}
      <section id="showcase" className="py-24 lg:py-32 bg-[#0d0b09] border-y border-white/6 scroll-mt-24" aria-label="Featured fragrance showcase">
        <SectionHead eyebrow="Product Showcase" title={<>Featured<br /><span className="italic text-gold-grad">in the spotlight</span></>} copy="Step through the house's featured creations one at a time — then open the full product modal for notes, sizes and gifting." />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-14">
          <div data-reveal className="grid lg:grid-cols-12 border border-[#c6a15b]/22 overflow-hidden bg-[#12100d]">
            <div className="lg:col-span-5 relative min-h-[420px]">
              <AnimatePresence mode="wait"><motion.img key={showcase.id} src={showcase.image} alt={`AUREVIA ${showcase.name} featured fragrance photography`} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0 w-full h-full object-cover" /></AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12100d]/60" />
              <div className="absolute bottom-5 left-5 flex gap-2">{FRAGRANCES.map((f, i) => <button key={f.id} onClick={() => setShowcaseIdx(i)} aria-label={`Feature ${f.name}`} aria-pressed={showcaseIdx === i} className={`h-1.5 transition-all ${showcaseIdx === i ? 'w-10 bg-[#c6a15b]' : 'w-5 bg-white/35 hover:bg-white/70'}`} />)}</div>
            </div>
            <div className="lg:col-span-7 p-8 sm:p-12">
              <AnimatePresence mode="wait">
                <motion.div key={showcase.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#c6a15b]">{showcase.family} · Eau de Parfum</p>
                  <h3 className="font-serif text-5xl sm:text-6xl mt-3 leading-none">{showcase.name}</h3>
                  <p className="font-serif italic text-xl text-white/50 mt-2">{showcase.tagline}</p>
                  <p className="text-[15px] leading-relaxed text-white/60 mt-5 max-w-xl">{showcase.description}</p>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 text-[12px]">
                    <span className="inline-flex items-center gap-2 text-white/55"><Layers size={15} className="text-[#c6a15b]" /> {showcase.mood}</span>
                    <span className="inline-flex items-center gap-2 text-white/55"><Clock3 size={15} className="text-[#c6a15b]" /> {showcase.occasion}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-8">
                    <span className="font-serif text-4xl">{fmt(showcase.price100)}<span className="text-base text-white/40"> / 100 ml</span></span>
                    <button onClick={() => setModal(showcase)} className="inline-flex items-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[11px] tracking-[0.16em] uppercase px-6 py-3.5 transition">View Details <ArrowRight size={14} /></button>
                    <button onClick={() => addToBag(showcase.id, 100)} className="inline-flex items-center gap-2 border border-white/22 hover:border-[#c6a15b] hover:text-[#e8c87a] text-[11px] font-bold tracking-[0.16em] uppercase px-6 py-3.5 transition"><ShoppingBag size={14} /> Add to Bag</button>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex flex-wrap gap-2 mt-10 pt-7 border-t border-white/8" role="group" aria-label="Select featured fragrance">
                {FRAGRANCES.map((f, i) => (
                  <button key={f.id} onClick={() => { setShowcaseIdx(i); setSelectedId(f.id); }} aria-pressed={showcaseIdx === i} className={`inline-flex items-center gap-2 border px-3.5 py-2.5 text-[11px] font-semibold transition ${showcaseIdx === i ? 'border-[#c6a15b] bg-[#c6a15b]/12 text-[#e8c87a]' : 'border-white/12 text-white/55 hover:border-white/35'}`}>
                    <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ background: f.liquid }} />{f.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- NEWSLETTER ---------- */}
      <section id="newsletter" className="relative py-24 lg:py-28 overflow-hidden" aria-label="Newsletter">
        <img src="/images/boutique.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-18" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0908] via-[#0a0908]/82 to-[#0a0908]" />
        <div className="relative max-w-3xl mx-auto px-5 text-center" data-reveal>
          <span className="inline-grid place-items-center w-14 h-14 rounded-full border border-[#c6a15b]/55 bg-[#c6a15b]/10 text-[#e8c87a]"><Mail size={22} /></span>
          <h2 className="font-serif text-4xl sm:text-5xl mt-6">Join the <span className="italic text-gold-grad">Private List</span></h2>
          <p className="text-white/55 text-[15px] leading-relaxed mt-4 max-w-xl mx-auto">Seasonal compositions, atelier stories and first access to concept boutique evenings — composed occasionally, never excessively.</p>
          {nlDone ? (
            <div className="mt-9 border border-[#c6a15b]/45 bg-[#c6a15b]/10 px-6 py-6" role="status">
              <CheckCircle2 className="mx-auto text-[#e8c87a]" size={30} />
              <p className="font-serif text-2xl mt-3">Welcome to the Private List</p>
              <p className="text-sm text-white/55 mt-1.5">Demo subscription confirmed for <strong className="text-white/80">{nlEmail}</strong>. As AUREVIA is a fictional concept, no email will actually be sent and nothing was stored.</p>
              <button onClick={() => { setNlDone(false); setNlEmail(''); }} className="mt-4 text-[11px] font-bold tracking-[0.16em] uppercase text-[#e8c87a] underline underline-offset-4">Subscribe another address</button>
            </div>
          ) : (
            <form onSubmit={submitNewsletter} noValidate className="mt-9">
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <label className="sr-only" htmlFor="nl-email">Email address</label>
                <input id="nl-email" type="email" autoComplete="email" value={nlEmail} onChange={e => { setNlEmail(e.target.value); setNlErr(''); }} placeholder="Your email address" aria-invalid={!!nlErr} aria-describedby={nlErr ? 'nl-error' : undefined} className={`${inputCls} flex-1 text-center sm:text-left bg-black/45 backdrop-blur`} />
                <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[11px] tracking-[0.16em] uppercase px-7 py-3.5 transition shrink-0">Subscribe <Send size={14} /></button>
              </div>
              {nlErr && <p id="nl-error" className={`${errCls} justify-center`} role="alert"><AlertCircle size={14} />{nlErr}</p>}
              <p className="text-[11px] text-white/35 mt-4">Demo form — validated locally, never transmitted or stored. Unsubscribe at any time in a real boutique experience.</p>
            </form>
          )}
        </div>
      </section>

      {/* ---------- CONTACT ---------- */}
      <section id="contact" className="py-24 lg:py-32 bg-[#0d0b09] border-t border-white/6 scroll-mt-24" aria-label="Contact">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5" data-reveal>
            <p className="text-[11px] tracking-[0.34em] uppercase text-[#c6a15b] flex items-center gap-3"><span className="gold-line w-10" /> Contact</p>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.02] mt-4">Begin a<br /><span className="italic text-gold-grad">conversation</span></h2>
            <p className="text-[15px] text-white/55 leading-relaxed mt-5 max-w-md">Fragrance consultations, gifting guidance or questions about the collection — the concept boutique atelier would be delighted to assist.</p>
            <ul className="space-y-4 mt-9 text-sm">
              <li className="flex gap-4"><span className="w-10 h-10 shrink-0 grid place-items-center rounded-full border border-[#c6a15b]/45 text-[#e8c87a]"><MapPin size={16} /></span><span><strong className="block font-serif text-lg font-medium">The Concept Boutique</strong><span className="text-white/50">12 Rue de la Paix, Paris — fictional address for this concept</span></span></li>
              <li className="flex gap-4"><span className="w-10 h-10 shrink-0 grid place-items-center rounded-full border border-[#c6a15b]/45 text-[#e8c87a]"><Mail size={16} /></span><span><strong className="block font-serif text-lg font-medium">atelier@aurevia.example</strong><span className="text-white/50">Concept inbox — use the form for the demo</span></span></li>
              <li className="flex gap-4"><span className="w-10 h-10 shrink-0 grid place-items-center rounded-full border border-[#c6a15b]/45 text-[#e8c87a]"><Phone size={16} /></span><span><strong className="block font-serif text-lg font-medium">+33 (0)1 00 00 00 00</strong><span className="text-white/50">Mon–Sat, 10:00–19:00 CET (concept hours)</span></span></li>
            </ul>
            <img src="/images/product-amber.jpg" alt="AUREVIA amber flacon photographed against black" className="w-full h-52 object-cover mt-10 border border-white/10" loading="lazy" />
          </div>

          <div className="lg:col-span-7" data-reveal>
            {cDone ? (
              <div className="border border-[#c6a15b]/45 bg-[#c6a15b]/8 p-10 text-center h-full grid place-content-center" role="status">
                <CheckCircle2 size={48} className="mx-auto text-[#e8c87a]" />
                <h3 className="font-serif text-3xl mt-5">Thank you, {cForm.name.split(' ')[0]}</h3>
                <p className="text-sm text-white/55 leading-relaxed mt-3 max-w-md mx-auto"><strong className="text-[#e8c87a]">Demo submission —</strong> your inquiry about “{cForm.topic}” was validated successfully but, as AUREVIA is a fictional concept, it was <strong className="text-white/80">not sent or stored anywhere</strong>. In a live boutique, our atelier would reply to {cForm.email} within two business days.</p>
                <button onClick={() => { setCDone(false); setCForm({ name: '', email: '', topic: 'Fragrance consultation', message: '' }); }} className="mt-7 mx-auto border border-[#c6a15b] text-[#e8c87a] px-6 py-3 text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-[#c6a15b] hover:text-[#0a0908] transition">Send Another Inquiry</button>
              </div>
            ) : (
              <form onSubmit={submitContact} noValidate className="border border-white/10 bg-white/[0.02] p-7 sm:p-9">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><label htmlFor="c-name" className="block text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-2">Full Name *</label>
                    <input id="c-name" autoComplete="name" value={cForm.name} onChange={e => setCForm({ ...cForm, name: e.target.value })} placeholder="e.g. Camille Laurent" className={inputCls} aria-invalid={!!cErr.name} />
                    {cErr.name && <p className={errCls} role="alert"><AlertCircle size={13} />{cErr.name}</p>}</div>
                  <div><label htmlFor="c-email" className="block text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-2">Email Address *</label>
                    <input id="c-email" type="email" autoComplete="email" value={cForm.email} onChange={e => setCForm({ ...cForm, email: e.target.value })} placeholder="you@example.com" className={inputCls} aria-invalid={!!cErr.email} />
                    {cErr.email && <p className={errCls} role="alert"><AlertCircle size={13} />{cErr.email}</p>}</div>
                </div>
                <div className="mt-5"><label htmlFor="c-topic" className="block text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-2">Inquiry Topic</label>
                  <select id="c-topic" value={cForm.topic} onChange={e => setCForm({ ...cForm, topic: e.target.value })} className={`${inputCls} [&>option]:bg-[#171410]`}>
                    {['Fragrance consultation', 'Gifting & coffrets', 'Boutique appointment', 'Press & partnerships', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div className="mt-5"><label htmlFor="c-message" className="block text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 mb-2">Your Message *</label>
                  <textarea id="c-message" rows={5} value={cForm.message} onChange={e => setCForm({ ...cForm, message: e.target.value })} placeholder="Tell us about the mood, occasion or person you are choosing for…" className={`${inputCls} resize-none`} aria-invalid={!!cErr.message} />
                  {cErr.message && <p className={errCls} role="alert"><AlertCircle size={13} />{cErr.message}</p>}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-7">
                  <button type="submit" className="inline-flex items-center justify-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[11px] tracking-[0.16em] uppercase px-8 py-4 transition">Send Inquiry (Demo) <Send size={14} /></button>
                  <p className="text-[11px] text-amber-200/70 border border-amber-300/25 bg-amber-300/8 px-3.5 py-2.5 leading-relaxed">Demo form: submissions are validated on this page only and are never sent or stored.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-[#070605] border-t border-[#c6a15b]/18" aria-label="Footer">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <a href="#home" className="flex items-center gap-3"><span className="w-9 h-9 border border-[#c6a15b]/70 rotate-45 grid place-items-center"><span className="-rotate-45 font-serif text-[#c6a15b] text-lg leading-none">A</span></span>
              <span><span className="block font-serif text-[21px] tracking-[0.3em]">AUREVIA</span><span className="block text-[8px] tracking-[0.4em] text-[#c6a15b] mt-0.5">MAISON DE PARFUM</span></span></a>
            <p className="text-[13px] leading-relaxed text-white/45 mt-5 max-w-xs">A fictional maison de parfum devoted to the art of being remembered — four signature creations, a hand-finished flacon, and an immersive concept boutique crafted for portfolio presentation.</p>
            <div className="flex gap-2.5 mt-6">
              {[{ icon: Instagram, label: 'AUREVIA on Instagram (concept)' }, { icon: Facebook, label: 'AUREVIA on Facebook (concept)' }, { icon: Twitter, label: 'AUREVIA on X (concept)' }, { icon: Youtube, label: 'AUREVIA on YouTube (concept)' }].map(s => (
                <a key={s.label} href="#home" aria-label={s.label} onClick={e => { e.preventDefault(); setToast('Social profiles are part of the fictional concept'); }} className="w-10 h-10 grid place-items-center rounded-full border border-white/15 text-white/60 hover:border-[#c6a15b] hover:text-[#e8c87a] transition"><s.icon size={16} /></a>
              ))}
            </div>
          </div>
          <nav aria-label="Footer"><h3 className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#c6a15b]">Maison</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              {[['Home', '#home'], ['Signature Collection', '#collection'], ['360° Experience', '#experience'], ['Fragrance Notes', '#notes'], ['Our Story', '#story'], ['Craftsmanship', '#craft']].map(([l, h]) => <li key={h}><a href={h} className="hover:text-[#e8c87a] transition inline-flex items-center gap-1.5"><ChevronRight size={12} className="text-[#c6a15b]" />{l}</a></li>)}
            </ul></nav>
          <div><h3 className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#c6a15b]">Collection</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/55">
              {FRAGRANCES.map(f => <li key={f.id}><button onClick={() => setModal(f)} className="hover:text-[#e8c87a] transition inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-white/25" style={{ background: f.liquid }} />{f.name} — {fmt(f.price100)}</button></li>)}
            </ul>
            <button onClick={() => setBagOpen(true)} className="mt-5 inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#e8c87a] transition"><ShoppingBag size={15} /> Your Bag ({bagCount})</button></div>
          <div><h3 className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#c6a15b]">Concept Boutique</h3>
            <address className="not-italic mt-5 space-y-3 text-sm text-white/55">
              <p className="flex gap-2.5"><MapPin size={15} className="text-[#c6a15b] shrink-0 mt-0.5" />12 Rue de la Paix, Paris<br /><span className="text-white/35">(fictional address)</span></p>
              <p className="flex gap-2.5"><Mail size={15} className="text-[#c6a15b] shrink-0 mt-0.5" />atelier@aurevia.example</p>
              <p className="flex gap-2.5"><Phone size={15} className="text-[#c6a15b] shrink-0 mt-0.5" />+33 (0)1 00 00 00 00</p>
            </address>
            <a href="#newsletter" className="mt-6 inline-flex items-center gap-2 border border-[#c6a15b]/60 text-[#e8c87a] text-[10px] font-bold tracking-[0.16em] uppercase px-4 py-2.5 hover:bg-[#c6a15b] hover:text-[#0a0908] transition">Join the Private List <ArrowRight size={12} /></a></div>
        </div>
        <div className="border-t border-white/8">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/40 text-center md:text-left">
            <p>© 2026 AUREVIA — a fictional portfolio concept. All fragrances, pricing and boutique details are illustrative; no real products or orders exist.</p>
            <div className="flex items-center gap-5 shrink-0">
              <button onClick={() => setLegal('privacy')} className="hover:text-[#e8c87a] transition underline-offset-4 hover:underline">Privacy Policy</button>
              <button onClick={() => setLegal('terms')} className="hover:text-[#e8c87a] transition underline-offset-4 hover:underline">Terms</button>
              <a href="#contact" className="hover:text-[#e8c87a] transition">Contact</a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-5 lg:px-8 pb-8 -mt-2 text-center md:text-left">
            <p className="text-[12px] text-white/40">Concept website by <a href="https://www.flowfoundryai.in" target="_blank" rel="noopener noreferrer" className="text-[#e8c87a] font-semibold hover:underline underline-offset-4">FlowFoundry AI Solutions</a></p>
          </div>
        </div>
      </footer>

      <ProductModal fragrance={modal} onClose={() => setModal(null)} onAdd={addToBag} />
      <CartDrawer open={bagOpen} items={cart} onClose={() => setBagOpen(false)}
        setQty={(key, qty) => setCart(p => p.map(i => i.key === key ? { ...i, qty } : i))}
        remove={key => setCart(p => p.filter(i => i.key !== key))}
        onBrowse={() => { setBagOpen(false); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }} />
      <LegalModal kind={legal} onClose={() => setLegal(null)} />

      <AnimatePresence>{toast && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-[#171410] border border-[#c6a15b]/50 shadow-2xl px-5 py-3.5 flex items-center gap-3 max-w-[92vw]" role="status">
          <CheckCircle2 size={17} className="text-[#e8c87a] shrink-0" /><span className="text-sm text-white/80">{toast}</span>
          <button onClick={() => { setToast(''); setBagOpen(true); }} className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#e8c87a] underline underline-offset-4 shrink-0">View Bag</button>
        </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
