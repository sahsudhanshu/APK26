import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import AuthInterceptor from "@/components/AuthInterceptor";
import OnboardingModal from "@/components/OnboardingModal";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Aparoksha 2026 | Leaderboard & Rewards",
  description:
    "Track your points, claim event rewards, and compete on the Aparoksha 2026 leaderboard — IIIT Allahabad's premier tech fest.",
  keywords: "aparoksha, iiit allahabad, leaderboard, tech fest, rewards, points",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <OnboardingModal />
          <Suspense fallback={null}>
            <AuthInterceptor />
          </Suspense>
          <StarBackground />
          <Navbar />
          <main style={{ position: "relative", zIndex: 10, minHeight: "calc(100vh - 200px)", paddingTop: "5rem" }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
