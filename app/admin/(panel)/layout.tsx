import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/lib/admin/actions";
import { resources } from "@/lib/admin/resources";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  await connectDB();
  const unread = await Lead.countDocuments({ read: false });

  const link = "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100";

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <p className="px-3 pb-4 text-sm font-bold">
          Caspian Gaz <span className="text-emerald-700">Admin</span>
        </p>
        <nav aria-label="Admin" className="flex flex-wrap gap-1 lg:flex-col">
          <Link href="/admin" className={link}>
            Panel
          </Link>
          <Link href="/admin/leads" className={link}>
            Müraciətlər
            {unread > 0 && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">{unread}</span>}
          </Link>
          {resources.map((r) => (
            <Link key={r.key} href={`/admin/${r.key}`} className={link}>
              {r.label}
            </Link>
          ))}
          <Link href="/admin/settings" className={link}>
            Tənzimləmələr
          </Link>
        </nav>
        <div className="mt-6 space-y-3 border-t border-slate-200 px-3 pt-4 text-xs text-slate-500">
          <p className="truncate">{session.email}</p>
          <a href="/az" target="_blank" rel="noopener noreferrer" className="block font-semibold text-slate-700 hover:underline">
            Saytı aç
          </a>
          <form action={logout}>
            <button type="submit" className="font-semibold text-red-600 hover:underline">
              Çıxış
            </button>
          </form>
        </div>
      </aside>
      <main className="p-5 sm:p-8">{children}</main>
    </div>
  );
}
