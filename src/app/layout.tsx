import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  title: "Yukti OS | Tharun Gajula",
  description: "Experience the future of Geriatric Care through context-aware longevity systems.",
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
        <div className="fixed inset-0 -z-10 bg-[#010413]">
          {/* LAYER 01: Refractive Orbs (Bloom Effect) */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
          
          {/* LAYER 02: 64px Precision Grid lines */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff26_1px,transparent_1px),linear-gradient(to_bottom,#ffffff26_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" 
            style={{ maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)' }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
