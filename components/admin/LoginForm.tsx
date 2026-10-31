"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/lib/admin/actions";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold text-slate-800">
        E-poçt
        <input name="email" type="email" required autoComplete="username" className={`${input} mt-1.5`} />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Parol
        <input name="password" type="password" required autoComplete="current-password" className={`${input} mt-1.5`} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Yoxlanılır..." : "Daxil ol"}
      </button>
    </form>
  );
}
