import { useEffect, useState } from "react";
import { Check, CreditCard, LoaderCircle, X, WalletCards } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/context/WalletContext";

const quickAmounts = [50, 100, 200, 500];
const paymentOptions = ["Pay via GPay", "Pay via Paytm", "UPI ID / Netbanking"];

export function WalletTopUpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"amount" | "payment" | "success">("amount");
  const [paymentOption, setPaymentOption] = useState(paymentOptions[0]);
  const { topUpWallet } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setStep("amount");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const continueToPayment = () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Enter a valid amount",
        description: "Your top-up amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const submit = async () => {
    const parsedAmount = Number(amount);
    setSubmitting(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      await topUpWallet(parsedAmount);
      setStep("success");
      toast({
        title: "Wallet topped up",
        description: `₹${parsedAmount.toFixed(2)} was added to your SREC Wallet.`,
      });
    } catch (error) {
      toast({
        title: "Top-up failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10291c]/65 p-3 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md rounded-3xl bg-[#fffdf8] p-5 text-[#173d2d] shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#e8efe7] p-3 text-[#1b4332]">
              <WalletCards size={22} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-[#8a9087]">
                SREC Wallet
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {step === "payment"
                  ? "Choose payment"
                  : step === "success"
                    ? "Funds added"
                    : "Add funds"}
              </h2>
            </div>
          </div>
          <button
            aria-label="Close wallet top-up"
            onClick={onClose}
            className="rounded-full bg-[#f0eee7] p-2"
          >
            <X size={17} />
          </button>
        </div>
        {step === "amount" && (
          <>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(String(quickAmount))}
                  className={`rounded-xl border py-3 text-sm font-bold ${amount === String(quickAmount) ? "border-[#1b4332] bg-[#edf4eb] text-[#1b4332]" : "border-[#ddd8ca] bg-white text-[#536056]"}`}
                >
                  +₹{quickAmount}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-xs font-bold uppercase tracking-[.16em] text-[#7d877d]">
              Custom amount
              <input
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value.replace(/[^\d.]/g, ""))
                }
                inputMode="decimal"
                placeholder="Enter amount"
                className="mt-2 w-full rounded-xl border border-[#dcd8ce] bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#2d6a4f]"
              />
            </label>
            <button
              onClick={continueToPayment}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d]"
            >
              Continue to payment <CreditCard size={17} />
            </button>
          </>
        )}
        {step === "payment" && (
          <>
            <p className="mt-5 rounded-2xl bg-[#edf4eb] p-4 text-sm text-[#2d6a4f]">
              Top up <strong>₹{Number(amount || 0).toFixed(2)}</strong> securely
              using a simulated gateway.
            </p>
            <div className="mt-4 space-y-2">
              {paymentOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setPaymentOption(option)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-semibold ${paymentOption === option ? "border-[#1b4332] bg-[#edf4eb]" : "border-[#ddd8ca] bg-white"}`}
                >
                  {option}
                  {paymentOption === option && <Check size={17} />}
                </button>
              ))}
            </div>
            <button
              disabled={submitting}
              onClick={submit}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eeb02f] py-3.5 font-bold text-[#173d2d] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  Processing payment…{" "}
                  <LoaderCircle className="animate-spin" size={17} />
                </>
              ) : (
                <>
                  Proceed to Pay <CreditCard size={17} />
                </>
              )}
            </button>
          </>
        )}
        {step === "success" && (
          <div className="mt-7 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#d9f0df] text-[#267148]">
              <Check size={32} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Payment successful</h3>
            <p className="mt-2 text-sm text-[#6f796f]">
              ₹{Number(amount).toFixed(2)} added via {paymentOption}.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-[#1b4332] py-3.5 font-bold text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
