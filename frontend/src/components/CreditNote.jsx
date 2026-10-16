import { Zap } from "lucide-react";
import { useCredits } from "../context/CreditsContext.jsx";

export default function CreditNote({ action, count = 1 }) {
  const { balance, lastUsed, costs } = useCredits();
  const cost = costs[action] * count;
  const low = balance < cost;

  return (
    <div className="space-y-1 text-center text-sm">
      <p className={low ? "text-red-400" : "text-slate-400"}>
        <Zap size={13} className="mr-1 inline text-indigo-400" />
        {low
          ? `Not enough credits (needs ${cost}, you have ${balance})`
          : `Uses ${cost} credits · ${balance - cost} left after this`}
      </p>
      {lastUsed !== null && (
        <p className="text-emerald-400">
          ✓ Last action used {lastUsed} credits · {balance} credits left
        </p>
      )}
    </div>
  );
}