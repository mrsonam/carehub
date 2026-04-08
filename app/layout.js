import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "CareHub - Precision Healthcare Booking",
  description: "Access top-tier healthcare specialists with a seamless booking experience designed for clinical precision.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full ${manrope.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col selection:bg-primary/10 selection:text-primary font-inter">
        {children}
      </body>
    </html>
  );
}
