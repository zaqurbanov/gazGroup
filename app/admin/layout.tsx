import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import "../globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

// A separate root layout: the admin area lives outside the [lang] tree.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={manrope.variable}>
      <body className="min-h-dvh bg-slate-50 font-sans text-slate-900">
        <Suspense fallback={<p className="p-8 text-sm text-slate-500">Yüklənir...</p>}>{children}</Suspense>
      </body>
    </html>
  );
}
