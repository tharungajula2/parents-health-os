import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ParentsAuthProvider } from "../lib/supabase/context";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Parents Health OS | Eldercare Oversight Platform",
  description: "A premium family oversight dashboard for India's elder care, connecting remote adult children to parents' health via smart WhatsApp check-ins and clinical analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* BRAND INFRASTRUCTURE: GRID + AMBIENT LIGHTING */}
        <div className="fixed inset-0 -z-10 bg-[#FAF9F6]">
          {/* LAYER 01: Refractive Orbs (Bloom Effect) */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0E5E5A]/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E05E1B]/5 blur-[120px] pointer-events-none" />
          
          {/* LAYER 02: 64px Precision Grid lines */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#12232107_1px,transparent_1px),linear-gradient(to_bottom,#12232107_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" 
            style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }}
          />
        </div>

        <ParentsAuthProvider>
          {children}
        </ParentsAuthProvider>
      </body>
    </html>
  );
}

