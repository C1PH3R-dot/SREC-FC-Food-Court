import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  CreditCard,
  History,
  Home as HomeIcon,
  Leaf,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { Router as WouterRouter, useLocation } from 'wouter';
import logo from './assets/srec-fc-logo.png';

type Category =
  | 'Puffs & Bakery'
  | 'Breakfast'
  | 'Lunch'
  | 'Indochines'
  | 'Chats'
  | 'Snacks'
  | 'Hot Drinks'
  | 'Milkshakes'
  | 'Fresh Juice & Mojito';
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: boolean;
};
type CartLine = { itemId: string; qty: number };
type Account = { username: string; email: string; password: string };
type Profile = { name: string; email: string; reminders: boolean };
type Receipt = {
  id: string;
  date: string;
  time: string;
  transaction: string;
  payment: string;
  items: CartLine[];
  subtotal: number;
  gst: number;
  total: number;
};
type Store = {
  signedIn: boolean;
  activeEmail: string;
  accounts: Account[];
  profile: Profile;
  cart: CartLine[];
  orders: Receipt[];
  menu: MenuItem[];
};

const menuSeed: MenuItem[] = [
  ['Veg Puff', 15, 'Puffs & Bakery'],
  ['Egg Puff', 20, 'Puffs & Bakery'],
  ['Mushroom Puff', 30, 'Puffs & Bakery'],
  ['Chicken Puff', 30, 'Puffs & Bakery'],
  ['Coconut Bun', 15, 'Puffs & Bakery'],
  ['Honey Cake', 30, 'Puffs & Bakery'],
  ['Apple Cake', 20, 'Puffs & Bakery'],
  ['Tea Cake', 20, 'Puffs & Bakery'],
  ['Choco Lava', 50, 'Puffs & Bakery'],
  ['Pongal', 30, 'Breakfast'],
  ['Poori', 30, 'Breakfast'],
  ['Idly', 30, 'Breakfast'],
  ['Dosa', 30, 'Breakfast'],
  ['Roast', 30, 'Breakfast'],
  ['Parotta', 30, 'Lunch'],
  ['Chappathi', 30, 'Lunch'],
  ['Variety Rice', 30, 'Lunch'],
  ['Meals', 60, 'Lunch'],
  ['Kothu Parotta', 50, 'Lunch'],
  ['Veg Noodles', 50, 'Indochines'],
  ['Egg Noodles', 60, 'Indochines'],
  ['Chicken Noodles', 70, 'Indochines'],
  ['Veg Rice', 50, 'Indochines'],
  ['Egg Rice', 60, 'Indochines'],
  ['Chicken Rice', 70, 'Indochines'],
  ['Chicken Biriyani', 70, 'Indochines'],
  ['Egg Biriyani', 55, 'Indochines'],
  ['Bhel Poori', 25, 'Chats'],
  ['Masala Poori', 25, 'Chats'],
  ['Mushroom Chat', 25, 'Chats'],
  ['Pani Poori', 25, 'Chats'],
  ['Thattu Vada Set', 30, 'Chats'],
  ['Vada', 14, 'Snacks'],
  ['Bajji', 14, 'Snacks'],
  ['Bonda', 14, 'Snacks'],
  ['Tea', 10, 'Hot Drinks'],
  ['Coffee', 15, 'Hot Drinks'],
  ['Lemon Tea', 12, 'Hot Drinks'],
  ['Milk', 15, 'Hot Drinks'],
  ['Boost/Horlicks', 18, 'Hot Drinks'],
  ['Vanilla', 60, 'Milkshakes'],
  ['Oreo', 65, 'Milkshakes'],
  ['Banana', 60, 'Milkshakes'],
  ['Strawberry', 60, 'Milkshakes'],
  ['Red Velvet', 80, 'Milkshakes'],
  ['Brownie', 80, 'Milkshakes'],
  ['Pomegranate', 50, 'Fresh Juice & Mojito'],
  ['Apple', 50, 'Fresh Juice & Mojito'],
  ['Mosambi', 35, 'Fresh Juice & Mojito'],
  ['Pineapple', 40, 'Fresh Juice & Mojito'],
  ['Orange', 40, 'Fresh Juice & Mojito'],
  ['Grapes', 35, 'Fresh Juice & Mojito'],
  ['Muskmelon', 40, 'Fresh Juice & Mojito'],
  ['Watermelon', 25, 'Fresh Juice & Mojito'],
  ['Banana', 25, 'Fresh Juice & Mojito'],
  ['Pappaya', 25, 'Fresh Juice & Mojito'],
  ['Lemon', 15, 'Fresh Juice & Mojito'],
  ['Lime Mojito', 50, 'Fresh Juice & Mojito'],
  ['Blue Monday', 50, 'Fresh Juice & Mojito'],
].map(([name, price, category], index) => ({
  id: `${String(name).toLowerCase().replace(/[^a-z]+/g, '-')}-${index}`,
  name: name as string,
  price: price as number,
  category: category as Category,
  stock: !['Chicken Puff', 'Red Velvet', 'Blue Monday', 'Chicken Biriyani'].includes(name as string),
}));

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&q=82`;

const foodImages: Record<string, string> = {
  'Veg Noodles': unsplash('photo-1569718212165-3a8278d5f624'),
  'Egg Noodles': unsplash('photo-1569718212165-3a8278d5f624'),
  'Chicken Noodles': unsplash('photo-1569718212165-3a8278d5f624'),
  'Veg Rice': unsplash('photo-1512058564366-18510be2db19'),
  'Egg Rice': unsplash('photo-1512058564366-18510be2db19'),
  'Chicken Rice': unsplash('photo-1512058564366-18510be2db19'),
  'Chicken Biriyani': unsplash('photo-1589302168068-964664d93dc0'),
  'Egg Biriyani': unsplash('photo-1589302168068-964664d93dc0'),
  'Bhel Poori': unsplash('photo-1601050690597-df0568f70950'),
  'Masala Poori': unsplash('photo-1601050690597-df0568f70950'),
  'Mushroom Chat': unsplash('photo-1512621776951-a57141f2eefd'),
  'Pani Poori': unsplash('photo-1601050690597-df0568f70950'),
  'Thattu Vada Set': unsplash('photo-1601050690597-df0568f70950'),
  Vada: unsplash('photo-1601050690597-df0568f70950'),
  Bajji: unsplash('photo-1601050690597-df0568f70950'),
  Bonda: unsplash('photo-1601050690597-df0568f70950'),
  Tea: unsplash('photo-1544787219-7f47ccb76574'),
  Coffee: unsplash('photo-1495474472287-4d71bcdd2085'),
  'Lemon Tea': unsplash('photo-1544787219-7f47ccb76574'),
  Milk: unsplash('photo-1550583724-b2692b85b150'),
  'Boost/Horlicks': unsplash('photo-1550583724-b2692b85b150'),
  Vanilla: unsplash('photo-1501443762994-82bd5dace89a'),
  Oreo: unsplash('photo-1579954115545-a95591f28bfc'),
  'Banana Shake': unsplash('photo-1579954115545-a95591f28bfc'),
  Strawberry: unsplash('photo-1579954115545-a95591f28bfc'),
  'Red Velvet': unsplash('photo-1578985545062-69928b1d9587'),
  Brownie: unsplash('photo-1606313564200-e75d5e30476c'),
  Pomegranate: unsplash('photo-1490474418585-ba9bad8fd0ea'),
  Apple: unsplash('photo-1490474418585-ba9bad8fd0ea'),
  'Banana Juice': unsplash('photo-1490474418585-ba9bad8fd0ea'),
  Mosambi: unsplash('photo-1546173159-315724a31696'),
  Pineapple: unsplash('photo-1546549032-9571cd6b27df'),
  Orange: unsplash('photo-1546173159-315724a31696'),
  Grapes: unsplash('photo-1537640538966-79f369143f8f'),
  Muskmelon: unsplash('photo-1546173159-315724a31696'),
  Watermelon: unsplash('photo-1563114773-84221bd62daa'),
  Pappaya: unsplash('photo-1528825871115-3581a5387919'),
  Lemon: unsplash('photo-1519621667278-2f9f1ae9f2c7'),
  'Lime Mojito': unsplash('photo-1513558161293-cdaf765ed2fd'),
  'Blue Monday': unsplash('photo-1513558161293-cdaf765ed2fd'),
};

const categories = [
  'All',
  'Puffs & Bakery',
  'Breakfast',
  'Lunch',
  'Indochines',
  'Chats',
  'Snacks',
  'Hot Drinks',
  'Milkshakes',
  'Fresh Juice & Mojito',
];
const authBackground = unsplash('photo-1504674900247-0877df9cc836');
const defaultStore: Store = {
  signedIn: false,
  activeEmail: '',
  accounts: [],
  profile: { name: '', email: '', reminders: false },
  cart: [],
  orders: [],
  menu: menuSeed,
};
const queryClient = new QueryClient();
const money = (value: number) => `₹${value.toFixed(2)}`;

const getStore = (): Store => {
  try {
    const saved = localStorage.getItem('srec-fc-store');
    if (!saved) return defaultStore;
    const parsed = JSON.parse(saved) as Partial<Store>;
    const accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    return {
      ...defaultStore,
      ...parsed,
      accounts,
      signedIn: Boolean(parsed.signedIn && parsed.activeEmail && accounts.length),
      profile: { ...defaultStore.profile, ...(parsed.profile ?? {}) },
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      menu: Array.isArray(parsed.menu) && parsed.menu.length ? parsed.menu : menuSeed,
    };
  } catch {
    return defaultStore;
  }
};
const saveStore = (store: Store) => localStorage.setItem('srec-fc-store', JSON.stringify(store));

function Logo({ small = false }: { small?: boolean }) {
  return (
    <img
      data-testid="img-srec-logo"
      src={logo}
      alt="SREC FC crest"
      className={`${small ? 'h-11 w-11' : 'h-20 w-20'} rounded-2xl object-cover shadow-sm`}
    />
  );
}

function InlineAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-[#f2b8ab] bg-[#fff3f0] px-3 py-2.5 text-xs font-semibold leading-5 text-[#a33d30]">
      {message}
    </div>
  );
}

function Auth({
  accounts,
  onEnter,
  onRegister,
  onResetPassword,
}: {
  accounts: Account[];
  onEnter: (account: Account) => void;
  onRegister: (account: Account) => void;
  onResetPassword: (email: string, password: string) => void;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState('');
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password' | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const simulatedOtp = '4821';

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    setAlert('');
    setForgotStep(null);
  };

  const handleSubmit = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    setAlert('');
    const normalizedEmail = email.trim().toLowerCase();
    if (mode === 'signup') {
      if (!username.trim() || !normalizedEmail || !password) {
        setAlert('Please complete your username, Gmail address, and password.');
        return;
      }
      if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
        setAlert('Please use a valid Gmail address to create your account.');
        return;
      }
      if (accounts.some((account) => account.email === normalizedEmail)) {
        setAlert('Account already exists with this Email. Please Sign In.');
        return;
      }
      const account = { username: username.trim(), email: normalizedEmail, password };
      onRegister(account);
      return;
    }

    const account = accounts.find(
      (candidate) => candidate.email === normalizedEmail && candidate.password === password,
    );
    if (!account) {
      setAlert('Invalid email or password. Please try again.');
      return;
    }
    onEnter(account);
  };

  const startForgotPassword = () => {
    setAlert('');
    setForgotStep('email');
    setForgotEmail(email.trim().toLowerCase());
    setOtp('');
    setNewPassword('');
  };

  const submitForgotEmail = () => {
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!accounts.some((account) => account.email === normalizedEmail)) {
      setAlert('No account found with this Email. Please Sign Up.');
      return;
    }
    setAlert('');
    setForgotEmail(normalizedEmail);
    setForgotStep('otp');
  };

  const verifyOtp = () => {
    if (otp !== simulatedOtp) {
      setAlert('That OTP is incorrect. Please try again.');
      return;
    }
    setAlert('');
    setForgotStep('password');
  };

  const saveNewPassword = () => {
    if (newPassword.length < 6) {
      setAlert('Your new password must be at least 6 characters.');
      return;
    }
    onResetPassword(forgotEmail, newPassword);
    setForgotStep(null);
    setMode('signin');
    setEmail(forgotEmail);
    setPassword('');
    setAlert('Password updated. Please sign in with your new password.');
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#123b2b] text-[#fffaf0]">
      <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen" style={{ backgroundImage: `url(${authBackground})` }} />
      <div className="absolute inset-0 bg-[#123b2b]/85" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#eeb02f]/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8">
        <div className="flex items-center gap-3 page-in">
          <Logo small />
          <div>
            <p className="text-[11px] uppercase tracking-[.28em] text-[#eeb02f]">Sri Ramakrishna</p>
            <p className="font-semibold">Engineering College</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center page-in">
          <p className="mb-3 flex items-center gap-2 text-sm text-[#cbdace]">
            <span className="h-2 w-2 rounded-full bg-[#eeb02f]" /> Main FC · Open for pickup
          </p>
          <h1 className="text-5xl font-semibold leading-[.95] tracking-[-.055em]">
            Good food.
            <br />
            <span className="text-[#eeb02f]">No queue.</span>
          </h1>
          <p className="mt-5 max-w-xs text-[15px] leading-6 text-[#d7e0d7]">
            Pre-order your campus favourites and collect them warm between classes.
          </p>
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[.08] p-2 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/10 p-1">
              <button
                data-testid="button-sign-in-mode"
                onClick={() => switchMode('signin')}
                className={`rounded-xl py-3 text-sm font-semibold ${mode === 'signin' ? 'bg-[#fffaf0] text-[#123b2b]' : 'text-white/60'}`}
              >
                Sign in
              </button>
              <button
                data-testid="button-sign-up-mode"
                onClick={() => switchMode('signup')}
                className={`rounded-xl py-3 text-sm font-semibold ${mode === 'signup' ? 'bg-[#fffaf0] text-[#123b2b]' : 'text-white/60'}`}
              >
                Create account
              </button>
            </div>
            <form onSubmit={(event) => handleSubmit(event)} className="space-y-3 p-4">
              {alert && <InlineAlert message={alert} />}
              {mode === 'signup' && (
                <input
                  data-testid="input-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#eeb02f]"
                />
              )}
              <input
                data-testid="input-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@gmail.com"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#eeb02f]"
              />
              <input
                data-testid="input-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#eeb02f]"
              />
              <button
                data-testid={mode === 'signup' ? 'button-create-account' : 'button-sign-in'}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#123b2b]"
              >
                {mode === 'signup' ? 'Create account' : 'Sign in'} <ChevronRight size={17} />
              </button>
              {mode === 'signin' && (
                <button
                  data-testid="button-forgot-password"
                  type="button"
                  onClick={startForgotPassword}
                  className="mx-auto block text-xs font-semibold text-[#eeb02f] underline-offset-4 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
              {mode === 'signup' && (
                <p className="text-center text-xs text-white/45">Use your Gmail address to create a campus account.</p>
              )}
            </form>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/45">
          <span>SREC FC · Est. for campus life</span>
          <span>v1.1</span>
        </div>
      </div>

      {forgotStep && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10291c]/65 p-3 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-md rounded-3xl bg-[#fffdf8] p-5 text-[#173d2d] shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">Account recovery</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {forgotStep === 'email' ? 'Find your account' : forgotStep === 'otp' ? 'Verify your OTP' : 'Set new password'}
                </h2>
              </div>
              <button data-testid="button-close-forgot" onClick={() => setForgotStep(null)} className="rounded-full bg-[#f0eee7] p-2">
                <X size={17} />
              </button>
            </div>
            {alert && <div className="mt-4"><InlineAlert message={alert} /></div>}
            {forgotStep === 'email' && (
              <div className="mt-5 space-y-3">
                <p className="text-sm leading-5 text-[#6f796f]">Enter the Gmail address linked to your SREC FC account.</p>
                <input data-testid="input-forgot-email" value={forgotEmail} onChange={(event) => setForgotEmail(event.target.value)} placeholder="name@gmail.com" type="email" required className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 outline-none focus:border-[#2d6a4f]" />
                <button data-testid="button-send-otp" onClick={submitForgotEmail} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white">Send simulated OTP <ChevronRight size={17} /></button>
              </div>
            )}
            {forgotStep === 'otp' && (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#edf4eb] p-4 text-sm leading-5 text-[#2d6a4f]">A simulated 4-digit OTP was sent to <strong>{forgotEmail}</strong>. For this demo, use <strong>4821</strong>.</div>
                <input data-testid="input-otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Enter 4-digit OTP" inputMode="numeric" maxLength={4} className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 text-center text-lg tracking-[.45em] outline-none focus:border-[#2d6a4f]" />
                <button data-testid="button-verify-otp" onClick={verifyOtp} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white">Verify OTP <Check size={17} /></button>
              </div>
            )}
            {forgotStep === 'password' && (
              <div className="mt-5 space-y-3">
                <p className="text-sm leading-5 text-[#6f796f]">Choose a new password for your account.</p>
                <input data-testid="input-new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" type="password" autoComplete="new-password" required className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 outline-none focus:border-[#2d6a4f]" />
                <button data-testid="button-save-new-password" onClick={saveNewPassword} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white">Save new password <Check size={17} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function BottomNav({ path, cartCount, go }: { path: string; cartCount: number; go: (path: string) => void }) {
  const links = [
    { id: '/', label: 'Home', icon: HomeIcon },
    { id: '/orders', label: 'Orders', icon: History },
    { id: '/cart', label: 'Cart', icon: ShoppingCart },
    { id: '/profile', label: 'Profile', icon: UserRound },
  ];
  return (
    <nav className="fixed bottom-3 left-1/2 z-30 flex w-[calc(100%-24px)] max-w-2xl -translate-x-1/2 justify-around rounded-2xl border border-white/30 bg-white/70 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 text-emerald-950 shadow-lg backdrop-blur-md md:bottom-5 md:w-[calc(100%-40px)] md:pb-2">
      {links.map(({ id, label, icon: Icon }) => {
        const active = path === id;
        return (
          <button
            data-testid={`nav-${label.toLowerCase()}`}
            key={id}
            onClick={() => go(id)}
            className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all ${active ? 'bg-[#1b4332] text-[#fffaf0] shadow-sm' : 'text-emerald-950/55 hover:bg-white/50'}`}
          >
            <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
            {label}
            {id === '/cart' && cartCount > 0 && <span data-testid="badge-cart-count" className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d94437] px-1 text-[9px] text-white">{cartCount}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function Header({ profile, go }: { profile: Profile; go: (path: string) => void }) {
  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <Logo small />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#6c756b]">SREC Main FC</p>
          <h2 className="text-lg font-bold tracking-tight text-[#173d2d]">Good afternoon, {profile.name.split(' ')[0]}</h2>
        </div>
      </div>
      <button data-testid="button-open-profile" onClick={() => go('/profile')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd8ca] bg-white text-[#1b4332]">
        <CircleUserRound size={20} />
      </button>
    </header>
  );
}

function Home({ store, setStore, go }: { store: Store; setStore: (store: Store) => void; go: (path: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const items = useMemo(
    () => store.menu.filter((item) => (category === 'All' || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase())),
    [store.menu, category, query],
  );
  const add = (item: MenuItem) => {
    const existing = store.cart.find((line) => line.itemId === item.id);
    setStore({ ...store, cart: [...store.cart.filter((line) => line.itemId !== item.id), { itemId: item.id, qty: (existing?.qty || 0) + 1 }] });
  };

  return (
    <div className="page-in">
      <Header profile={store.profile} go={go} />
      <section className="relative overflow-hidden rounded-[26px] bg-[#1b4332] p-5 text-[#fffaf0] shadow-[0_16px_28px_rgba(27,67,50,.18)]">
        <div className="absolute -right-5 -top-8 text-[#eeb02f]/20"><Leaf size={150} strokeWidth={.7} /></div>
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#eeb02f]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#eeb02f]" /> LIVE STOCK SYNC ACTIVE</div>
          <h3 className="mt-7 max-w-[230px] text-3xl font-semibold leading-[1.05] tracking-[-.04em]">Pick up before your next class.</h3>
          <p className="mt-3 max-w-[230px] text-sm leading-5 text-[#d4e1d5]">Order now. We’ll have it ready at the FC counter.</p>
        </div>
      </section>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#ded9cc] bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-[#8a9087]" />
        <input data-testid="input-menu-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search biriyani, coffee, puffs…" className="w-full bg-transparent text-sm outline-none placeholder:text-[#9a9e97]" />
        {query && <button data-testid="button-clear-search" onClick={() => setQuery('')}><X size={16} className="text-[#8a9087]" /></button>}
      </div>
      <div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((cat) => (
          <button data-testid={`filter-${cat.toLowerCase().replaceAll(' ', '-')}`} key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${category === cat ? 'bg-[#1b4332] text-[#fffaf0]' : 'border border-[#ddd8ca] bg-[#fffdf8] text-[#626b62]'}`}>{cat}</button>
        ))}
      </div>
      <div className="mt-7 flex items-end justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#8b9188]">Today at the counter</p><h3 className="mt-1 text-2xl font-bold tracking-tight text-[#173d2d]">What’s calling?</h3></div>
        <span data-testid="text-menu-count" className="rounded-full bg-[#e6efe6] px-3 py-1 text-xs font-bold text-[#2d6a4f]">{items.length} items</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 pb-3">
        {items.map((item, index) => <FoodCard key={item.id} item={item} index={index} onAdd={() => add(item)} />)}
      </div>
      {items.length === 0 && <div className="my-8 rounded-3xl border border-dashed border-[#cfc9bb] bg-white/60 p-10 text-center"><Search size={28} className="mx-auto text-[#7d897f]" /><h4 className="mt-4 font-bold text-[#1b4332]">No Food Items Found</h4><p className="mt-1 text-sm text-[#7d897f]">Try searching for Coffee, Biriyani, or Puffs.</p><button data-testid="button-reset-filters" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-5 rounded-xl bg-[#1b4332] px-4 py-2.5 text-sm font-semibold text-white">Reset Filters</button></div>}
    </div>
  );
}

function FoodCard({ item, index, onAdd }: { item: MenuItem; index: number; onAdd: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const image = item.name === 'Banana'
    ? foodImages[item.category === 'Milkshakes' ? 'Banana Shake' : 'Banana Juice']
    : foodImages[item.name];
  return (
    <article data-testid={`card-food-${item.id}`} className={`group relative overflow-hidden rounded-2xl border border-[#e1dcd0] bg-white shadow-[0_5px_12px_rgba(44,57,45,.04)] transition-all ${!item.stock ? 'opacity-65 grayscale-[.65]' : 'hover:-translate-y-0.5'}`}>
      <div className="relative h-28 overflow-hidden rounded-t-2xl bg-[#e8eee5]">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#e5ede4] via-[#f7f4ea] to-[#e5ede4]" />}
        <img src={image} alt={item.name} loading="lazy" onLoad={() => setLoaded(true)} className={`h-full w-full object-cover transition duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
        {!item.stock && <span className="absolute left-2 top-2 rounded-full bg-[#d94437] px-2 py-1 text-[9px] font-bold text-white">SOLD OUT</span>}
        {item.stock && <span className="absolute left-2 top-2 rounded-full bg-[#e8f4e8]/90 px-2 py-1 text-[9px] font-bold text-[#267148] backdrop-blur-sm">IN STOCK</span>}
      </div>
      <div className="p-3">
        <h4 data-testid={`text-food-name-${item.id}`} className="truncate text-sm font-bold text-[#1d3d2e]">{item.name}</h4>
        <p className="mt-1 text-[11px] text-[#899088]">{item.category}</p>
        <div className="mt-3 flex items-center justify-between">
          <span data-testid={`text-food-price-${item.id}`} className="font-mono text-sm font-bold text-[#1b4332]">{money(item.price)}</span>
          <button data-testid={`button-add-${item.id}`} disabled={!item.stock} onClick={onAdd} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${item.stock ? 'bg-[#eeb02f] text-[#173d2d]' : 'cursor-not-allowed bg-[#e7e6df] text-[#a1a49e]'}`}>{item.stock ? '+ Add' : 'Unavailable'}</button>
        </div>
      </div>
    </article>
  );
}

function EmptyCart({ go }: { go: (path: string) => void }) {
  return <div className="flex min-h-[58vh] flex-col items-center justify-center text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8efe7] text-[#2d6a4f]"><ShoppingCart size={31} strokeWidth={1.5} /></div><h2 className="mt-5 text-2xl font-bold text-[#173d2d]">Your tray is empty</h2><p className="mt-2 max-w-[250px] text-sm leading-5 text-[#7d877d]">The best lunch break starts with one good decision.</p><button data-testid="button-browse-menu" onClick={() => go('/')} className="mt-6 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-bold text-white">Browse the menu</button></div>;
}

function Bill({ store, setStore, go }: { store: Store; setStore: (store: Store) => void; go: (path: string) => void }) {
  const lines = store.cart.map((line) => ({ ...line, item: store.menu.find((item) => item.id === line.itemId)! })).filter((line) => line.item);
  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const gst = subtotal * .05;
  const adjust = (id: string, amount: number) => setStore({ ...store, cart: store.cart.map((line) => line.itemId === id ? { ...line, qty: line.qty + amount } : line).filter((line) => line.qty > 0) });
  return <div className="page-in pb-4"><div className="flex items-center gap-3 py-5"><button data-testid="button-back-menu" onClick={() => go('/')} className="rounded-full border border-[#ddd8ca] bg-white p-2"><ArrowLeft size={18} /></button><div><p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">Ready when you are</p><h1 className="text-2xl font-bold text-[#173d2d]">Your order</h1></div></div><div className="rounded-3xl border border-[#e0dbcf] bg-white p-4 shadow-sm"><div className="flex items-center justify-between border-b border-dashed border-[#d8d2c4] pb-4"><div><p className="font-bold text-[#1b4332]">SREC FC counter</p><p className="mt-1 flex items-center gap-1 text-xs text-[#7f887f]"><Clock3 size={13} /> pickup in approx. 10–15 min</p></div><span className="rounded-full bg-[#e8efe7] px-2.5 py-1 text-[10px] font-bold text-[#2d6a4f]">PRE-ORDER</span></div><div className="divide-y divide-[#f0ece4]">{lines.map(({ item, qty }) => <div data-testid={`row-cart-${item.id}`} key={item.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="truncate text-sm font-bold text-[#233d30]">{item.name}</p><p className="mt-1 text-xs text-[#899088]">{money(item.price)} each</p></div><div className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-xl bg-[#f1f4ee] p-1"><button data-testid={`button-minus-${item.id}`} onClick={() => adjust(item.id, -1)} className="rounded-lg p-1 text-[#1b4332]"><Minus size={14} /></button><span data-testid={`text-quantity-${item.id}`} className="w-4 text-center text-sm font-bold">{qty}</span><button data-testid={`button-plus-${item.id}`} onClick={() => adjust(item.id, 1)} className="rounded-lg p-1 text-[#1b4332]"><Plus size={14} /></button></div><span className="w-16 text-right font-mono text-sm font-bold text-[#1b4332]">{money(item.price * qty)}</span></div></div>)}</div></div><div className="mt-5 rounded-3xl bg-[#1b4332] p-5 text-[#fffaf0]"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b5c9b6]">Payment summary</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between text-[#cddacc]"><span>Subtotal</span><span className="mono">{money(subtotal)}</span></div><div className="flex justify-between text-[#cddacc]"><span>GST (5%)</span><span className="mono">{money(gst)}</span></div><div className="mt-3 flex justify-between border-t border-white/15 pt-4 text-lg font-bold"><span>Total to pay</span><span className="mono text-[#eeb02f]">{money(subtotal + gst)}</span></div></div><button data-testid="button-proceed-payment" onClick={() => go('/payment')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d]">Proceed to payment <ChevronRight size={17} /></button></div></div>;
}

const paymentApps = [
  { name: 'Google Pay', logo: 'https://cdn.simpleicons.org/googlepay/5F6368' },
  { name: 'PhonePe', logo: 'https://cdn.simpleicons.org/phonepe/5F259F' },
  { name: 'Paytm', logo: 'https://cdn.simpleicons.org/paytm/00BAF2' },
];

function Payment({ store, onPaid, go }: { store: Store; onPaid: (receipt: Receipt) => void; go: (path: string) => void }) {
  const [app, setApp] = useState('Google Pay');
  const [processing, setProcessing] = useState(false);
  const lines = store.cart.map((line) => ({ ...line, item: store.menu.find((item) => item.id === line.itemId)! })).filter((line) => line.item);
  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const gst = subtotal * .05;
  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const stamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      onPaid({ id: `FC${stamp}`, date: now.toLocaleDateString('en-GB').replaceAll('/', '-'), time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), transaction: Math.random().toString(16).slice(2, 14), payment: app, items: store.cart, subtotal, gst, total: subtotal + gst });
    }, 1500);
  };
  if (processing) return <div className="flex min-h-[75vh] flex-col items-center justify-center text-center page-in"><div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#e8efe7] text-[#1b4332]"><div className="absolute inset-0 animate-ping rounded-full border border-[#2d6a4f]/30" /><CreditCard size={34} /></div><h2 className="mt-8 text-2xl font-bold text-[#173d2d]">Confirming your payment</h2><p className="mt-2 text-sm text-[#7d877d]">Keep this screen open for a moment.</p><div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-[#dfe9df]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#eeb02f]" /></div></div>;
  return <div className="page-in"><div className="flex items-center gap-3 py-5"><button data-testid="button-back-cart" onClick={() => go('/cart')} className="rounded-full border border-[#ddd8ca] bg-white p-2"><ArrowLeft size={18} /></button><div><p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">One last step</p><h1 className="text-2xl font-bold text-[#173d2d]">Pay & pick up</h1></div></div><div className="rounded-3xl bg-[#1b4332] p-6 text-[#fffaf0]"><p className="text-sm text-[#cddacc]">Amount payable</p><p data-testid="text-payment-total" className="mt-2 font-mono text-4xl font-bold text-[#eeb02f]">{money(subtotal + gst)}</p><p className="mt-2 flex items-center gap-1 text-xs text-[#b5c9b6]"><Zap size={13} /> Secure simulated UPI checkout</p></div><h3 className="mt-8 text-lg font-bold text-[#173d2d]">Choose your UPI app</h3><div className="mt-3 space-y-3">{paymentApps.map(({ name, logo: appLogo }) => <button data-testid={`button-upi-${name.toLowerCase().replaceAll(' ', '-')}`} key={name} onClick={() => setApp(name)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${app === name ? 'border-[#1b4332] bg-[#edf4eb] shadow-sm' : 'border-[#ddd8ca] bg-white'}`}><div className="flex items-center gap-3"><span className="flex h-10 w-12 items-center justify-center rounded-xl bg-white p-2 shadow-sm"><img src={appLogo} alt={`${name} logo`} className="max-h-7 max-w-10 object-contain" /></span><span className="font-semibold text-[#294335]">{name}</span></div>{app === name && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b4332] text-white"><Check size={14} /></span>}</button>)}</div><button data-testid="button-pay-now" onClick={pay} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-4 font-bold text-[#173d2d]">Pay {money(subtotal + gst)} securely <ChevronRight size={18} /></button><p className="mt-4 text-center text-[11px] text-[#8b9188]">Your receipt will be ready instantly after payment.</p></div>;
}

function Barcode({ value }: { value: string }) {
  const bars = value.split('').flatMap((char) => {
    const n = char.charCodeAt(0);
    return [1 + n % 3, 1 + (n >> 2) % 3, 1 + (n >> 4) % 2, 1 + (n >> 1) % 3];
  });
  return <div className="mx-auto mt-4 max-w-[240px]"><div data-testid="barcode-receipt" className="flex h-14 items-stretch justify-center gap-[2px] overflow-hidden bg-white">{bars.map((width, index) => <span key={index} className="bg-[#19231e]" style={{ width: `${width}px` }} />)}</div><p className="mt-2 text-center text-xs tracking-[.18em]">{value}</p></div>;
}

function ReceiptView({ receipt, store, go }: { receipt: Receipt; store: Store; go: (path: string) => void }) {
  const lines = receipt.items.map((line) => ({ ...line, item: store.menu.find((item) => item.id === line.itemId)! })).filter((line) => line.item);
  return <div className="page-in pb-6"><div className="flex items-center justify-between py-5"><button data-testid="button-back-receipt" onClick={() => go('/orders')} className="rounded-full border border-[#ddd8ca] bg-white p-2"><ArrowLeft size={18} /></button><span data-testid="status-payment" className="flex items-center gap-1.5 rounded-full bg-[#d9f0df] px-3 py-1.5 text-[10px] font-bold text-[#267148]"><Check size={12} /> PAID & VERIFIED</span></div><div className="receipt-paper mono text-[#19231e]"><div className="receipt-inner"><div className="flex items-center gap-3 border-b border-[#19231e] pb-5"><img src={logo} alt="SREC FC crest" className="h-16 w-16 object-cover" /><div><h1 className="text-2xl font-bold tracking-[.08em]">SREC FC</h1><p className="text-sm font-bold tracking-[.22em]">FOOD COURT</p><p className="mt-1 text-[9px] tracking-[.12em]">GOOD FOOD · GREAT VIBES</p></div></div><div className="grid grid-cols-2 border-b border-[#19231e] py-4 text-[10px] leading-5"><div className="border-r border-[#19231e] pr-2"><p>College&nbsp; : SREC</p><p>Location : Food Court</p><p>Date&nbsp;&nbsp;&nbsp; : {receipt.date}</p><p>Time&nbsp;&nbsp;&nbsp; : {receipt.time}</p></div><div className="pl-3"><p>Receipt No : {receipt.id}</p><p>Payment&nbsp;&nbsp; : UPI</p><p>App&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : {receipt.payment}</p><p>Txn ID&nbsp;&nbsp;&nbsp; : {receipt.transaction}</p></div></div><div className="border-b border-[#19231e] py-4 text-[11px]"><div className="grid grid-cols-[22px_1fr_28px_64px] border-b border-[#19231e] pb-2 font-bold"><span>No.</span><span>ITEM</span><span className="text-center">QTY</span><span className="text-right">PRICE</span></div>{lines.map(({ item, qty }, index) => <div data-testid={`receipt-row-${item.id}`} key={item.id} className="grid grid-cols-[22px_1fr_28px_64px] py-1.5"><span>{index + 1}</span><span className="truncate pr-1">{item.name}</span><span className="text-center">{qty}</span><span className="text-right">{(item.price * qty).toFixed(2)}</span></div>)}</div><div className="ml-auto w-[205px] border-b border-[#19231e] py-4 text-[11px] leading-6"><div className="flex justify-between"><span>Sub Total :</span><span>{receipt.subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span>GST (5%) :</span><span>{receipt.gst.toFixed(2)}</span></div><div className="flex justify-between text-base font-bold"><span>Total&nbsp;&nbsp;&nbsp;&nbsp; :</span><span>{receipt.total.toFixed(2)}</span></div></div><div className="pt-5 text-center text-[11px]"><p>— Thank you for dining with us! —</p><p className="mt-2 font-bold tracking-[.18em]">SREC FC</p><p className="text-[9px]">Good Food · Great Vibes</p><Barcode value={receipt.id} /><div className="mt-5 flex items-center justify-center gap-2 text-[10px]"><span className="h-px w-16 bg-[#19231e]" /><Leaf size={16} /><span className="h-px w-16 bg-[#19231e]" /></div><p className="mt-2 text-[10px] tracking-[.3em]">EAT · RELAX · REPEAT</p></div></div></div><button data-testid="button-done-receipt" onClick={() => go('/')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white">Back to menu <HomeIcon size={17} /></button></div>;
}

function Orders({ store, go }: { store: Store; go: (path: string) => void }) {
  return <div className="page-in"><div className="py-5"><p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">Your campus trail</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173d2d]">Orders</h1></div>{store.orders.length === 0 ? <div className="flex min-h-[56vh] flex-col items-center justify-center text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8efe7] text-[#2d6a4f]"><ReceiptText size={31} strokeWidth={1.5} /></div><h2 className="mt-5 text-xl font-bold text-[#173d2d]">No receipts yet</h2><p className="mt-2 max-w-[245px] text-sm text-[#7d877d]">Your next quick bite will show up here.</p><button data-testid="button-start-order" onClick={() => go('/')} className="mt-5 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-bold text-white">Start an order</button></div> : <div className="space-y-3">{store.orders.map((receipt) => <button data-testid={`button-order-${receipt.id}`} key={receipt.id} onClick={() => go(`/receipt/${receipt.id}`)} className="flex w-full items-center justify-between rounded-2xl border border-[#ded9cc] bg-white p-4 text-left shadow-sm"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8efe7] text-[#2d6a4f]"><ReceiptText size={20} /></div><div><p className="font-mono text-sm font-bold text-[#1b4332]">{receipt.id}</p><p className="mt-1 text-xs text-[#899088]">{receipt.date} · {receipt.payment}</p></div></div><div className="text-right"><p className="font-mono text-sm font-bold text-[#1b4332]">{money(receipt.total)}</p><span className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-[#2d6a4f]">PAID <ChevronRight size={13} /></span></div></button>)}</div>}</div>;
}

function Profile({ store, setStore, go, logout }: { store: Store; setStore: (store: Store) => void; go: (path: string) => void; logout: () => void }) {
  const initials = store.profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <div className="page-in"><div className="py-5"><p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">Your SREC FC account</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173d2d]">Profile</h1></div><section className="relative overflow-hidden rounded-3xl bg-[#1b4332] p-5 text-white"><div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[18px] border-[#eeb02f]/20" /><div className="relative flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeb02f] text-2xl font-bold text-[#1b4332]">{initials}</div><div className="min-w-0"><h2 data-testid="text-profile-name" className="truncate text-xl font-bold">{store.profile.name}</h2><p data-testid="text-profile-email" className="mt-1 truncate text-sm text-[#cddacc]">{store.profile.email}</p></div></div><div className="relative mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-[#cddacc]"><PackageCheck size={15} /> {store.orders.length} completed {store.orders.length === 1 ? 'order' : 'orders'} · pickup regular</div></section><div className="mt-5 overflow-hidden rounded-3xl border border-[#ded9cc] bg-white"><button data-testid="button-reminder-toggle" onClick={() => setStore({ ...store, profile: { ...store.profile, reminders: !store.profile.reminders } })} className="flex w-full items-center justify-between p-4 text-left"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#fff1c8] p-2.5 text-[#88651c]"><Bell size={18} /></div><div><p className="text-sm font-bold text-[#294335]">Daily lunch reminder</p><p className="mt-1 text-xs text-[#899088]">Nudge me at 12:00 PM</p></div></div><span className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${store.profile.reminders ? 'bg-[#2d6a4f]' : 'bg-[#d9ddd4]'}`}><span className={`h-4 w-4 rounded-full bg-white transition-transform ${store.profile.reminders ? 'translate-x-5' : ''}`} /></span></button></div><div className="mt-5 space-y-2"><button data-testid="button-order-history" onClick={() => go('/orders')} className="flex w-full items-center justify-between rounded-2xl border border-[#ded9cc] bg-white p-4 text-sm font-bold text-[#294335]"><span className="flex items-center gap-3"><History size={18} className="text-[#2d6a4f]" /> Order history</span><ChevronRight size={17} className="text-[#929a91]" /></button><button data-testid="button-logout" onClick={logout} className="flex w-full items-center justify-between rounded-2xl border border-[#f0d7d1] bg-[#fff9f7] p-4 text-sm font-bold text-[#b13e32]"><span className="flex items-center gap-3"><LogOut size={18} /> Sign out</span><ChevronRight size={17} /></button></div></div>;
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const [store, setStoreState] = useState<Store>(getStore);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  useEffect(() => { saveStore(store); }, [store]);
  const setStore = (next: Store) => setStoreState(next);
  const go = (path: string) => setLocation(path);
  const enterAccount = (account: Account) => setStore({ ...store, signedIn: true, activeEmail: account.email, profile: { ...store.profile, name: account.username, email: account.email } });
  const registerAccount = (account: Account) => setStore({ ...store, accounts: [...store.accounts, account], signedIn: true, activeEmail: account.email, profile: { ...store.profile, name: account.username, email: account.email } });
  const resetPassword = (email: string, password: string) => setStore({ ...store, accounts: store.accounts.map((account) => account.email === email ? { ...account, password } : account) });
  if (!store.signedIn) return <Auth accounts={store.accounts} onEnter={enterAccount} onRegister={registerAccount} onResetPassword={resetPassword} />;
  const receiptId = location.split('/receipt/')[1];
  const shownReceipt = receipt || store.orders.find((order) => order.id === receiptId);
  const logout = () => { setStore({ ...store, signedIn: false, activeEmail: '', profile: { name: '', email: '', reminders: false }, cart: [] }); go('/'); };
  const path = location.startsWith('/receipt/') ? '/orders' : location;
  return <div className="grain app-shell min-h-[100dvh]"><div className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-24 md:px-6">{shownReceipt && location.startsWith('/receipt/') ? <ReceiptView receipt={shownReceipt} store={store} go={go} /> : path === '/cart' ? <>{store.cart.length ? <Bill store={store} setStore={setStore} go={go} /> : <EmptyCart go={go} />}</> : path === '/payment' ? <Payment store={store} onPaid={(newReceipt) => { setStore({ ...store, cart: [], orders: [newReceipt, ...store.orders] }); setReceipt(newReceipt); go(`/receipt/${newReceipt.id}`); }} go={go} /> : path === '/orders' ? <Orders store={store} go={go} /> : path === '/profile' ? <Profile store={store} setStore={setStore} go={go} logout={logout} /> : <Home store={store} setStore={setStore} go={go} />}<BottomNav path={path} cartCount={store.cart.reduce((count, line) => count + line.qty, 0)} go={go} /></div></div>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={location.pathname}><AppContent /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;