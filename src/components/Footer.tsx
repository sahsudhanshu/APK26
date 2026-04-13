"use client";

import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: "1px solid hsla(var(--border) / 0.5)",
        background: "hsla(var(--background) / 0.5)",
        backdropFilter: "blur(12px)",
        position: "relative",
        zIndex: 10,
        marginTop: "2rem"
      }}
    >
      <div className="container" style={{ margin: "0 auto", padding: "1.5rem", maxWidth: "1400px" }}>
        <div className="footer-layout" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apk-logo.png" alt="Aparoksha Logo" style={{ width: "2rem", height: "2rem", objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                className="text-glow-primary uppercase"
                style={{
                  fontSize: "1.25rem", // text-xl
                  fontWeight: 700,
                  letterSpacing: "-0.05em", // tracking-tighter
                  color: "white",
                  fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                  textTransform: "uppercase",
                  lineHeight: 1.1
                }}
              >
                APAROKSHA
              </span>
              <p
                className="font-mono text-muted-foreground"
                style={{
                  fontSize: "0.75rem", // slightly smaller to match image scaling
                  color: "hsl(var(--muted-foreground))",
                  marginTop: "0.25rem"
                }}
              >
                The Ultimate Tech Fest
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div
              className="font-mono text-muted-foreground"
              style={{
                fontSize: "0.875rem", // text-sm
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "hsl(var(--muted-foreground))"
              }}
            >
              <span>DESIGNED WITH</span>
              <Heart size={16} className="animate-pulse-glow" style={{ color: "hsl(var(--primary))" }} />
              <span>FOR APAROKSHA</span>
            </div>
            <p
              className="font-mono"
              style={{
                fontSize: "0.75rem", // text-xs
                color: "hsla(var(--muted-foreground) / 0.5)",
                marginTop: "0.5rem"
              }}
            >
              &copy; {new Date().getFullYear()} APAROKSHA. ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-layout {
            flex-direction: column !important;
            text-align: center;
          }
          .footer-layout > div {
            margin-bottom: 1rem;
            align-items: center !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
