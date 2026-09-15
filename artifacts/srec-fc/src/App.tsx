import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { WalletProvider, useWallet } from "@/context/WalletContext";
import { WalletTopUpModal } from "@/components/WalletTopUpModal";
import { FrequentlyPairedTogether } from "@/components/FrequentlyPairedTogether";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  CreditCard,
  Edit3,
  History,
  Home as HomeIcon,
  Leaf,
  LogOut,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  ShieldCheck,
  LifeBuoy,
  Search,
  ShoppingCart,
  UserRound,
  Wallet,
  X,
  Zap,
  Trash2,
} from "lucide-react";
import { Router as WouterRouter, useLocation } from "wouter";
import logo from "./assets/srec-fc-logo.png";

type Category =
  | "Puffs & Bakery"
  | "Breakfast"
  | "Lunch"
  | "Indochines"
  | "Chats"
  | "Snacks"
  | "Hot Drinks"
  | "Milkshakes"
  | "Fresh Juice & Mojito";
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: Category;
  stock: boolean;
  image?: string;
};
type CartLine = { itemId: string; qty: number };
type Role = "ADMIN" | "STUDENT";
type Account = {
  username: string;
  email: string;
  password: string;
  role: Role;
};
type Profile = { name: string; email: string; reminders: boolean; role: Role };
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
  ["Veg Puff", 15, "Puffs & Bakery"],
  ["Egg Puff", 20, "Puffs & Bakery"],
  ["Mushroom Puff", 30, "Puffs & Bakery"],
  ["Chicken Puff", 30, "Puffs & Bakery"],
  ["Coconut Bun", 15, "Puffs & Bakery"],
  ["Honey Cake", 30, "Puffs & Bakery"],
  ["Apple Cake", 20, "Puffs & Bakery"],
  ["Tea Cake", 20, "Puffs & Bakery"],
  ["Choco Lava", 50, "Puffs & Bakery"],
  ["Pongal", 30, "Breakfast"],
  ["Poori", 30, "Breakfast"],
  ["Idly", 30, "Breakfast"],
  ["Dosa", 30, "Breakfast"],
  ["Roast", 30, "Breakfast"],
  ["Parotta", 30, "Lunch"],
  ["Chappathi", 30, "Lunch"],
  ["Variety Rice", 30, "Lunch"],
  ["Meals", 60, "Lunch"],
  ["Kothu Parotta", 50, "Lunch"],
  ["Veg Noodles", 50, "Indochines"],
  ["Egg Noodles", 60, "Indochines"],
  ["Chicken Noodles", 70, "Indochines"],
  ["Veg Rice", 50, "Indochines"],
  ["Egg Rice", 60, "Indochines"],
  ["Chicken Rice", 70, "Indochines"],
  ["Chicken Biriyani", 70, "Indochines"],
  ["Egg Biriyani", 55, "Indochines"],
  ["Bhel Poori", 25, "Chats"],
  ["Masala Poori", 25, "Chats"],
  ["Mushroom Chat", 25, "Chats"],
  ["Pani Poori", 25, "Chats"],
  ["Thattu Vada Set", 30, "Chats"],
  ["Vada", 14, "Snacks"],
  ["Bajji", 14, "Snacks"],
  ["Bonda", 14, "Snacks"],
  ["Tea", 10, "Hot Drinks"],
  ["Coffee", 15, "Hot Drinks"],
  ["Lemon Tea", 12, "Hot Drinks"],
  ["Milk", 15, "Hot Drinks"],
  ["Boost/Horlicks", 18, "Hot Drinks"],
  ["Vanilla", 60, "Milkshakes"],
  ["Oreo", 65, "Milkshakes"],
  ["Banana", 60, "Milkshakes"],
  ["Strawberry", 60, "Milkshakes"],
  ["Red Velvet", 80, "Milkshakes"],
  ["Brownie", 80, "Milkshakes"],
  ["Pomegranate", 50, "Fresh Juice & Mojito"],
  ["Apple", 50, "Fresh Juice & Mojito"],
  ["Mosambi", 35, "Fresh Juice & Mojito"],
  ["Pineapple", 40, "Fresh Juice & Mojito"],
  ["Orange", 40, "Fresh Juice & Mojito"],
  ["Grapes", 35, "Fresh Juice & Mojito"],
  ["Muskmelon", 40, "Fresh Juice & Mojito"],
  ["Watermelon", 25, "Fresh Juice & Mojito"],
  ["Banana", 25, "Fresh Juice & Mojito"],
  ["Pappaya", 25, "Fresh Juice & Mojito"],
  ["Lemon", 15, "Fresh Juice & Mojito"],
  ["Lime Mojito", 50, "Fresh Juice & Mojito"],
  ["Blue Monday", 50, "Fresh Juice & Mojito"],
].map(([name, price, category], index) => ({
  id: `${String(name)
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")}-${index}`,
  name: name as string,
  price: price as number,
  category: category as Category,
  stock: ![
    "Chicken Puff",
    "Red Velvet",
    "Blue Monday",
    "Chicken Biriyani",
  ].includes(name as string),
}));

const normalizeFoodName = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");
const localFoodImages = [
  { fileName: "APPLE_CAKE.png", aliases: ["Apple Cake"] },
  { fileName: "CHAPPATHI.png", aliases: ["Chappathi"] },
  { fileName: "CHICKEN_NOODLES.png", aliases: ["Chicken Noodles"] },
  { fileName: "CHICKEN_PUFF.png", aliases: ["Chicken Puff"] },
  { fileName: "COCUNUT_BUN.png", aliases: ["Coconut Bun", "Cocunut Bun"] },
  { fileName: "EGG_PUFF.png", aliases: ["Egg Puff"] },
  { fileName: "IDLI.png", aliases: ["Idly", "Idli"] },
  { fileName: "MUSHROOM_PUFF.png", aliases: ["Mushroom Puff"] },
  { fileName: "PAROTTA.png", aliases: ["Parotta"] },
  { fileName: "PONGAL.png", aliases: ["Pongal"] },
  { fileName: "POORI.png", aliases: ["Poori"] },
  { fileName: "VEG_NOODLES.png", aliases: ["Veg Noodles"] },
  { fileName: "VEG_PUFF.png", aliases: ["Veg Puff"] },
];

const remoteFoodImages: Record<string, string> = {
  Bonda:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  Bajji:
    "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=1200&q=88",
  Vada: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=88",
  "Bhel Poori":
    "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=88",
  "Masala Poori":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  "Mushroom Chat":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  "Pani Poori":
    "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=88",
  "Thattu Vada Set":
    "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=1200&q=88",
  "Choco Lava":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=88",
  "Honey Cake":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=88",
  "Tea Cake":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=88",
  Pongal:
    "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=1200&q=88",
  Dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=88",
  Roast:
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=88",
  Poori:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  Parotta:
    "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=88",
  "Variety Rice":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=88",
  Meals:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=88",
  "Kothu Parotta":
    "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=88",
  "Egg Noodles":
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=88",
  "Veg Rice":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=88",
  "Egg Rice":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=88",
  "Chicken Rice":
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=88",
  "Chicken Biriyani":
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=1200&q=88",
  "Egg Biriyani":
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=1200&q=88",
  Tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=88",
  Coffee:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=88",
  "Lemon Tea":
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=88",
  Milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=88",
  "Boost/Horlicks":
    "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=1200&q=88",
  Vanilla:
    "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=88",
  Oreo: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=88",
  Banana:
    "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=88",
  Strawberry:
    "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1200&q=88",
  "Red Velvet":
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=88",
  Brownie:
    "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1200&q=88",
};

const defaultFoodPlaceholder =
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82";

function getFoodImage(itemName: string) {
  const normalizedItemName = normalizeFoodName(itemName);
  const match = localFoodImages.find(({ fileName, aliases }) =>
    [fileName, ...aliases].some(
      (value) =>
        normalizeFoodName(value.replace(/\.[^.]+$/, "")) === normalizedItemName,
    ),
  );
  return match
    ? `/images/${match.fileName}`
    : (remoteFoodImages[itemName] ?? defaultFoodPlaceholder);
}

const beverageImages = [
  {
    names: ["Pomegranate"],
    url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Apple"],
    url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Mosambi", "Sweet Lime"],
    url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Pineapple"],
    url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Orange"],
    url: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Grapes"],
    url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Muskmelon"],
    url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Watermelon"],
    url: "https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Banana"],
    url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Pappaya", "Papaya"],
    url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Lemon", "Lemon Juice"],
    url: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Lime Mojito"],
    url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=720&q=85",
  },
  {
    names: ["Blue Monday"],
    url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=720&q=85",
  },
];

function getBeverageImage(itemName: string) {
  const normalizedItemName = normalizeFoodName(itemName);
  return (
    beverageImages.find(({ names }) =>
      names.some((name) => normalizeFoodName(name) === normalizedItemName),
    )?.url ??
    remoteFoodImages[itemName] ??
    defaultFoodPlaceholder
  );
}
const fallbackGradients = [
  ["#2f6f57", "#9cbe8d"],
  ["#b87942", "#f1d08a"],
  ["#805b9c", "#e4b6ce"],
  ["#2b6f88", "#8ed0cf"],
  ["#a44f3f", "#efb080"],
];
const feedCategoryOrder: Category[] = [
  "Puffs & Bakery",
  "Fresh Juice & Mojito",
  "Indochines",
  "Chats",
  "Breakfast",
  "Lunch",
  "Snacks",
  "Hot Drinks",
  "Milkshakes",
];

function diversifyMenu(items: MenuItem[]) {
  const buckets = new Map<Category, MenuItem[]>();
  feedCategoryOrder.forEach((category) =>
    buckets.set(
      category,
      items.filter((item) => item.category === category),
    ),
  );
  const result: MenuItem[] = [];
  let added = true;
  while (result.length < items.length && added) {
    added = false;
    feedCategoryOrder.forEach((category) => {
      const bucket = buckets.get(category);
      if (bucket?.length) {
        result.push(bucket.shift()!);
        added = true;
      }
    });
  }
  return result;
}

const categories = [
  "All",
  "Puffs & Bakery",
  "Breakfast",
  "Lunch",
  "Indochines",
  "Chats",
  "Snacks",
  "Hot Drinks",
  "Milkshakes",
  "Fresh Juice & Mojito",
];
const authBackground =
  "linear-gradient(135deg, #123b2b 0%, #1b5a3f 48%, #102c20 100%)";
const ADMIN_EMAIL = "fcsrec@gmail.com";
const ADMIN_PASSWORD = "1234567890";
const CATALOG_STORAGE_KEY = "srec_catalog_data";
const defaultStore: Store = {
  signedIn: false,
  activeEmail: "",
  accounts: [],
  profile: { name: "", email: "", reminders: false, role: "STUDENT" },
  cart: [],
  orders: [],
  menu: menuSeed,
};
const queryClient = new QueryClient();
const money = (value: number) => `₹${value.toFixed(2)}`;

const getCatalog = (): MenuItem[] => {
  try {
    const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!saved) return menuSeed;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : menuSeed;
  } catch {
    return menuSeed;
  }
};

const getStore = (): Store => {
  try {
    const saved = localStorage.getItem("srec-fc-store");
    if (!saved) return { ...defaultStore, menu: getCatalog() };
    const parsed = JSON.parse(saved) as Partial<Store>;
    const accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    return {
      ...defaultStore,
      ...parsed,
      accounts,
      signedIn: Boolean(
        parsed.signedIn && parsed.activeEmail && accounts.length,
      ),
      profile: {
        ...defaultStore.profile,
        ...(parsed.profile ?? {}),
        role: parsed.profile?.role === "ADMIN" ? "ADMIN" : "STUDENT",
      },
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      menu: getCatalog(),
    };
  } catch {
    return defaultStore;
  }
};
const saveStore = (store: Store) =>
  localStorage.setItem("srec-fc-store", JSON.stringify(store));
const saveCatalog = (menu: MenuItem[]) =>
  localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(menu));
const broadcastCatalogUpdate = () =>
  window.dispatchEvent(new Event("catalog-update"));

function Logo({ small = false }: { small?: boolean }) {
  return (
    <img
      data-testid="img-srec-logo"
      src={logo}
      alt="SREC FC crest"
      className={`${small ? "h-11 w-11" : "h-20 w-20"} rounded-2xl object-cover shadow-sm`}
    />
  );
}

function InlineAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-[#f2b8ab] bg-[#fff3f0] px-3 py-2.5 text-xs font-semibold leading-5 text-[#a33d30]"
    >
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");
  const [forgotStep, setForgotStep] = useState<
    "email" | "otp" | "password" | null
  >(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const simulatedOtp = "4821";

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setAlert("");
    setForgotStep(null);
  };

  const handleSubmit = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    setAlert("");
    const normalizedEmail = email.trim().toLowerCase();
    if (mode === "signup") {
      if (!username.trim() || !normalizedEmail || !password) {
        setAlert("Please complete your username, Gmail address, and password.");
        return;
      }
      if (!/^[^\s@]+@gmail\.com$/i.test(normalizedEmail)) {
        setAlert("Please use a valid Gmail address to create your account.");
        return;
      }
      if (accounts.some((account) => account.email === normalizedEmail)) {
        setAlert("Account already exists with this Email. Please Sign In.");
        return;
      }
      const account = {
        username: username.trim(),
        email: normalizedEmail,
        password,
        role: "STUDENT" as const,
      };
      onRegister(account);
      return;
    }

    const account = accounts.find(
      (candidate) =>
        candidate.email === normalizedEmail && candidate.password === password,
    );
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onEnter({
        username: "SREC FC Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "ADMIN",
      });
      return;
    }
    if (!account) {
      setAlert("Invalid email or password. Please try again.");
      return;
    }
    onEnter(account);
  };

  const startForgotPassword = () => {
    setAlert("");
    setForgotStep("email");
    setForgotEmail(email.trim().toLowerCase());
    setOtp("");
    setNewPassword("");
  };

  const submitForgotEmail = () => {
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!accounts.some((account) => account.email === normalizedEmail)) {
      setAlert("No account found with this Email. Please Sign Up.");
      return;
    }
    setAlert("");
    setForgotEmail(normalizedEmail);
    setForgotStep("otp");
  };

  const verifyOtp = () => {
    if (otp !== simulatedOtp) {
      setAlert("That OTP is incorrect. Please try again.");
      return;
    }
    setAlert("");
    setForgotStep("password");
  };

  const saveNewPassword = () => {
    if (newPassword.length < 6) {
      setAlert("Your new password must be at least 6 characters.");
      return;
    }
    onResetPassword(forgotEmail, newPassword);
    setForgotStep(null);
    setMode("signin");
    setEmail(forgotEmail);
    setPassword("");
    setAlert("Password updated. Please sign in with your new password.");
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#123b2b] text-[#fffaf0]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
        style={{ backgroundImage: authBackground }}
      />
      <div className="absolute inset-0 bg-[#123b2b]/85" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#eeb02f]/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8">
        <div className="flex items-center gap-3 page-in">
          <Logo small />
          <div>
            <p className="text-[11px] uppercase tracking-[.28em] text-[#eeb02f]">
              Sri Ramakrishna
            </p>
            <p className="font-semibold">Engineering College</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center page-in">
          <p className="mb-3 flex items-center gap-2 text-sm text-[#cbdace]">
            <span className="h-2 w-2 rounded-full bg-[#eeb02f]" /> Main FC ·
            Open for pickup
          </p>
          <h1 className="text-5xl font-semibold leading-[.95] tracking-[-.055em]">
            Good food.
            <br />
            <span className="text-[#eeb02f]">No queue.</span>
          </h1>
          <p className="mt-5 max-w-xs text-[15px] leading-6 text-[#d7e0d7]">
            Pre-order your campus favourites and collect them warm between
            classes.
          </p>
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[.08] p-2 backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/10 p-1">
              <button
                data-testid="button-sign-in-mode"
                onClick={() => switchMode("signin")}
                className={`rounded-xl py-3 text-sm font-semibold ${mode === "signin" ? "bg-[#fffaf0] text-[#123b2b]" : "text-white/60"}`}
              >
                Sign in
              </button>
              <button
                data-testid="button-sign-up-mode"
                onClick={() => switchMode("signup")}
                className={`rounded-xl py-3 text-sm font-semibold ${mode === "signup" ? "bg-[#fffaf0] text-[#123b2b]" : "text-white/60"}`}
              >
                Create account
              </button>
            </div>
            <form
              onSubmit={(event) => handleSubmit(event)}
              className="space-y-3 p-4"
            >
              {alert && <InlineAlert message={alert} />}
              {mode === "signup" && (
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
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                required
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#eeb02f]"
              />
              <button
                data-testid={
                  mode === "signup" ? "button-create-account" : "button-sign-in"
                }
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#123b2b]"
              >
                {mode === "signup" ? "Create account" : "Sign in"}{" "}
                <ChevronRight size={17} />
              </button>
              {mode === "signin" && (
                <button
                  data-testid="button-forgot-password"
                  type="button"
                  onClick={startForgotPassword}
                  className="mx-auto block text-xs font-semibold text-[#eeb02f] underline-offset-4 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
              {mode === "signup" && (
                <p className="text-center text-xs text-white/45">
                  Use your Gmail address to create a campus account.
                </p>
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
                <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
                  Account recovery
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {forgotStep === "email"
                    ? "Find your account"
                    : forgotStep === "otp"
                      ? "Verify your OTP"
                      : "Set new password"}
                </h2>
              </div>
              <button
                data-testid="button-close-forgot"
                onClick={() => setForgotStep(null)}
                className="rounded-full bg-[#f0eee7] p-2"
              >
                <X size={17} />
              </button>
            </div>
            {alert && (
              <div className="mt-4">
                <InlineAlert message={alert} />
              </div>
            )}
            {forgotStep === "email" && (
              <div className="mt-5 space-y-3">
                <p className="text-sm leading-5 text-[#6f796f]">
                  Enter the Gmail address linked to your SREC FC account.
                </p>
                <input
                  data-testid="input-forgot-email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="name@gmail.com"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 outline-none focus:border-[#2d6a4f]"
                />
                <button
                  data-testid="button-send-otp"
                  onClick={submitForgotEmail}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white"
                >
                  Send simulated OTP <ChevronRight size={17} />
                </button>
              </div>
            )}
            {forgotStep === "otp" && (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#edf4eb] p-4 text-sm leading-5 text-[#2d6a4f]">
                  A simulated 4-digit OTP was sent to{" "}
                  <strong>{forgotEmail}</strong>. For this demo, use{" "}
                  <strong>4821</strong>.
                </div>
                <input
                  data-testid="input-otp"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="Enter 4-digit OTP"
                  inputMode="numeric"
                  maxLength={4}
                  className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 text-center text-lg tracking-[.45em] outline-none focus:border-[#2d6a4f]"
                />
                <button
                  data-testid="button-verify-otp"
                  onClick={verifyOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white"
                >
                  Verify OTP <Check size={17} />
                </button>
              </div>
            )}
            {forgotStep === "password" && (
              <div className="mt-5 space-y-3">
                <p className="text-sm leading-5 text-[#6f796f]">
                  Choose a new password for your account.
                </p>
                <input
                  data-testid="input-new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 outline-none focus:border-[#2d6a4f]"
                />
                <button
                  data-testid="button-save-new-password"
                  onClick={saveNewPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white"
                >
                  Save new password <Check size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function BottomNav({
  path,
  cartCount,
  go,
}: {
  path: string;
  cartCount: number;
  go: (path: string) => void;
}) {
  const links = [
    { id: "/", label: "Home", icon: HomeIcon },
    { id: "/orders", label: "Orders", icon: History },
    { id: "/cart", label: "Cart", icon: ShoppingCart },
    { id: "/profile", label: "Profile", icon: UserRound },
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
            className={`relative flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all ${active ? "bg-[#1b4332] text-[#fffaf0] shadow-sm" : "text-emerald-950/55 hover:bg-white/50"}`}
          >
            <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
            {label}
            {id === "/cart" && cartCount > 0 && (
              <span
                data-testid="badge-cart-count"
                className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d94437] px-1 text-[9px] text-white"
              >
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function WalletDashboard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const { walletBalance, transactions } = useWallet();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-3">
      <section className="relative z-[101] mx-auto min-h-[calc(100dvh-24px)] max-w-lg rounded-3xl bg-[#071c12] p-5 text-white shadow-2xl sm:my-6 sm:min-h-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-[#9bc5a3]">
              SREC Wallet
            </p>
            <h2 className="mt-1 text-2xl font-bold">Your money, ready.</h2>
          </div>
          <button
            aria-label="Close wallet dashboard"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d2d1c] p-5">
          <p className="text-xs font-semibold tracking-[.2em] text-[#9bc5a3]">
            YOUR BALANCE
          </p>
          <p className="mt-2 font-mono text-4xl font-bold text-[#eeb02f]">
            ₹{walletBalance.toFixed(2)}
          </p>
          <button
            onClick={() => setTopUpOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d9b59] py-3.5 font-bold text-white"
          >
            <Plus size={18} /> Add Money
          </button>
        </div>
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Transactions</h3>
            <span className="text-xs text-[#9bc5a3]">Recent activity</span>
          </div>
          <div className="mt-3 space-y-2">
            {transactions.length ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-[11px] text-[#9bc5a3]">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${transaction.type === "TOPUP" ? "text-[#70d890]" : "text-[#ff9b8f]"}`}
                  >
                    {transaction.type === "TOPUP" ? "+" : "-"}₹
                    {transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm text-[#9bc5a3]">
                No transactions yet.
              </p>
            )}
          </div>
        </div>
      </section>
      <WalletTopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </div>
  );
}

function Header({
  profile,
  go,
  isAdmin = false,
}: {
  profile: Profile;
  go: (path: string) => void;
  isAdmin?: boolean;
}) {
  const [walletDashboardOpen, setWalletDashboardOpen] = useState(false);
  return (
    <>
      <header className="flex w-full items-center justify-between gap-2 py-5">
        <div className="flex-1 min-w-0 pr-2 flex items-center gap-3">
          <Logo small />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#6c756b]">
              SREC Main FC
            </p>
            <h2 className="truncate font-semibold text-slate-800">
              Good afternoon, {profile.name}
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <button
              data-testid="button-open-admin"
              onClick={() => go("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8dfd3] bg-white text-[#1b4332] sm:h-auto sm:w-auto sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px] sm:font-bold"
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">Admin Portal</span>
            </button>
          )}
          <button
            data-testid="button-open-wallet"
            onClick={() => setWalletDashboardOpen(true)}
            aria-label="Open SREC Wallet"
            className="rounded-full bg-emerald-50 p-2.5 text-emerald-800 hover:bg-emerald-100"
          >
            <Wallet className="h-5 w-5" />
          </button>
          <button
            data-testid="button-open-profile"
            onClick={() => go("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd8ca] bg-white text-[#1b4332]"
          >
            <CircleUserRound size={20} />
          </button>
        </div>
      </header>
      <WalletDashboard
        open={walletDashboardOpen}
        onClose={() => setWalletDashboardOpen(false)}
      />
    </>
  );
}

function Home({
  store,
  setStore,
  go,
  isAdmin = false,
  onToggleStock,
}: {
  store: Store;
  setStore: (store: Store) => void;
  go: (path: string) => void;
  isAdmin?: boolean;
  onToggleStock?: (itemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const diversifiedMenu = useMemo(
    () => diversifyMenu(store.menu),
    [store.menu],
  );
  const items = useMemo(
    () =>
      (category === "All" ? diversifiedMenu : store.menu).filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) &&
          (category === "All" || item.category === category),
      ),
    [store.menu, diversifiedMenu, category, query],
  );
  const add = (item: MenuItem) => {
    const existing = store.cart.find((line) => line.itemId === item.id);
    setStore({
      ...store,
      cart: [
        ...store.cart.filter((line) => line.itemId !== item.id),
        { itemId: item.id, qty: (existing?.qty || 0) + 1 },
      ],
    });
  };

  return (
    <div className="page-in">
      <Header profile={store.profile} go={go} isAdmin={isAdmin} />
      <section className="relative overflow-hidden rounded-[26px] bg-[#1b4332] p-5 text-[#fffaf0] shadow-[0_16px_28px_rgba(27,67,50,.18)]">
        <div className="absolute -right-5 -top-8 text-[#eeb02f]/20">
          <Leaf size={150} strokeWidth={0.7} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#eeb02f]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#eeb02f]" />{" "}
            LIVE STOCK SYNC ACTIVE
          </div>
          <h3 className="mt-7 max-w-[230px] text-3xl font-semibold leading-[1.05] tracking-[-.04em]">
            Pick up before your next class.
          </h3>
          <p className="mt-3 max-w-[230px] text-sm leading-5 text-[#d4e1d5]">
            Order now. We’ll have it ready at the FC counter.
          </p>
        </div>
      </section>
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#ded9cc] bg-white px-4 py-3 shadow-sm">
        <Search size={18} className="text-[#8a9087]" />
        <input
          data-testid="input-menu-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search biriyani, coffee, puffs…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[#9a9e97]"
        />
        {query && (
          <button
            data-testid="button-clear-search"
            onClick={() => setQuery("")}
          >
            <X size={16} className="text-[#8a9087]" />
          </button>
        )}
      </div>
      <div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
        {categories.map((cat) => (
          <button
            data-testid={`filter-${cat.toLowerCase().replaceAll(" ", "-")}`}
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${category === cat ? "bg-[#1b4332] text-[#fffaf0]" : "border border-[#ddd8ca] bg-[#fffdf8] text-[#626b62]"}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#8b9188]">
            Today at the counter
          </p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#173d2d]">
            What’s calling?
          </h3>
        </div>
        <span
          data-testid="text-menu-count"
          className="rounded-full bg-[#e6efe6] px-3 py-1 text-xs font-bold text-[#2d6a4f]"
        >
          {items.length} items
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 pb-3">
        {items.map((item, index) => (
          <FoodCard
            key={item.id}
            item={item}
            index={index}
            onAdd={() => add(item)}
            isAdmin={isAdmin}
            onToggleStock={onToggleStock}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="my-8 rounded-3xl border border-dashed border-[#cfc9bb] bg-white/60 p-10 text-center">
          <Search size={28} className="mx-auto text-[#7d897f]" />
          <h4 className="mt-4 font-bold text-[#1b4332]">No Food Items Found</h4>
          <p className="mt-1 text-sm text-[#7d897f]">
            Try searching for Coffee, Biriyani, or Puffs.
          </p>
          <button
            data-testid="button-reset-filters"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-5 rounded-xl bg-[#1b4332] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

function FoodCard({
  item,
  index,
  onAdd,
  isAdmin = false,
  onToggleStock,
}: {
  item: MenuItem;
  index: number;
  onAdd: () => void;
  isAdmin?: boolean;
  onToggleStock?: (itemId: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const isBeverage = item.category === "Fresh Juice & Mojito";
  const image =
    item.image ||
    (isBeverage ? getBeverageImage(item.name) : getFoodImage(item.name));
  const gradient =
    fallbackGradients[
      item.name
        .split("")
        .reduce((sum, character) => sum + character.charCodeAt(0), index) %
        fallbackGradients.length
    ];
  return (
    <article
      data-testid={`card-food-${item.id}`}
      className={`group relative overflow-hidden rounded-2xl border border-[#e1dcd0] bg-white shadow-[0_5px_12px_rgba(44,57,45,.04)] transition-all ${!item.stock ? "opacity-65 grayscale-[.65]" : "hover:-translate-y-0.5"}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-[#e8eee5]">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#e5ede4] via-[#f7f4ea] to-[#e5ede4]" />
        )}
        <img
          src={imageFailed ? defaultFoodPlaceholder : image}
          alt={item.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setImageFailed(true)}
          className={`h-full w-full object-cover object-center transition duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
        {!item.stock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#d94437] px-2 py-0.5 text-[10px] font-bold text-white sm:text-xs">
            SOLD OUT
          </span>
        )}
        {item.stock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-[#e8f4e8]/90 px-2 py-0.5 text-[10px] font-bold text-[#267148] backdrop-blur-sm sm:text-xs">
            IN STOCK
          </span>
        )}
      </div>
      <div className="flex min-h-[112px] flex-col p-3">
        <h4
          data-testid={`text-food-name-${item.id}`}
          className="truncate text-sm font-bold text-[#1d3d2e]"
        >
          {item.name}
        </h4>
        <p className="mt-1 text-[11px] text-[#899088]">{item.category}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-3">
          <span
            data-testid={`text-food-price-${item.id}`}
            className="font-mono text-sm font-bold text-[#1b4332] sm:text-base"
          >
            {money(item.price)}
          </span>
          {isAdmin && (
            <button
              data-testid={`button-toggle-stock-${item.id}`}
              onClick={() => onToggleStock?.(item.id)}
              className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold sm:text-xs ${item.stock ? "bg-[#e8f4e8] text-[#267148]" : "bg-[#fff0ed] text-[#b13e32]"}`}
            >
              {item.stock ? "SOLD OUT" : "IN STOCK"}
            </button>
          )}
          <button
            data-testid={`button-add-${item.id}`}
            disabled={!item.stock}
            onClick={onAdd}
            className={`shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide ${item.stock ? "bg-[#eeb02f] text-[#173d2d]" : "cursor-not-allowed bg-[#e7e6df] text-[#a1a49e]"}`}
          >
            {item.stock ? "+ Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyCart({ go }: { go: (path: string) => void }) {
  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8efe7] text-[#2d6a4f]">
        <ShoppingCart size={31} strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-[#173d2d]">
        Your tray is empty
      </h2>
      <p className="mt-2 max-w-[250px] text-sm leading-5 text-[#7d877d]">
        The best lunch break starts with one good decision.
      </p>
      <button
        data-testid="button-browse-menu"
        onClick={() => go("/")}
        className="mt-6 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-bold text-white"
      >
        Browse the menu
      </button>
    </div>
  );
}

function SmartBill({
  store,
  setStore,
  go,
}: {
  store: Store;
  setStore: (store: Store) => void;
  go: (path: string) => void;
}) {
  const lines = store.cart
    .map((line) => ({
      ...line,
      item: store.menu.find((item) => item.id === line.itemId)!,
    }))
    .filter((line) => line.item);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.item.price * line.qty,
    0,
  );
  const gst = subtotal * 0.05;
  const adjust = (id: string, amount: number) =>
    setStore({
      ...store,
      cart: store.cart
        .map((line) =>
          line.itemId === id ? { ...line, qty: line.qty + amount } : line,
        )
        .filter((line) => line.qty > 0),
    });
  const addPairing = (item: MenuItem) => {
    const existing = store.cart.find((line) => line.itemId === item.id);
    setStore({
      ...store,
      cart: [
        ...store.cart.filter((line) => line.itemId !== item.id),
        { itemId: item.id, qty: (existing?.qty || 0) + 1 },
      ],
    });
  };
  return (
    <div className="page-in pb-4">
      <div className="flex items-center gap-3 py-5">
        <button
          data-testid="button-back-menu"
          onClick={() => go("/")}
          className="rounded-full border border-[#ddd8ca] bg-white p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
            Ready when you are
          </p>
          <h1 className="text-2xl font-bold text-[#173d2d]">Your order</h1>
        </div>
      </div>
      <div className="rounded-3xl border border-[#e0dbcf] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-[#d8d2c4] pb-4">
          <div>
            <p className="font-bold text-[#1b4332]">SREC FC counter</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#7f887f]">
              <Clock3 size={13} /> pickup in approx. 10–15 min
            </p>
          </div>
          <span className="rounded-full bg-[#e8efe7] px-2.5 py-1 text-[10px] font-bold text-[#2d6a4f]">
            PRE-ORDER
          </span>
        </div>
        <div className="divide-y divide-[#f0ece4]">
          {lines.map(({ item, qty }) => (
            <div
              data-testid={`row-cart-${item.id}`}
              key={item.id}
              className="flex items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#233d30]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-[#899088]">
                  {money(item.price)} each
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#f1f4ee] p-1">
                  <button
                    data-testid={`button-minus-${item.id}`}
                    onClick={() => adjust(item.id, -1)}
                    className="rounded-lg p-1 text-[#1b4332]"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    data-testid={`text-quantity-${item.id}`}
                    className="w-4 text-center text-sm font-bold"
                  >
                    {qty}
                  </span>
                  <button
                    data-testid={`button-plus-${item.id}`}
                    onClick={() => adjust(item.id, 1)}
                    className="rounded-lg p-1 text-[#1b4332]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="w-16 text-right font-mono text-sm font-bold text-[#1b4332]">
                  {money(item.price * qty)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <FrequentlyPairedTogether
        cartItems={lines.map(({ item }) => item)}
        catalog={store.menu}
        onAdd={(item) => addPairing(item as MenuItem)}
        getImage={(item) =>
          item.category === "Fresh Juice & Mojito"
            ? getBeverageImage(item.name)
            : getFoodImage(item.name)
        }
      />
      <div className="mt-5 rounded-3xl bg-[#1b4332] p-5 text-[#fffaf0]">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b5c9b6]">
          Payment summary
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-[#cddacc]">
            <span>Subtotal</span>
            <span className="mono">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#cddacc]">
            <span>GST (5%)</span>
            <span className="mono">{money(gst)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-4 text-lg font-bold">
            <span>Total to pay</span>
            <span className="mono text-[#eeb02f]">{money(subtotal + gst)}</span>
          </div>
        </div>
        <button
          data-testid="button-proceed-payment"
          onClick={() => go("/payment")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d]"
        >
          Proceed to payment <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

function Bill({
  store,
  setStore,
  go,
}: {
  store: Store;
  setStore: (store: Store) => void;
  go: (path: string) => void;
}) {
  const lines = store.cart
    .map((line) => ({
      ...line,
      item: store.menu.find((item) => item.id === line.itemId)!,
    }))
    .filter((line) => line.item);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.item.price * line.qty,
    0,
  );
  const gst = subtotal * 0.05;
  const adjust = (id: string, amount: number) =>
    setStore({
      ...store,
      cart: store.cart
        .map((line) =>
          line.itemId === id ? { ...line, qty: line.qty + amount } : line,
        )
        .filter((line) => line.qty > 0),
    });
  return <SmartBill store={store} setStore={setStore} go={go} />;
  return (
    <div className="page-in pb-4">
      <div className="flex items-center gap-3 py-5">
        <button
          data-testid="button-back-menu"
          onClick={() => go("/")}
          className="rounded-full border border-[#ddd8ca] bg-white p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
            Ready when you are
          </p>
          <h1 className="text-2xl font-bold text-[#173d2d]">Your order</h1>
        </div>
      </div>
      <div className="rounded-3xl border border-[#e0dbcf] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-dashed border-[#d8d2c4] pb-4">
          <div>
            <p className="font-bold text-[#1b4332]">SREC FC counter</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#7f887f]">
              <Clock3 size={13} /> pickup in approx. 10–15 min
            </p>
          </div>
          <span className="rounded-full bg-[#e8efe7] px-2.5 py-1 text-[10px] font-bold text-[#2d6a4f]">
            PRE-ORDER
          </span>
        </div>
        <div className="divide-y divide-[#f0ece4]">
          {lines.map(({ item, qty }) => (
            <div
              data-testid={`row-cart-${item.id}`}
              key={item.id}
              className="flex items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#233d30]">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-[#899088]">
                  {money(item.price)} each
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#f1f4ee] p-1">
                  <button
                    data-testid={`button-minus-${item.id}`}
                    onClick={() => adjust(item.id, -1)}
                    className="rounded-lg p-1 text-[#1b4332]"
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    data-testid={`text-quantity-${item.id}`}
                    className="w-4 text-center text-sm font-bold"
                  >
                    {qty}
                  </span>
                  <button
                    data-testid={`button-plus-${item.id}`}
                    onClick={() => adjust(item.id, 1)}
                    className="rounded-lg p-1 text-[#1b4332]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="w-16 text-right font-mono text-sm font-bold text-[#1b4332]">
                  {money(item.price * qty)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-3xl bg-[#1b4332] p-5 text-[#fffaf0]">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#b5c9b6]">
          Payment summary
        </p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-[#cddacc]">
            <span>Subtotal</span>
            <span className="mono">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#cddacc]">
            <span>GST (5%)</span>
            <span className="mono">{money(gst)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-white/15 pt-4 text-lg font-bold">
            <span>Total to pay</span>
            <span className="mono text-[#eeb02f]">{money(subtotal + gst)}</span>
          </div>
        </div>
        <button
          data-testid="button-proceed-payment"
          onClick={() => go("/payment")}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d]"
        >
          Proceed to payment <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

const paymentApps = [
  {
    name: "SREC Wallet",
    logo: "https://cdn.simpleicons.org/googlewallet/1b4332",
  },
  { name: "Google Pay", logo: "https://cdn.simpleicons.org/googlepay/5F6368" },
  { name: "PhonePe", logo: "https://cdn.simpleicons.org/phonepe/5F259F" },
  { name: "Paytm", logo: "https://cdn.simpleicons.org/paytm/00BAF2" },
];

function Payment({
  store,
  onPaid,
  go,
}: {
  store: Store;
  onPaid: (receipt: Receipt) => void;
  go: (path: string) => void;
}) {
  const [app, setApp] = useState("Google Pay");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const { walletBalance, payWithWallet } = useWallet();
  const paymentMethod = app === "SREC Wallet" ? "wallet" : "upi";
  const lines = store.cart
    .map((line) => ({
      ...line,
      item: store.menu.find((item) => item.id === line.itemId)!,
    }))
    .filter((line) => line.item);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.item.price * line.qty,
    0,
  );
  const gst = subtotal * 0.05;
  const total = subtotal + gst;
  const walletInsufficient =
    paymentMethod === "wallet" && walletBalance < total;
  const buildReceipt = (payment: string): Receipt => {
    const now = new Date();
    const stamp = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    return {
      id: `FC${stamp}`,
      date: now.toLocaleDateString("en-GB").replaceAll("/", "-"),
      time: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transaction: Math.random().toString(16).slice(2, 14),
      payment:
        payment === "SREC Wallet" ? "Payment Method: SREC Wallet" : payment,
      items: store.cart,
      subtotal,
      gst,
      total,
    };
  };
  const pay = async () => {
    setPaymentError("");
    const receipt = buildReceipt(
      paymentMethod === "wallet" ? "SREC Wallet" : app,
    );
    if (walletInsufficient) {
      return;
    }
    setProcessing(true);
    if (paymentMethod === "wallet") {
      try {
        await payWithWallet(receipt.id, total);
        onPaid(receipt);
      } catch (error) {
        setPaymentError(
          error instanceof Error ? error.message : "Wallet payment failed.",
        );
        setProcessing(false);
      }
      return;
    }
    setTimeout(() => onPaid(receipt), 1500);
  };
  if (processing)
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center text-center page-in">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#e8efe7] text-[#1b4332]">
          <div className="absolute inset-0 animate-ping rounded-full border border-[#2d6a4f]/30" />
          <CreditCard size={34} />
        </div>
        <h2 className="mt-8 text-2xl font-bold text-[#173d2d]">
          Confirming your payment
        </h2>
        <p className="mt-2 text-sm text-[#7d877d]">
          Keep this screen open for a moment.
        </p>
        <div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-[#dfe9df]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#eeb02f]" />
        </div>
      </div>
    );
  return (
    <div className="page-in">
      <div className="flex items-center gap-3 py-5">
        <button
          data-testid="button-back-cart"
          onClick={() => go("/cart")}
          className="rounded-full border border-[#ddd8ca] bg-white p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
            One last step
          </p>
          <h1 className="text-2xl font-bold text-[#173d2d]">Pay & pick up</h1>
        </div>
      </div>
      <div className="rounded-3xl bg-[#1b4332] p-6 text-[#fffaf0]">
        <p className="text-sm text-[#cddacc]">Amount payable</p>
        <p
          data-testid="text-payment-total"
          className="mt-2 font-mono text-4xl font-bold text-[#eeb02f]"
        >
          {money(subtotal + gst)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-[#b5c9b6]">
          <Zap size={13} /> Secure simulated UPI checkout
        </p>
      </div>
      <h3 className="mt-8 text-lg font-bold text-[#173d2d]">
        Choose your UPI app
      </h3>
      <div className="mt-3 space-y-3">
        {paymentApps.map(({ name, logo: appLogo }) => (
          <button
            data-testid={`button-upi-${name.toLowerCase().replaceAll(" ", "-")}`}
            key={name}
            onClick={() => setApp(name)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${app === name ? "border-[#1b4332] bg-[#edf4eb] shadow-sm" : "border-[#ddd8ca] bg-white"}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-12 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                <img
                  src={appLogo}
                  alt={`${name} logo`}
                  className="max-h-7 max-w-10 object-contain"
                />
              </span>
              <span className="font-semibold text-[#294335]">{name}</span>
            </div>
            {app === name && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1b4332] text-white">
                <Check size={14} />
              </span>
            )}
          </button>
        ))}
      </div>
      {walletInsufficient && (
        <div className="mt-4 space-y-2">
          <InlineAlert
            message={`Insufficient Balance (Available: ${money(walletBalance)}). Please top up ${money(total - walletBalance)} or pay via UPI.`}
          />
          <button
            data-testid="button-top-up-difference"
            onClick={() => setWalletModalOpen(true)}
            className="text-sm font-bold text-[#2d6a4f] underline"
          >
            Top Up {money(total - walletBalance)}
          </button>
        </div>
      )}
      {paymentError && (
        <div className="mt-4">
          <InlineAlert message={paymentError} />
        </div>
      )}
      <button
        data-testid="button-pay-now"
        onClick={pay}
        disabled={walletInsufficient || processing}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-4 font-bold text-[#173d2d]"
      >
        {paymentMethod === "wallet"
          ? `Pay ${money(total)} via SREC Wallet`
          : `Pay ${money(total)} securely`}{" "}
        <ChevronRight size={18} />
      </button>
      <p className="mt-4 text-center text-[11px] text-[#8b9188]">
        Your receipt will be ready instantly after payment.
      </p>
      <WalletTopUpModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
}

function Barcode({ value }: { value: string }) {
  const bars = value.split("").flatMap((char) => {
    const n = char.charCodeAt(0);
    return [
      1 + (n % 3),
      1 + ((n >> 2) % 3),
      1 + ((n >> 4) % 2),
      1 + ((n >> 1) % 3),
    ];
  });
  return (
    <div className="mx-auto mt-4 max-w-[240px]">
      <div
        data-testid="barcode-receipt"
        className="flex h-14 items-stretch justify-center gap-[2px] overflow-hidden bg-white"
      >
        {bars.map((width, index) => (
          <span
            key={index}
            className="bg-[#19231e]"
            style={{ width: `${width}px` }}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-xs tracking-[.18em]">{value}</p>
    </div>
  );
}

function ReceiptView({
  receipt,
  store,
  go,
}: {
  receipt: Receipt;
  store: Store;
  go: (path: string) => void;
}) {
  const lines = receipt.items
    .map((line) => ({
      ...line,
      item: store.menu.find((item) => item.id === line.itemId)!,
    }))
    .filter((line) => line.item);
  return (
    <div className="page-in pb-6">
      <div className="flex items-center justify-between py-5">
        <button
          data-testid="button-back-receipt"
          onClick={() => go("/orders")}
          className="rounded-full border border-[#ddd8ca] bg-white p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <span
          data-testid="status-payment"
          className="flex items-center gap-1.5 rounded-full bg-[#d9f0df] px-3 py-1.5 text-[10px] font-bold text-[#267148]"
        >
          <Check size={12} /> PAID & VERIFIED
        </span>
      </div>
      <div className="receipt-paper mono text-[#19231e]">
        <div className="receipt-inner">
          <div className="flex items-center gap-3 border-b border-[#19231e] pb-5">
            <img
              src={logo}
              alt="SREC FC crest"
              className="h-16 w-16 object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-[.08em]">SREC FC</h1>
              <p className="text-sm font-bold tracking-[.22em]">FOOD COURT</p>
              <p className="mt-1 text-[9px] tracking-[.12em]">
                GOOD FOOD · GREAT VIBES
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 border-b border-[#19231e] py-4 text-[10px] leading-5">
            <div className="border-r border-[#19231e] pr-2">
              <p>College&nbsp; : SREC</p>
              <p>Location : Food Court</p>
              <p>Date&nbsp;&nbsp;&nbsp; : {receipt.date}</p>
              <p>Time&nbsp;&nbsp;&nbsp; : {receipt.time}</p>
            </div>
            <div className="pl-3">
              <p>Receipt No : {receipt.id}</p>
              <p>Payment&nbsp;&nbsp; : UPI</p>
              <p>App&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; : {receipt.payment}</p>
              <p>Txn ID&nbsp;&nbsp;&nbsp; : {receipt.transaction}</p>
            </div>
          </div>
          <div className="border-b border-[#19231e] py-4 text-[11px]">
            <div className="grid grid-cols-[22px_1fr_28px_64px] border-b border-[#19231e] pb-2 font-bold">
              <span>No.</span>
              <span>ITEM</span>
              <span className="text-center">QTY</span>
              <span className="text-right">PRICE</span>
            </div>
            {lines.map(({ item, qty }, index) => (
              <div
                data-testid={`receipt-row-${item.id}`}
                key={item.id}
                className="grid grid-cols-[22px_1fr_28px_64px] py-1.5"
              >
                <span>{index + 1}</span>
                <span className="truncate pr-1">{item.name}</span>
                <span className="text-center">{qty}</span>
                <span className="text-right">
                  {(item.price * qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="ml-auto w-[205px] border-b border-[#19231e] py-4 text-[11px] leading-6">
            <div className="flex justify-between">
              <span>Sub Total :</span>
              <span>{receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%) :</span>
              <span>{receipt.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total&nbsp;&nbsp;&nbsp;&nbsp; :</span>
              <span>{receipt.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="pt-5 text-center text-[11px]">
            <p>— Thank you for dining with us! —</p>
            <p className="mt-2 font-bold tracking-[.18em]">SREC FC</p>
            <p className="text-[9px]">Good Food · Great Vibes</p>
            <Barcode value={receipt.id} />
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px]">
              <span className="h-px w-16 bg-[#19231e]" />
              <Leaf size={16} />
              <span className="h-px w-16 bg-[#19231e]" />
            </div>
            <p className="mt-2 text-[10px] tracking-[.3em]">
              EAT · RELAX · REPEAT
            </p>
          </div>
        </div>
      </div>
      <button
        data-testid="button-done-receipt"
        onClick={() => go("/")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3.5 font-bold text-white"
      >
        Back to menu <HomeIcon size={17} />
      </button>
    </div>
  );
}

function Orders({ store, go }: { store: Store; go: (path: string) => void }) {
  return (
    <div className="page-in">
      <div className="py-5">
        <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
          Your campus trail
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173d2d]">
          Orders
        </h1>
      </div>
      {store.orders.length === 0 ? (
        <div className="flex min-h-[56vh] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e8efe7] text-[#2d6a4f]">
            <ReceiptText size={31} strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-[#173d2d]">
            No receipts yet
          </h2>
          <p className="mt-2 max-w-[245px] text-sm text-[#7d877d]">
            Your next quick bite will show up here.
          </p>
          <button
            data-testid="button-start-order"
            onClick={() => go("/")}
            className="mt-5 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-bold text-white"
          >
            Start an order
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {store.orders.map((receipt) => (
            <button
              data-testid={`button-order-${receipt.id}`}
              key={receipt.id}
              onClick={() => go(`/receipt/${receipt.id}`)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#ded9cc] bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8efe7] text-[#2d6a4f]">
                  <ReceiptText size={20} />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-[#1b4332]">
                    {receipt.id}
                  </p>
                  <p className="mt-1 text-xs text-[#899088]">
                    {receipt.date} · {receipt.payment}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-[#1b4332]">
                  {money(receipt.total)}
                </p>
                <span className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-[#2d6a4f]">
                  PAID <ChevronRight size={13} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Profile({
  store,
  setStore,
  go,
  logout,
}: {
  store: Store;
  setStore: (store: Store) => void;
  go: (path: string) => void;
  logout: () => void;
}) {
  const [supportType, setSupportType] = useState("Order issue");
  const [supportMessage, setSupportMessage] = useState("");
  const { toast } = useToast();
  const initials = store.profile.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const submitSupportTicket = () => {
    if (!supportMessage.trim()) return;
    let existing: unknown = [];
    try {
      existing = JSON.parse(
        localStorage.getItem("srec_support_tickets") || "[]",
      );
    } catch {
      existing = [];
    }
    const ticket = {
      id: `ticket-${Date.now()}`,
      email: store.profile.email,
      type: supportType,
      message: supportMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      "srec_support_tickets",
      JSON.stringify([ticket, ...(Array.isArray(existing) ? existing : [])]),
    );
    setSupportMessage("");
    toast({
      title: "Report submitted",
      description: "Thanks. The SREC FC team will review your issue.",
    });
  };
  return (
    <div className="page-in">
      <div className="py-5">
        <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
          Your SREC FC account
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173d2d]">
          Profile
        </h1>
      </div>
      <section className="relative overflow-hidden rounded-3xl bg-[#1b4332] p-5 text-white">
        <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[18px] border-[#eeb02f]/20" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeb02f] text-2xl font-bold text-[#1b4332]">
            {initials}
          </div>
          <div className="min-w-0">
            <h2
              data-testid="text-profile-name"
              className="truncate text-xl font-bold"
            >
              {store.profile.name}
            </h2>
            <p
              data-testid="text-profile-email"
              className="mt-1 truncate text-sm text-[#cddacc]"
            >
              {store.profile.email}
            </p>
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-[#cddacc]">
          <PackageCheck size={15} /> {store.orders.length} completed{" "}
          {store.orders.length === 1 ? "order" : "orders"} · pickup regular
        </div>
      </section>
      <div className="mt-5 overflow-hidden rounded-3xl border border-[#ded9cc] bg-white">
        <button
          data-testid="button-reminder-toggle"
          onClick={() =>
            setStore({
              ...store,
              profile: {
                ...store.profile,
                reminders: !store.profile.reminders,
              },
            })
          }
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#fff1c8] p-2.5 text-[#88651c]">
              <Bell size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#294335]">
                Daily lunch reminder
              </p>
              <p className="mt-1 text-xs text-[#899088]">
                Nudge me at 12:00 PM
              </p>
            </div>
          </div>
          <span
            className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${store.profile.reminders ? "bg-[#2d6a4f]" : "bg-[#d9ddd4]"}`}
          >
            <span
              className={`h-4 w-4 rounded-full bg-white transition-transform ${store.profile.reminders ? "translate-x-5" : ""}`}
            />
          </span>
        </button>
      </div>
      <section className="mt-5 rounded-3xl border border-[#ded9cc] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e8efe7] p-2.5 text-[#2d6a4f]">
            <LifeBuoy size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#294335]">Help & Support</h2>
            <p className="mt-1 text-xs text-[#899088]">
              Report an order issue, payment discrepancy, or feedback.
            </p>
          </div>
        </div>
        <select
          value={supportType}
          onChange={(event) => setSupportType(event.target.value)}
          className="mt-4 w-full rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 text-sm text-[#294335] outline-none focus:border-[#2d6a4f]"
        >
          <option>Order issue</option>
          <option>Payment discrepancy</option>
          <option>General app feedback</option>
        </select>
        <textarea
          value={supportMessage}
          onChange={(event) => setSupportMessage(event.target.value)}
          placeholder="Tell us what happened"
          rows={3}
          className="mt-3 w-full resize-none rounded-xl border border-[#dcd8ce] px-3 py-3 text-sm text-[#294335] outline-none focus:border-[#2d6a4f]"
        />
        <button
          disabled={!supportMessage.trim()}
          onClick={submitSupportTicket}
          className="mt-3 flex items-center gap-2 rounded-xl bg-[#1b4332] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit report <ChevronRight size={16} />
        </button>
      </section>
      <div className="mt-5 space-y-2">
        <button
          data-testid="button-order-history"
          onClick={() => go("/orders")}
          className="flex w-full items-center justify-between rounded-2xl border border-[#ded9cc] bg-white p-4 text-sm font-bold text-[#294335]"
        >
          <span className="flex items-center gap-3">
            <History size={18} className="text-[#2d6a4f]" /> Order history
          </span>
          <ChevronRight size={17} className="text-[#929a91]" />
        </button>
        <button
          data-testid="button-logout"
          onClick={logout}
          className="flex w-full items-center justify-between rounded-2xl border border-[#f0d7d1] bg-[#fff9f7] p-4 text-sm font-bold text-[#b13e32]"
        >
          <span className="flex items-center gap-3">
            <LogOut size={18} /> Sign out
          </span>
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

const adminCategories: Category[] = [
  "Breakfast",
  "Lunch",
  "Puffs & Bakery",
  "Fresh Juice & Mojito",
  "Indochines",
  "Chats",
  "Snacks",
  "Hot Drinks",
  "Milkshakes",
];

function AdminPanel({
  menu,
  onAdd,
  onEdit,
  onDelete,
  onToggleStock,
  go,
}: {
  menu: MenuItem[];
  onAdd: (item: Omit<MenuItem, "id">) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleStock: (id: string) => void;
  go: (path: string) => void;
}) {
  const emptyForm = {
    name: "",
    price: "",
    category: "Breakfast" as Category,
    image: "",
    stock: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      category: item.category,
      image: item.image ?? "",
      stock: item.stock,
    });
  };
  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };
  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) return;
    const item = {
      name: form.name.trim(),
      price,
      category: form.category,
      image: form.image.trim() || undefined,
      stock: form.stock,
    };
    if (editingId) onEdit({ ...item, id: editingId });
    else onAdd(item);
    resetForm();
  };

  return (
    <div className="page-in pb-8">
      <div className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => go("/")}
            className="rounded-full border border-[#ddd8ca] bg-white p-2"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
              Restricted access
            </p>
            <h1 className="text-2xl font-bold text-[#173d2d]">Admin Portal</h1>
          </div>
        </div>
        <ShieldCheck className="text-[#2d6a4f]" size={24} />
      </div>
      <form
        onSubmit={submit}
        className="rounded-3xl border border-[#ded9cc] bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#173d2d]">
            {editingId ? "Edit menu item" : "Add menu item"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-bold text-[#2d6a4f]"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Item name"
            required
            className="rounded-xl border border-[#dcd8ce] px-3 py-3 text-sm outline-none focus:border-[#2d6a4f]"
          />
          <input
            value={form.price}
            onChange={(event) =>
              setForm({
                ...form,
                price: event.target.value.replace(/[^\d.]/g, ""),
              })
            }
            placeholder="Price (₹)"
            inputMode="decimal"
            required
            className="rounded-xl border border-[#dcd8ce] px-3 py-3 text-sm outline-none focus:border-[#2d6a4f]"
          />
          <select
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value as Category })
            }
            className="rounded-xl border border-[#dcd8ce] bg-white px-3 py-3 text-sm outline-none focus:border-[#2d6a4f]"
          >
            {adminCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <input
            value={form.image}
            onChange={(event) =>
              setForm({ ...form, image: event.target.value })
            }
            placeholder="Image URL (optional)"
            type="url"
            className="rounded-xl border border-[#dcd8ce] px-3 py-3 text-sm outline-none focus:border-[#2d6a4f]"
          />
        </div>
        {form.image && (
          <img
            src={form.image}
            alt="Menu item preview"
            className="mt-3 h-28 w-full rounded-xl object-cover object-center"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#294335]">
          <input
            type="checkbox"
            checked={form.stock}
            onChange={(event) =>
              setForm({ ...form, stock: event.target.checked })
            }
          />{" "}
          In stock
        </label>
        <button
          type="submit"
          className="mt-4 rounded-xl bg-[#1b4332] px-4 py-3 text-sm font-bold text-white"
        >
          {editingId ? "Save changes" : "Add item"}
        </button>
      </form>
      <div className="mt-5 space-y-2">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-[#ded9cc] bg-white p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#294335]">
                {item.name}
              </p>
              <p className="text-xs text-[#899088]">
                {money(item.price)} · {item.category}
              </p>
            </div>
            <button
              title={item.stock ? "Mark sold out" : "Mark in stock"}
              onClick={() => onToggleStock(item.id)}
              className={`rounded-lg px-2 py-1.5 text-[10px] font-bold ${item.stock ? "bg-[#e8f4e8] text-[#267148]" : "bg-[#fff0ed] text-[#b13e32]"}`}
            >
              {item.stock ? "IN STOCK" : "SOLD OUT"}
            </button>
            <button
              title="Edit item"
              onClick={() => startEdit(item)}
              className="rounded-lg border border-[#ddd8ca] p-2 text-[#2d6a4f]"
            >
              <Edit3 size={15} />
            </button>
            <button
              title="Delete item"
              onClick={() =>
                window.confirm(`Delete ${item.name}?`) && onDelete(item.id)
              }
              className="rounded-lg border border-[#f0d7d1] p-2 text-[#b13e32]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtectedRoute({
  isAdmin,
  children,
  redirect,
}: {
  isAdmin: boolean;
  children: ReactNode;
  redirect: () => void;
}) {
  useEffect(() => {
    if (!isAdmin) redirect();
  }, [isAdmin, redirect]);
  return isAdmin ? <>{children}</> : null;
}

function AppContent() {
  const [location, setLocation] = useLocation();
  const [store, setStoreState] = useState<Store>(getStore);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  useEffect(() => {
    saveStore(store);
  }, [store]);
  useEffect(() => {
    const refreshCatalog = () => {
      const nextMenu = getCatalog();
      setStoreState((current) =>
        JSON.stringify(current.menu) === JSON.stringify(nextMenu)
          ? current
          : { ...current, menu: nextMenu },
      );
    };
    window.addEventListener("catalog-update", refreshCatalog);
    window.addEventListener("storage", refreshCatalog);
    return () => {
      window.removeEventListener("catalog-update", refreshCatalog);
      window.removeEventListener("storage", refreshCatalog);
    };
  }, []);
  const setStore = (next: Store) => setStoreState(next);
  const go = (path: string) => setLocation(path);
  const enterAccount = (account: Account) =>
    setStore({
      ...store,
      signedIn: true,
      activeEmail: account.email,
      profile: {
        ...store.profile,
        name: account.username,
        email: account.email,
        role:
          account.email === ADMIN_EMAIL && account.role === "ADMIN"
            ? "ADMIN"
            : "STUDENT",
      },
    });
  const registerAccount = (account: Account) =>
    setStore({
      ...store,
      accounts: [...store.accounts, account],
      signedIn: true,
      activeEmail: account.email,
      profile: {
        ...store.profile,
        name: account.username,
        email: account.email,
        role: "STUDENT",
      },
    });
  const resetPassword = (email: string, password: string) =>
    setStore({
      ...store,
      accounts: store.accounts.map((account) =>
        account.email === email ? { ...account, password } : account,
      ),
    });
  const isAdmin =
    store.profile.role === "ADMIN" && store.activeEmail === ADMIN_EMAIL;
  const updateCatalog = (mutator: (menu: MenuItem[]) => MenuItem[]) => {
    if (!isAdmin) return;
    const nextMenu = mutator(store.menu);
    saveCatalog(nextMenu);
    broadcastCatalogUpdate();
    setStore({ ...store, menu: nextMenu });
  };
  const addMenuItem = (item: Omit<MenuItem, "id">) =>
    updateCatalog((menu) => [
      ...menu,
      {
        ...item,
        id: `${item.name.toLowerCase().replace(/[^a-z]+/g, "-")}-${Date.now()}`,
      },
    ]);
  const editMenuItem = (item: MenuItem) =>
    updateCatalog((menu) =>
      menu.map((candidate) => (candidate.id === item.id ? item : candidate)),
    );
  const deleteMenuItem = (id: string) =>
    updateCatalog((menu) => menu.filter((item) => item.id !== id));
  const toggleStock = (id: string) =>
    updateCatalog((menu) =>
      menu.map((item) =>
        item.id === id ? { ...item, stock: !item.stock } : item,
      ),
    );
  if (!store.signedIn)
    return (
      <Auth
        accounts={store.accounts}
        onEnter={enterAccount}
        onRegister={registerAccount}
        onResetPassword={resetPassword}
      />
    );
  const receiptId = location.split("/receipt/")[1];
  const shownReceipt =
    receipt || store.orders.find((order) => order.id === receiptId);
  const logout = () => {
    setStore({
      ...store,
      signedIn: false,
      activeEmail: "",
      profile: { name: "", email: "", reminders: false, role: "STUDENT" },
      cart: [],
    });
    go("/");
  };
  const path = location.startsWith("/receipt/") ? "/orders" : location;
  return (
    <WalletProvider email={store.activeEmail}>
      <div className="grain app-shell min-h-[100dvh]">
        <div className="mx-auto min-h-[100dvh] max-w-2xl px-4 pb-24 md:px-6">
          {shownReceipt && location.startsWith("/receipt/") ? (
            <ReceiptView receipt={shownReceipt} store={store} go={go} />
          ) : path === "/admin" ? (
            <ProtectedRoute isAdmin={isAdmin} redirect={() => go("/")}>
              <AdminPanel
                menu={store.menu}
                onAdd={addMenuItem}
                onEdit={editMenuItem}
                onDelete={deleteMenuItem}
                onToggleStock={toggleStock}
                go={go}
              />
            </ProtectedRoute>
          ) : path === "/cart" ? (
            <>
              {store.cart.length ? (
                <Bill store={store} setStore={setStore} go={go} />
              ) : (
                <EmptyCart go={go} />
              )}
            </>
          ) : path === "/payment" ? (
            <Payment
              store={store}
              onPaid={(newReceipt) => {
                setStore({
                  ...store,
                  cart: [],
                  orders: [newReceipt, ...store.orders],
                });
                setReceipt(newReceipt);
                go(`/receipt/${newReceipt.id}`);
              }}
              go={go}
            />
          ) : path === "/orders" ? (
            <Orders store={store} go={go} />
          ) : path === "/profile" ? (
            <Profile
              store={store}
              setStore={setStore}
              go={go}
              logout={logout}
            />
          ) : (
            <Home
              store={store}
              setStore={setStore}
              go={go}
              isAdmin={isAdmin}
              onToggleStock={isAdmin ? toggleStock : undefined}
            />
          )}
          <BottomNav
            path={path}
            cartCount={store.cart.reduce((count, line) => count + line.qty, 0)}
            go={go}
          />
        </div>
      </div>
    </WalletProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary resetKey={location.pathname}>
            <AppContent />
          </ErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
