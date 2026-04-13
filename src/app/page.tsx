"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCw, Crown, Medal, Award, Zap, Users } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  points: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 7000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={24} />;
      case 2: return <Medal size={24} />;
      case 3: return <Award size={24} />;
      default: return null;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1: return "rank-gold";
      case 2: return "rank-silver";
      case 3: return "rank-bronze";
      default: return "";
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1: return "rank-gold-bg";
      case 2: return "rank-silver-bg";
      case 3: return "rank-bronze-bg";
      default: return "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPoints = leaderboard.reduce((sum, e) => sum + e.points, 0);

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "3rem", paddingTop: "2rem" }}
      >
        {/* Decorative blurs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "300px",
            height: "300px",
            background: "hsl(var(--primary) / 0.15)",
            borderRadius: "50%",
            filter: "blur(120px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "400px",
            height: "400px",
            background: "hsl(var(--secondary) / 0.1)",
            borderRadius: "50%",
            filter: "blur(150px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="font-mono badge-primary"
          style={{ display: "inline-flex", marginBottom: "1.5rem" }}
        >
          <Zap size={12} />
          LIVE RANKINGS
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "1rem",
          }}
        >
          <span style={{ color: "hsl(var(--foreground) / 0.9)" }}>APAROKSHA </span>
          <span className="gradient-text">LEADERBOARD</span>
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "hsl(var(--muted-foreground))",
            maxWidth: "600px",
            margin: "0 auto 2rem",
            lineHeight: 1.6,
          }}
        >
          Compete, earn points, and rise through the ranks at IIIT Allahabad&apos;s
          premier tech fest.
        </p>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass"
          style={{
            display: "inline-flex",
            gap: "2rem",
            padding: "1rem 2rem",
            borderRadius: "var(--radius)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              className="font-mono"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--primary))" }}
            >
              {leaderboard.length}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Users size={12} />
              Participants
            </div>
          </div>
          <div style={{ width: "1px", background: "hsl(var(--border))" }} />
          <div style={{ textAlign: "center" }}>
            <div
              className="font-mono"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--secondary))" }}
            >
              {totalPoints.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Zap size={12} />
              Total Points
            </div>
          </div>
          <div style={{ width: "1px", background: "hsl(var(--border))" }} />
          <div style={{ textAlign: "center" }}>
            <div
              className="font-mono"
              style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--success))" }}
            >
              {leaderboard[0]?.points || 0}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Trophy size={12} />
              Top Score
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-premium"
        style={{ borderRadius: "var(--radius)", overflow: "hidden" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid hsl(var(--border) / 0.5)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Trophy size={20} style={{ color: "hsl(var(--primary))" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Rankings
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={fetchLeaderboard}
              style={{
                background: "none",
                border: "none",
                color: "hsl(var(--primary))",
                cursor: "pointer",
                padding: "0.375rem",
                borderRadius: "var(--radius)",
                transition: "background 0.2s",
                display: "flex",
              }}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div
          className="leaderboard-row font-mono"
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "0.7rem",
            color: "hsl(var(--muted-foreground))",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            borderBottom: "1px solid hsl(var(--border) / 0.3)",
          }}
        >
          <div>Rank</div>
          <div>Participant</div>
          <div style={{ textAlign: "right" }}>Points</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: "2rem" }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "56px", marginBottom: "0.5rem", opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            <Trophy size={48} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>No participants yet</p>
            <p className="font-mono" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {/* Scan a QR code to earn your first points */}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                layout
                className={`leaderboard-row ${entry.rank <= 3 ? "top-3" : ""}`}
                style={{
                  borderBottom:
                    index < leaderboard.length - 1
                      ? "1px solid hsl(var(--border) / 0.15)"
                      : "none",
                  background:
                    entry.rank === 1
                      ? "hsla(45 100% 50% / 0.04)"
                      : entry.rank === 2
                        ? "hsla(0 0% 75% / 0.03)"
                        : entry.rank === 3
                          ? "hsla(25 60% 50% / 0.03)"
                          : "transparent",
                }}
              >
                {/* Rank */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {entry.rank <= 3 ? (
                    <div
                      className={getRankBgClass(entry.rank)}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.875rem",
                      }}
                    >
                      {getRankIcon(entry.rank)}
                    </div>
                  ) : (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Name + Email */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: entry.rank <= 3
                        ? "var(--gradient-primary)"
                        : "hsl(var(--muted))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      color: entry.rank <= 3 ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {getInitials(entry.name)}
                  </div>
                  <div>
                    <div
                      className={getRankClass(entry.rank)}
                      style={{
                        fontWeight: entry.rank <= 3 ? 700 : 500,
                        fontSize: entry.rank <= 3 ? "1rem" : "0.9375rem",
                      }}
                    >
                      {entry.name}
                    </div>
                    <div
                      className="font-mono"
                      style={{
                        fontSize: "0.75rem",
                        color: "hsl(var(--muted-foreground))",
                        marginTop: "2px",
                      }}
                    >
                      {entry.email.replace("@iiita.ac.in", "")}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`font-mono ${getRankClass(entry.rank)}`}
                    style={{
                      fontSize: entry.rank <= 3 ? "1.25rem" : "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {entry.points.toLocaleString()}
                  </span>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: "hsl(var(--muted-foreground))",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    pts
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Auto-refresh indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: "center",
          marginTop: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <div
          className="animate-pulse-glow"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "hsl(var(--success))",
          }}
        />

      </motion.div>
    </div>
  );
}
