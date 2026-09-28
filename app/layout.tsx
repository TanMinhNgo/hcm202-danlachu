import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HCM202 · Nhà nước của dân, do dân, vì dân",
  description: "Nhóm 04 · SE1823 · Từ nguyên tắc đến tình huống",
};

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/knowledge", label: "Nội dung" },
  { href: "/scenarios", label: "Sơ đồ tư duy" },
  { href: "/game", label: "Mini Game" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${font.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <nav className="site-nav" aria-label="Điều hướng chính">
          <div className="site-nav-inner">
            <Link href="/" className="site-brand">
              HCM202
            </Link>
            <div className="site-links">
              {NAV.slice(1).map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
            </div>
            <Link href="/game/join" className="site-join">
              Tham gia game
            </Link>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
