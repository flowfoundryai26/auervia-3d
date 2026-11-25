import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { FRAGRANCES, fmt, priceFor, type CartItem, type Fragrance } from '../lib/data';

export function MiniBottle({ f, size = 'md' }: { f: Fragrance; size?: 'md' | 'sm' }) {
  const h = size === 'sm' ? 'h-36' : 'h-64';
  return (
    <div className={`relative ${h} w-full grid place-items-center`} aria-hidden="true">
      <div className="absolute w-44 h-44 rounded-full blur-3xl opacity-40" style={{ background: f.liquid }} />
      <div className="relative flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-2deg]">
        <div className="w-12 h-14 border border-white/25 shadow-[0_10px_30px_rgba(0,0,0,.5)]" style={{ background: `linear-gradient(135deg, ${f.cap}, #00000088 60%, ${f.accent})` }} />
        <div className="w-6 h-3 bg-gradient-to-r from-[#8a6a33] via-[#e8c87a] to-[#8a6a33]" />
        <div className="relative w-28 h-36 border border-white/35 bg-white/8 backdrop-blur-sm overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,.55)]">
          <div className="absolute inset-x-1.5 bottom-1.5 top-5" style={{ background: `linear-gradient(180deg, ${f.liquid}, ${f.liquidDeep})` }} />
          <div className="absolute left-2 top-0 bottom-0 w-2.5 bg-white/25 blur-[2px]" />
          <div className="absolute inset-x-4 top-10 bg-[#f5efe6] text-[#0a0908] text-center py-2 px-1 shadow">
            <div className="font-serif text-[9px] tracking-[0.28em]">AUREVIA</div>
            <div className="font-serif italic text-[10px] leading-tight mt-0.5">{f.name}</div>
          </div>
        </div>
        <div className="w-32 h-2 mt-3 rounded-full bg-black/60 blur-[3px]" />
      </div>
    </div>
  );
}

export function ProductModal({ fragrance, onClose, onAdd }: { fragrance: Fragrance | null; onClose: () => void; onAdd: (id: string, size: 50 | 100, qty: number) => void }) {
  const [size, setSize] = useState<50 | 100>(100);
  const [qty, setQty] = useState(1);
  useEffect(() => { setSize(100); setQty(1); }, [fragrance]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <AnimatePresence>
      {fragrance && (
        <motion.div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm grid place-items-end sm:place-items-center p-0 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={`${fragrance.name} details`}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#12100d] border border-[#c6a15b]/25 text-[#f5efe6]">
            <div className="grid md:grid-cols-2">
              <div className="relative bg-[radial-gradient(circle_at_50%_35%,#2a2117,#0a0908_70%)] p-8 grid place-items-center min-h-[320px]">
                <img src={fragrance.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
                <div className="relative group w-full"><MiniBottle f={fragrance} /></div>
                <span className="absolute top-4 left-4 text-[10px] tracking-[0.22em] uppercase bg-black/60 border border-[#c6a15b]/40 text-[#e8c87a] px-3 py-1.5">{fragrance.family}</span>
              </div>
              <div className="p-7 sm:p-9">
                <button onClick={onClose} aria-label="Close details" className="float-right w-9 h-9 grid place-items-center rounded-full border border-white/15 hover:border-[#c6a15b]"><X size={17} /></button>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#c6a15b]">Aurevia · Signature Collection</p>
                <h3 className="font-serif text-4xl mt-2">{fragrance.name}</h3>
                <p className="font-serif italic text-white/60 mt-1">{fragrance.tagline}</p>
                <p className="text-sm leading-relaxed text-white/70 mt-4">{fragrance.description}</p>
                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  {(['top', 'heart', 'base'] as const).map(k => (
                    <div key={k} className="border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[9px] tracking-[0.24em] uppercase text-[#c6a15b]">{k === 'heart' ? 'Heart' : k}</div>
                      <div className="text-[11px] text-white/70 mt-1.5 leading-snug">{fragrance.notes[k].join(' · ')}</div>
                    </div>
                  ))}
                </div>
                <dl className="text-[12px] space-y-2 mt-5 text-white/60">
                  <div className="flex justify-between gap-4 border-b border-white/8 pb-2"><dt className="uppercase tracking-widest text-white/40">Mood</dt><dd className="text-right">{fragrance.mood}</dd></div>
                  <div className="flex justify-between gap-4 border-b border-white/8 pb-2"><dt className="uppercase tracking-widest text-white/40">Occasion</dt><dd className="text-right">{fragrance.occasion}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="uppercase tracking-widest text-white/40">Format</dt><dd className="text-right">{fragrance.intensity}</dd></div>
                </dl>
                <div className="flex gap-2 mt-6" role="group" aria-label="Choose size">
                  {([50, 100] as const).map(s => (
                    <button key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={`flex-1 border px-3 py-3 text-sm transition ${size === s ? 'border-[#c6a15b] bg-[#c6a15b]/12 text-[#e8c87a]' : 'border-white/15 text-white/60 hover:border-white/40'}`}>{s} ml · {fmt(priceFor(fragrance, s))}</button>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center border border-white/15">
                    <button aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 grid place-items-center"><Minus size={15} /></button>
                    <span className="w-8 text-center" aria-live="polite">{qty}</span>
                    <button aria-label="Increase quantity" onClick={() => setQty(q => Math.min(9, q + 1))} className="w-10 h-11 grid place-items-center"><Plus size={15} /></button>
                  </div>
                  <button onClick={() => { onAdd(fragrance.id, size, qty); onClose(); }} className="flex-1 inline-flex items-center justify-center gap-2 bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[12px] tracking-[0.14em] uppercase py-3.5 transition"><ShoppingBag size={16} /> Add to Bag · {fmt(priceFor(fragrance, size) * qty)}</button>
                </div>
                <p className="flex gap-2 text-[11px] text-white/40 mt-4"><Info size={14} className="shrink-0 text-[#c6a15b]" /> Concept pricing shown for design demonstration. AUREVIA is fictional; no payment or delivery takes place.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CartDrawer({ open, items, onClose, setQty, remove, onBrowse }: {
  open: boolean; items: CartItem[]; onClose: () => void; setQty: (key: string, qty: number) => void; remove: (key: string) => void; onBrowse: () => void;
}) {
  const [checkedOut, setCheckedOut] = useState(false);
  useEffect(() => { if (!open) setCheckedOut(false); }, [open]);
  const rows = items.map(i => ({ ...i, f: FRAGRANCES.find(f => f.id === i.fragranceId)! })).filter(r => r.f);
  const subtotal = rows.reduce((s, r) => s + priceFor(r.f, r.size) * r.qty, 0);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed right-0 top-0 bottom-0 z-[71] w-full max-w-md bg-[#12100d] border-l border-[#c6a15b]/25 text-[#f5efe6] flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }} role="dialog" aria-modal="true" aria-label="Shopping bag">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="font-serif text-2xl flex items-center gap-2"><ShoppingBag size={20} className="text-[#c6a15b]" /> Your Bag</h3>
              <button onClick={onClose} aria-label="Close bag" className="w-9 h-9 grid place-items-center rounded-full border border-white/15"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {checkedOut ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={52} className="mx-auto text-[#c6a15b]" />
                  <h4 className="font-serif text-2xl mt-4">Demo checkout complete</h4>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed">This is a fictional concept boutique, so no payment was taken and no order was placed. Thank you for exploring AUREVIA.</p>
                  <button onClick={onClose} className="mt-6 border border-[#c6a15b] text-[#e8c87a] px-6 py-3 text-[11px] font-bold tracking-[0.16em] uppercase">Continue Exploring</button>
                </div>
              ) : rows.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles size={40} className="mx-auto text-[#c6a15b]" />
                  <p className="font-serif text-xl mt-4">Your bag awaits its first treasure</p>
                  <p className="text-sm text-white/50 mt-2">Discover the four signature creations of the house.</p>
                  <button onClick={onBrowse} className="mt-6 bg-[#c6a15b] text-[#0a0908] px-6 py-3 text-[11px] font-bold tracking-[0.16em] uppercase">Browse Collection</button>
                </div>
              ) : rows.map(r => (
                <div key={r.key} className="flex gap-4 border border-white/10 bg-white/[0.03] p-4">
                  <div className="w-14 shrink-0 grid place-items-center">
                    <div className="flex flex-col items-center scale-[0.42] origin-center -my-10"><MiniBottle f={r.f} /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2"><p className="font-serif text-lg leading-tight">{r.f.name}</p><button onClick={() => remove(r.key)} aria-label={`Remove ${r.f.name}`} className="text-white/40 hover:text-red-300"><Trash2 size={16} /></button></div>
                    <p className="text-[11px] text-white/45 uppercase tracking-widest mt-0.5">{r.size} ml · {r.f.family}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/15">
                        <button aria-label="Decrease" onClick={() => setQty(r.key, Math.max(1, r.qty - 1))} className="w-8 h-8 grid place-items-center"><Minus size={13} /></button>
                        <span className="w-7 text-center text-sm">{r.qty}</span>
                        <button aria-label="Increase" onClick={() => setQty(r.key, Math.min(9, r.qty + 1))} className="w-8 h-8 grid place-items-center"><Plus size={13} /></button>
                      </div>
                      <span className="font-serif text-lg text-[#e8c87a]">{fmt(priceFor(r.f, r.size) * r.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!checkedOut && rows.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-white/55">Subtotal (concept pricing)</span><strong className="font-serif text-xl text-[#e8c87a]">{fmt(subtotal)}</strong></div>
                <p className="text-[11px] text-white/40">Complimentary gift wrapping & discovery samples are part of the concept experience.</p>
                <button onClick={() => setCheckedOut(true)} className="w-full bg-[#c6a15b] hover:bg-[#e8c87a] text-[#0a0908] font-bold text-[12px] tracking-[0.16em] uppercase py-4 transition">Demo Checkout</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function LegalModal({ kind, onClose }: { kind: 'privacy' | 'terms' | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {kind && (
        <motion.div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true" aria-label={kind === 'privacy' ? 'Privacy policy' : 'Terms'}>
          <motion.div onClick={e => e.stopPropagation()} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#12100d] border border-[#c6a15b]/25 text-[#f5efe6] p-8">
            <button onClick={onClose} aria-label="Close" className="float-right w-9 h-9 grid place-items-center rounded-full border border-white/15"><X size={17} /></button>
            <h3 className="font-serif text-3xl">{kind === 'privacy' ? 'Privacy Policy' : 'Terms of Experience'}</h3>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c6a15b] mt-2">Fictional concept · Last updated November 2026</p>
            <div className="text-sm leading-relaxed text-white/65 space-y-4 mt-5">
              {kind === 'privacy' ? <>
                <p>AUREVIA is a fictional portfolio concept created by FlowFoundry AI Solutions. This website does not operate a real store and does not collect, store or transmit personal data.</p>
                <p><strong className="text-white/85">Forms.</strong> The newsletter and contact forms validate input locally in your browser to demonstrate interaction design. Submissions are not sent to any server and are discarded when you leave the page.</p>
                <p><strong className="text-white/85">Shopping bag.</strong> Bag contents exist only in page memory for the duration of your visit. No payment details are ever requested.</p>
                <p><strong className="text-white/85">Cookies & analytics.</strong> This concept sets no tracking cookies and runs no analytics.</p>
              </> : <>
                <p>By exploring this concept website you acknowledge that AUREVIA, its fragrances, pricing and boutique details are entirely fictional and presented for design portfolio purposes.</p>
                <p><strong className="text-white/85">No transactions.</strong> The shopping bag and demo checkout simulate an e-commerce flow. No contract of sale is formed and no goods will be supplied.</p>
                <p><strong className="text-white/85">Imagery & 3D.</strong> Photography is licensed stock imagery; the perfume flacon is an original procedural 3D model created for this concept.</p>
                <p><strong className="text-white/85">Intellectual property.</strong> The AUREVIA wordmark and site design are concept works by FlowFoundry AI Solutions.</p>
              </>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
