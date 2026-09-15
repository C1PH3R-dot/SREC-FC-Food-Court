import { Download, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallPWABanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isStandalone, isIOS, installApp } = usePWAInstall();
  const showBanner = !dismissed && !isStandalone && (isInstallable || isIOS);
  if (!showBanner) return null;

  return <aside className="fixed bottom-20 left-3 right-3 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-[#c9dcc8] bg-[#f7fbf4] p-3 text-[#173d2d] shadow-xl md:bottom-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b4332] text-[#eeb02f]"><Download size={19} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">Install SREC FC App</p>{isIOS ? <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-4 text-[#627064]">Tap Safari <Share2 size={12} /> then <strong>Add to Home Screen</strong>.</p> : <p className="mt-0.5 text-[11px] leading-4 text-[#627064]">One-tap access to the campus food court.</p>}</div>{isInstallable && <button onClick={() => void installApp()} className="shrink-0 rounded-xl bg-[#eeb02f] px-3 py-2 text-xs font-bold text-[#173d2d]">Install</button>}<button aria-label="Dismiss install banner" onClick={() => setDismissed(true)} className="shrink-0 rounded-full p-1.5 text-[#6c756b] hover:bg-[#e8efe7]"><X size={16} /></button></aside>;
}