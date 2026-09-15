import { useState } from 'react';
import { Check, X, WalletCards } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/context/WalletContext';

const quickAmounts = [50, 100, 200, 500];

export function WalletTopUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState('100');
  const [submitting, setSubmitting] = useState(false);
  const { topUpWallet } = useWallet();
  const { toast } = useToast();

  if (!open) return null;

  const submit = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({ title: 'Enter a valid amount', description: 'Your top-up amount must be greater than zero.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await topUpWallet(parsedAmount);
      toast({ title: 'Wallet topped up', description: `₹${parsedAmount.toFixed(2)} was added to your SREC Wallet.` });
      onClose();
    } catch (error) {
      toast({ title: 'Top-up failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10291c]/65 p-3 backdrop-blur-sm md:items-center"><div className="w-full max-w-md rounded-3xl bg-[#fffdf8] p-5 text-[#173d2d] shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="rounded-2xl bg-[#e8efe7] p-3 text-[#1b4332]"><WalletCards size={22} /></div><div><p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">SREC Wallet</p><h2 className="mt-1 text-2xl font-bold">Add funds</h2></div></div><button aria-label="Close wallet top-up" onClick={onClose} className="rounded-full bg-[#f0eee7] p-2"><X size={17} /></button></div><div className="mt-6 grid grid-cols-4 gap-2">{quickAmounts.map((quickAmount) => <button key={quickAmount} onClick={() => setAmount(String(quickAmount))} className={`rounded-xl border py-3 text-sm font-bold ${amount === String(quickAmount) ? 'border-[#1b4332] bg-[#edf4eb] text-[#1b4332]' : 'border-[#ddd8ca] bg-white text-[#536056]'}`}>+₹{quickAmount}</button>)}</div><label className="mt-5 block text-xs font-bold uppercase tracking-[.16em] text-[#7d877d]">Custom amount<input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="Enter amount" className="mt-2 w-full rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#2d6a4f]" /></label><button disabled={submitting} onClick={submit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d] disabled:cursor-wait disabled:opacity-60">{submitting ? 'Adding funds…' : 'Confirm Top-Up'} {submitting ? <Check size={17} /> : <WalletCards size={17} />}</button></div></div>;
}