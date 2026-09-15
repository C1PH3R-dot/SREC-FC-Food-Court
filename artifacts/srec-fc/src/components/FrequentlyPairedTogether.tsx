import { Plus, Sparkles } from 'lucide-react';
import { getAIPairingRecommendations, type PairingMenuItem } from '@/lib/aiPairingEngine';

const defaultFoodPlaceholder = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82';

type FrequentlyPairedTogetherProps = {
  cartItems: PairingMenuItem[];
  catalog: PairingMenuItem[];
  onAdd: (item: PairingMenuItem) => void;
  getImage: (item: PairingMenuItem) => string | undefined;
};

export function FrequentlyPairedTogether({ cartItems, catalog, onAdd, getImage }: FrequentlyPairedTogetherProps) {
  const recommendations = getAIPairingRecommendations(cartItems, catalog);
  if (!recommendations.length) return null;

  return <section className="mt-5 rounded-3xl border border-[#d9e5d5] bg-[#f4f8f1] p-4" aria-label="Frequently Paired Together"><div className="flex items-center gap-2"><div className="rounded-xl bg-[#eeb02f] p-2 text-[#173d2d]"><Sparkles size={16} /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#2d6a4f]">AI picks for your tray</p><h2 className="text-lg font-bold text-[#173d2d]">Frequently Paired Together</h2></div></div><div className="scrollbar-none -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1">{recommendations.map((item) => { const image = getImage(item); return <article key={item.id} className="min-w-[150px] overflow-hidden rounded-2xl border border-[#dfe8dc] bg-white shadow-sm"><div className="h-24 overflow-hidden bg-[#e8eee5]"><img src={image ?? defaultFoodPlaceholder} alt={item.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = defaultFoodPlaceholder; }} className="h-full w-full object-cover object-center" /></div><div className="p-3"><p className="truncate text-sm font-bold text-[#1d3d2e]">{item.name}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="font-mono text-xs font-bold text-[#1b4332]">₹{item.price.toFixed(2)}</span><button data-testid={`button-pairing-add-${item.id}`} onClick={() => onAdd(item)} className="flex items-center gap-1 rounded-lg bg-[#eeb02f] px-2 py-1.5 text-[10px] font-bold text-[#173d2d]"><Plus size={12} /> Add</button></div></div></article>; })}</div></section>;
}