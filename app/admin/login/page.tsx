import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Caspian Gaz Group</p>
          <h1 className="mt-2 text-2xl font-bold">Admin panel</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
