"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Trophy, User, ShoppingBag, QrCode, Shield } from "lucide-react";

// Local cn utility replacement since we don't have lib/utils.js
const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");
const ApkLogo = "/apk-logo.png";

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Leaderboard", href: "/", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User, auth: true },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Scan QR", href: "/scan", icon: QrCode, auth: true },
    ...(session?.user?.role === "admin" ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/50 py-4 shadow-glow-primary/20"
          : "bg-transparent border-transparent py-6"
      )}
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        transition: "all 0.3s ease",
        borderBottom: isScrolled
          ? "1px solid hsla(225, 18%, 16%, 0.5)"
          : "1px solid transparent",
        background: isScrolled
          ? "hsla(225, 25%, 4%, 0.8)"
          : "transparent",
        backdropFilter: isScrolled ? "blur(16px)" : "none",
        padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
      }}
    >
      <div className="container" style={{ margin: "0 auto", padding: "0 1.5rem", maxWidth: "1400px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", flexDirection: "column", textDecoration: "none", outline: "none" }}
          >
            <span
              className="text-glow-primary"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.05em",
                color: "white",
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ApkLogo} alt="Aparoksha Logo" style={{ width: "2.5rem", height: "2.5rem", objectFit: "contain" }} />
              APAROKSHA
            </span>
            <span
              className="font-mono text-glow-primary"
              style={{
                fontSize: "0.625rem",
                letterSpacing: "0.2em",
                color: "hsl(var(--primary) / 0.8)",
                textTransform: "uppercase",
                marginTop: "0.25rem",
                transition: "color 0.3s",
              }}
            >
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {navLinks.map((link) => {
              if (link.auth && !session) return null;
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    textDecoration: "none",
                  }}
                >
                  <Icon size={14} />
                  {link.name}
                </Link>
              );
            })}

            {/* Auth Buttons */}
            {session ? (
              <button
                onClick={() => signOut()}
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
              >
                <LogOut size={14} />
                LOGOUT
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="btn-primary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}
              >
                <LogIn size={14} />
                LOGIN
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "hsl(var(--foreground))",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div
          className="mobile-nav"
          style={{
            display: "none",
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "hsla(225, 25%, 4%, 0.95)",
            backdropFilter: "blur(24px)",
            borderBottom: isOpen ? "1px solid hsl(var(--border) / 0.5)" : "none",
            overflow: "hidden",
            maxHeight: isOpen ? "400px" : "0",
            opacity: isOpen ? 1 : 0,
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {navLinks.map((link) => {
              if (link.auth && !session) return null;
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid hsl(var(--border) / 0.3)",
                    transition: "color 0.2s",
                  }}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {session ? (
                <button onClick={() => { signOut(); setIsOpen(false); }} className="btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <LogOut size={16} /> LOGOUT
                </button>
              ) : (
                <button onClick={() => { signIn("google"); setIsOpen(false); }} className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <LogIn size={16} /> LOGIN WITH GOOGLE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
