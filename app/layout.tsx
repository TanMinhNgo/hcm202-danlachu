import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const font = Be_Vietnam_Pro({ variable: "--font-be-vietnam", subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "HCM202 · Nhà nước của dân, do dân, vì dân",
  description: "Nhóm 04 · SE1823 · Từ nguyên tắc đến tình huống",
};

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/knowledge", label: "Nội dung" },
  { href: "/scenarios", label: "Tình huống" },
  { href: "/game", label: "Mini Game" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${font.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-4 overflow-x-auto px-4 py-3 text-sm">
            <Link href="/" className="font-bold whitespace-nowrap">HCM202 · Nhóm 04</Link>
            <div className="flex flex-1 gap-4">
              {NAV.slice(1).map((n) => (
                <Link key={n.href} href={n.href} className="whitespace-nowrap text-slate-600 hover:text-navy">{n.label}</Link>
              ))}
            </div>
            <Link href="/game/join" className="rounded-lg bg-brand px-3 py-1.5 font-semibold whitespace-nowrap text-white">Tham gia game</Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
