"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Loader2, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingModal() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show modal if authenticated but no phone number exists
    if (status === "authenticated" && session?.user && !session.user.phone) {
      setName(session.user.name || "");
      setShow(true);
    } else {
      setShow(false);
    }
  }, [status, session]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile saved successfully!");
        setShow(false);
        // NextAuth's update() can aggressively cache on client. Hard reload guarantees flush.
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "hsla(225, 25%, 4%, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="glass-premium"
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "2.5rem",
          borderRadius: "var(--radius)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--gradient-primary)" }} />
        
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem", color: "hsl(var(--foreground))" }}>
          Welcome to Aparoksha!
        </h2>
        <p className="font-mono" style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginBottom: "2rem", lineHeight: 1.6 }}>
          We just need a few basic details to set up your Leaderboard account and securely deliver rewards.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "hsl(var(--foreground))" }}>
              Display Name
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
                placeholder="e.g. TechWizard99"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem", color: "hsl(var(--foreground))" }}>
              Phone Number
            </label>
            <div style={{ position: "relative" }}>
              <Phone size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "hsl(var(--muted-foreground))" }} />
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", paddingLeft: "2.5rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem", fontFamily: "monospace" }}
                placeholder="+91 9876543210"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "1rem", padding: "1rem", fontSize: "1rem", fontWeight: 700, display: "flex", justifyContent: "center" }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "COMPLETE SETUP"}
          </button>
        </form>
      </div>
    </div>
  );
}
