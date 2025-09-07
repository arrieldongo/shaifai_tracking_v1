import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Charger Roboto avec les poids utiles
const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"], // tu peux réduire si besoin
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shaifai Tracking",
  description: "MVP de tracking sans carte (timeline)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={roboto.variable}>
      <body className="font-body antialiased tracking-tight">
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
