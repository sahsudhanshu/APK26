"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Shield,
  Plus,
  QrCode,
  Users,
  ScrollText,
  Loader2,
  Search,
  RefreshCw,
  Clock,
  Zap,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Power,
  PowerOff,
} from "lucide-react";

interface EventData {
  _id: string;
  name: string;
  pointsParticipation: number;
  pointsWinner: number;
  active: boolean;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  points: number;
  role: string;
}

interface LogEntry {
  _id: string;
  userId: { name: string; email: string } | null;
  eventId: { name: string } | null;
  type: string;
  points: number;
  addedBy: string;
  timestamp: string;
  reason?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"events" | "manual" | "logs" | "shop">("events");

  // Events state
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventParticipation, setEventParticipation] = useState("");
  const [eventWinner, setEventWinner] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // QR state
  const [qrData, setQrData] = useState<{ url: string; eventName: string } | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [togglingEvent, setTogglingEvent] = useState<string | null>(null);

  // Manual points state
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [manualPoints, setManualPoints] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Shop state
  const [shopName, setShopName] = useState("");
  const [shopCost, setShopCost] = useState("");
  const [shopQuantity, setShopQuantity] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events/create");
      const data = await res.json();
      if (data.events) setEvents(data.events);
    } catch {
      console.error("Failed to fetch events");
    }
  }, []);

  const fetchLogs = useCallback(async (page: number) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/logs?page=${page}&limit=20`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      console.error("Failed to fetch logs");
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchEvents();
    }
  }, [session, fetchEvents]);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs(logsPage);
  }, [activeTab, logsPage, fetchLogs]);

  // User search debounce
  useEffect(() => {
    if (userSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users?q=${encodeURIComponent(userSearch)}`);
        const data = await res.json();
        setSearchResults(data.users || []);
      } catch {
        console.error("Search failed");
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch]);

  if (status === "loading") {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <Loader2 size={40} style={{ color: "hsl(var(--primary))", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div className="glass-premium" style={{ maxWidth: "400px", margin: "0 auto", padding: "3rem", borderRadius: "var(--radius)" }}>
          <Shield size={48} style={{ color: "hsl(var(--destructive))", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Access Denied</h2>
          <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>
            {/* Admin privileges required */}
          </p>
        </div>
      </div>
    );
  }

  const createEvent = async () => {
    if (!eventName || !eventParticipation) {
      toast.error("Name and participation points are required");
      return;
    }
    setCreatingEvent(true);
    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          pointsParticipation: parseInt(eventParticipation),
          pointsWinner: parseInt(eventWinner) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Event "${eventName}" created`);
        setEventName("");
        setEventParticipation("");
        setEventWinner("");
        fetchEvents();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const generateQR = async (eventId: string) => {
    setGeneratingQR(eventId);
    try {
      const res = await fetch("/api/events/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrData({ url: data.qrDataUrl, eventName: data.eventName });
        toast.success("QR generated — valid while event is active");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to generate QR");
    } finally {
      setGeneratingQR(null);
    }
  };

  const toggleEvent = async (eventId: string, currentActive: boolean) => {
    setTogglingEvent(eventId);
    try {
      const res = await fetch("/api/events/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, active: !currentActive }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Event ${!currentActive ? "activated" : "deactivated"}`);
        fetchEvents();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to toggle event");
    } finally {
      setTogglingEvent(null);
    }
  };

  const submitManualPoints = async () => {
    if (!selectedUser || !manualPoints || !manualReason) {
      toast.error("Select user, enter points and reason");
      return;
    }
    setSubmittingManual(true);
    try {
      const res = await fetch("/api/admin/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          points: parseInt(manualPoints),
          reason: manualReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${parseInt(manualPoints) > 0 ? "Added" : "Deducted"} points for ${data.user.name}`);
        setSelectedUser(null);
        setManualPoints("");
        setManualReason("");
        setUserSearch("");
        setSearchResults([]);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to update points");
    } finally {
      setSubmittingManual(false);
    }
  };

  const createShopItem = async () => {
    if (!shopName || !shopCost || !shopQuantity) {
      toast.error("All fields required");
      return;
    }
    setCreatingItem(true);
    try {
      const res = await fetch("/api/shop/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shopName,
          cost: parseInt(shopCost),
          quantity: parseInt(shopQuantity),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Item "${shopName}" created`);
        setShopName("");
        setShopCost("");
        setShopQuantity("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to create item");
    } finally {
      setCreatingItem(false);
    }
  };

  const tabs = [
    { id: "events" as const, name: "Events & QR", icon: QrCode },
    { id: "manual" as const, name: "Manual Points", icon: Users },
    { id: "logs" as const, name: "Activity Logs", icon: ScrollText },
    { id: "shop" as const, name: "Shop Items", icon: ShoppingBag },
  ];

  return (
    <div className="container-wide" style={{ paddingBottom: "4rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div className="font-mono badge-secondary" style={{ display: "inline-flex", marginBottom: "0.75rem" }}>
            <Shield size={12} />
            ADMIN PANEL
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Dashboard
          </h1>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Sidebar */}
          <div style={{ width: "220px", flexShrink: 0 }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                  style={{ marginBottom: "0.5rem" }}
                >
                  <Icon size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="glass-subtle" style={{ flex: 1, padding: "2rem", borderRadius: "var(--radius)", minWidth: 0 }}>
            {/* EVENTS TAB */}
            {activeTab === "events" && (
              <div>
                {/* Create Event Form */}
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Plus size={20} style={{ color: "hsl(var(--primary))" }} />
                  Create Event
                </h2>
                <div className="responsive-grid" style={{ marginBottom: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Event Name</label>
                    <input className="input" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Code Sprint" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Participation Pts</label>
                    <input className="input" type="number" value={eventParticipation} onChange={(e) => setEventParticipation(e.target.value)} placeholder="10" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Winner Pts</label>
                    <input className="input" type="number" value={eventWinner} onChange={(e) => setEventWinner(e.target.value)} placeholder="50" />
                  </div>
                </div>
                <button onClick={createEvent} disabled={creatingEvent} className="btn-primary">
                  {creatingEvent ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Event
                </button>

                <hr style={{ border: "none", borderTop: "1px solid hsl(var(--border) / 0.3)", margin: "2rem 0" }} />

                {/* QR Display */}
                {qrData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium glow-primary"
                    style={{
                      padding: "2rem",
                      borderRadius: "var(--radius)",
                      textAlign: "center",
                      marginBottom: "2rem",
                    }}
                  >
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                      QR for: {qrData.eventName}
                    </h3>
                    <div className="badge badge-success" style={{ marginBottom: "1rem" }}>
                      <Power size={10} /> Active — No expiry
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrData.url}
                      alt="QR Code"
                      style={{ maxWidth: "300px", margin: "0 auto", borderRadius: "12px" }}
                    />
                    <p className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "1rem" }}>
                      {/* Valid while event is active. Deactivate event to stop claims. */}
                    </p>
                  </motion.div>
                )}

                {/* Events List */}
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ScrollText size={16} />
                  Existing Events ({events.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="card"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                        opacity: event.active ? 1 : 0.6,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <span style={{ fontWeight: 600 }}>{event.name}</span>
                          <span className={`badge ${event.active ? "badge-success" : "badge-destructive"}`} style={{ fontSize: "0.625rem", padding: "0.125rem 0.5rem" }}>
                            {event.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                        <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "flex", gap: "1rem" }}>
                          <span>Participation: <strong style={{ color: "hsl(var(--primary))" }}>{event.pointsParticipation}</strong></span>
                          <span>Winner: <strong style={{ color: "hsl(var(--success))" }}>{event.pointsWinner}</strong></span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => toggleEvent(event._id, event.active)}
                          disabled={togglingEvent === event._id}
                          className={event.active ? "btn-danger" : "btn-primary"}
                          style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}
                        >
                          {togglingEvent === event._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : event.active ? (
                            <PowerOff size={14} />
                          ) : (
                            <Power size={14} />
                          )}
                          {event.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => generateQR(event._id)}
                          disabled={generatingQR === event._id}
                          className="btn-secondary"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}
                        >
                          {generatingQR === event._id ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                          QR Code
                        </button>
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", textAlign: "center", padding: "2rem" }}>
                      {/* No events created yet */}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* MANUAL POINTS TAB */}
            {activeTab === "manual" && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Zap size={20} style={{ color: "hsl(var(--primary))" }} />
                  Manual Points Adjustment
                </h2>

                {/* Search */}
                <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "hsl(var(--muted-foreground))" }} />
                  <input
                    className="input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Search user by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div
                      className="glass"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        borderRadius: "var(--radius)",
                        zIndex: 20,
                        maxHeight: "200px",
                        overflow: "auto",
                      }}
                    >
                      {searchResults.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchResults([]);
                            setUserSearch("");
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background: "none",
                            border: "none",
                            borderBottom: "1px solid hsl(var(--border) / 0.3)",
                            cursor: "pointer",
                            color: "hsl(var(--foreground))",
                            textAlign: "left",
                            transition: "background 0.2s",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 500 }}>{u.name}</div>
                            <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>{u.email}</div>
                          </div>
                          <span className="font-mono" style={{ color: "hsl(var(--primary))" }}>{u.points} pts</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUser && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="card" style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedUser.name}</div>
                        <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>{selectedUser.email}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="font-mono" style={{ fontSize: "1.25rem", fontWeight: 700, color: "hsl(var(--primary))" }}>{selectedUser.points}</div>
                        <div style={{ fontSize: "0.625rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.1em" }}>current pts</div>
                      </div>
                    </div>

                    <div className="responsive-grid" style={{ marginBottom: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Points (+/-)</label>
                        <input className="input" type="number" value={manualPoints} onChange={(e) => setManualPoints(e.target.value)} placeholder="+10 or -5" />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Reason (required)</label>
                        <input className="input" value={manualReason} onChange={(e) => setManualReason(e.target.value)} placeholder="e.g. Won hackathon, manual correction..." />
                      </div>
                    </div>

                    <button onClick={submitManualPoints} disabled={submittingManual} className="btn-primary">
                      {submittingManual ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                      Apply Points
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* LOGS TAB */}
            {activeTab === "logs" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ScrollText size={20} style={{ color: "hsl(var(--primary))" }} />
                    Activity Logs
                  </h2>
                  <button onClick={() => fetchLogs(logsPage)} className="btn-secondary" style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>
                    <RefreshCw size={14} />
                  </button>
                </div>

                {loadingLogs ? (
                  <div style={{ textAlign: "center", padding: "3rem" }}>
                    <Loader2 size={32} style={{ color: "hsl(var(--primary))", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {logs.map((log) => (
                        <div key={log._id} className="card" style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: log.points > 0 ? "hsl(var(--success) / 0.15)" : "hsl(var(--destructive) / 0.15)",
                                  flexShrink: 0,
                                }}
                              >
                                {log.points > 0 ? <ArrowUpRight size={14} style={{ color: "hsl(var(--success))" }} /> : <ArrowDownRight size={14} style={{ color: "hsl(var(--destructive))" }} />}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                  {log.userId?.name || "Unknown"} — {log.eventId?.name || log.reason || "Manual"}
                                </div>
                                <div className="font-mono" style={{ fontSize: "0.6875rem", color: "hsl(var(--muted-foreground))", display: "flex", gap: "0.75rem", marginTop: "0.125rem", flexWrap: "wrap" }}>
                                  <span className={`badge ${log.type === "participation" ? "badge-primary" : log.type === "winner" ? "badge-success" : "badge-warning"}`} style={{ padding: "0.0625rem 0.375rem", fontSize: "0.5625rem" }}>
                                    {log.type}
                                  </span>
                                  <span>by {log.addedBy}</span>
                                  <span><Clock size={9} style={{ display: "inline" }} /> {new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <span className="font-mono" style={{ fontWeight: 700, fontSize: "0.9375rem", color: log.points > 0 ? "hsl(var(--success))" : "hsl(var(--destructive))", flexShrink: 0 }}>
                              {log.points > 0 ? "+" : ""}{log.points}
                            </span>
                          </div>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <p className="font-mono" style={{ textAlign: "center", padding: "3rem", color: "hsl(var(--muted-foreground))" }}>
                          {/* No activity logged yet */}
                        </p>
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                        <button disabled={logsPage <= 1} onClick={() => setLogsPage((p) => p - 1)} className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                          Previous
                        </button>
                        <span className="font-mono" style={{ display: "flex", alignItems: "center", fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                          {logsPage} / {totalPages}
                        </span>
                        <button disabled={logsPage >= totalPages} onClick={() => setLogsPage((p) => p + 1)} className="btn-secondary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}>
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* SHOP ITEMS TAB */}
            {activeTab === "shop" && (
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ShoppingBag size={20} style={{ color: "hsl(var(--secondary))" }} />
                  Create Shop Item
                </h2>
                <div className="responsive-grid" style={{ marginBottom: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Item Name</label>
                    <input className="input" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. T-Shirt" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Cost (Points)</label>
                    <input className="input" type="number" value={shopCost} onChange={(e) => setShopCost(e.target.value)} placeholder="100" />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "block", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quantity</label>
                    <input className="input" type="number" value={shopQuantity} onChange={(e) => setShopQuantity(e.target.value)} placeholder="50" />
                  </div>
                </div>
                <button onClick={createShopItem} disabled={creatingItem} className="btn-primary">
                  {creatingItem ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Item
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
