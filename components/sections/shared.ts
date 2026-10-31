import type { Dictionary } from "@/lib/dictionaries";
import type { StockStatus } from "@/lib/data";

export const statusLabel = (dict: Dictionary, status: StockStatus) =>
  status === "in_stock" ? dict.common.inStock : status === "limited" ? dict.common.limited : dict.common.onRequest;

export const statusTone: Record<StockStatus, string> = {
  in_stock: "bg-emerald text-deep",
  limited: "bg-white text-deep",
  on_request: "border border-white/40 text-white",
};

export const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
