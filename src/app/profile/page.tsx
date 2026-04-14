"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Zap,
  Calendar,
  Clock,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface ClaimEntry {
  _id: string;
  type: "participation" | "winner" | "manual";
  points: number;
  addedBy: string;
  timestamp: string;
  reason?: string;
  eventId?: { name: string } | null;
}

interface RedemptionEntry {
  _id: string;
  status: "pending" | "completed";
  timestamp: string;
  itemId?: { name: string; cost: number } | null;
}

interface ProfileData {
  user: {
    name: string;
    email: string;
    totalPoints: number;
    availablePoints: number;
    role: string;
    createdAt: string;
    phone?: string;
    image?: string;
  };
  claims: ClaimEntry[];
  redemptions: RedemptionEntry[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Name edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const updateName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => (p ? { ...p, user: { ...p.user, name: data.name } } : null));
        setIsEditingName(false);
        toast.success("Name updated successfully!");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingImage(true);
    try {
      // Compress using canvas
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      
      const canvas = document.createElement("canvas");
      const maxSize = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
      URL.revokeObjectURL(objectUrl);
      
      if (compressedBase64.length > 150 * 1024) {
        toast.error("Image is still too large. Please use a smaller file.");
        setUploadingImage(false);
        return;
      }

      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedBase64 }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => (p ? { ...p, user: { ...p.user, image: data.image } } : null));
        toast.success("Profile photo updated!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Failed to process image");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then(setProfile)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <Loader2 size={40} style={{ color: "hsl(var(--primary))", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div className="glass-premium" style={{ maxWidth: "400px", margin: "0 auto", padding: "3rem", borderRadius: "var(--radius)" }}>
          <User size={48} style={{ color: "hsl(var(--primary))", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Login Required</h2>
          <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>
            {/* Sign in with your @iiita.ac.in account */}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* User Card */}
        <div
          className="glass-premium"
          style={{
            padding: "2.5rem",
            borderRadius: "var(--radius)",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "var(--gradient-primary)" }} />

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2rem" }}>
            {/* Avatar */}
            <div
              style={{ position: "relative", width: "80px", height: "80px", flexShrink: 0 }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "hsl(var(--primary-foreground))",
                  overflow: "hidden",
                }}
              >
                {profile.user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profile.user.image} alt={profile.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  profile.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                )}
              </div>
              
              <label
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  background: "hsl(var(--secondary))",
                  color: "hsl(var(--secondary-foreground))",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "2px solid hsl(var(--background))",
                  transition: "transform 0.2s"
                }}
                className="hover:scale-110"
                title="Change Profile Photo"
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
              </label>
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              {isEditingName ? (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem", alignItems: "center" }}>
                  <input
                    className="input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ padding: "0.25rem 0.5rem", width: "200px" }}
                    placeholder="Enter custom name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateName();
                      else if (e.key === "Escape") setIsEditingName(false);
                    }}
                    autoFocus
                  />
                  <button onClick={updateName} disabled={savingName} className="btn-primary" style={{ padding: "0.25rem", minWidth: "32px", height: "32px" }}>
                    {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button onClick={() => setIsEditingName(false)} disabled={savingName} className="btn-secondary" style={{ padding: "0.25rem", minWidth: "32px", height: "32px" }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  {profile.user.name}
                  <button
                    onClick={() => {
                      setNewName(profile.user.name);
                      setIsEditingName(true);
                    }}
                    className="btn-secondary"
                    style={{ padding: "0.25rem", background: "none", border: "none", color: "hsl(var(--muted-foreground))" }}
                    title="Change Name"
                  >
                    <Pencil size={14} />
                  </button>
                </h1>
              )}
              <p className="font-mono" style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.75rem" }}>
                {profile.user.email}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {profile.user.role === "admin" && (
                  <span className="badge badge-secondary">
                    <Shield size={10} /> Admin
                  </span>
                )}
                <span className="badge badge-primary">
                  <Calendar size={10} /> Joined {new Date(profile.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Points Card */}
            <div
              className="glass animate-pulse-glow"
              style={{
                padding: "1.5rem 2rem",
                borderRadius: "var(--radius)",
                textAlign: "center",
                minWidth: "150px",
              }}
            >
              <div className="font-mono gradient-text" style={{ fontSize: "2.5rem", fontWeight: 800 }}>
                {profile.user.totalPoints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: "0.25rem", justifyContent: "center" }}>
                <Zap size={12} /> Total Points
              </div>
              <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.5rem" }}>
                Available: {profile.user.availablePoints}
              </div>
            </div>
          </div>
        </div>

        {/* Claims History */}
        <div className="glass-premium" style={{ borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid hsl(var(--border) / 0.5)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <History size={20} style={{ color: "hsl(var(--primary))" }} />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Points History</h2>
            <span className="badge badge-primary" style={{ marginLeft: "auto" }}>{profile.claims.length}</span>
          </div>

          {profile.claims.length === 0 ? (
            <div style={{ padding: "3rem 2rem", textAlign: "center", color: "hsl(var(--muted-foreground))" }}>
              <History size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
              <p>No claims yet. Scan a QR code to earn points!</p>
            </div>
          ) : (
            <div>
              {profile.claims.map((claim, i) => (
                <motion.div
                  key={claim._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 2rem",
                    borderBottom: i < profile.claims.length - 1 ? "1px solid hsl(var(--border) / 0.15)" : "none",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: claim.points > 0
                          ? "hsl(var(--success) / 0.15)"
                          : "hsl(var(--destructive) / 0.15)",
                      }}
                    >
                      {claim.points > 0
                        ? <ArrowUpRight size={16} style={{ color: "hsl(var(--success))" }} />
                        : <ArrowDownRight size={16} style={{ color: "hsl(var(--destructive))" }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.9375rem" }}>
                        {claim.eventId?.name || claim.reason || "Manual Adjustment"}
                      </div>
                      <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span className={`badge ${claim.type === "participation" ? "badge-primary" : claim.type === "winner" ? "badge-success" : "badge-warning"}`} style={{ padding: "0.125rem 0.5rem", fontSize: "0.625rem" }}>
                          {claim.type}
                        </span>
                        <Clock size={10} /> {new Date(claim.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: claim.points > 0 ? "hsl(var(--success))" : "hsl(var(--destructive))",
                    }}
                  >
                    {claim.points > 0 ? "+" : ""}{claim.points}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Redemptions */}
        {profile.redemptions.length > 0 && (
          <div className="glass-premium" style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid hsl(var(--border) / 0.5)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Zap size={20} style={{ color: "hsl(var(--secondary))" }} />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Redemptions</h2>
            </div>
            {profile.redemptions.map((r, i) => (
              <div
                key={r._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 2rem",
                  borderBottom: i < profile.redemptions.length - 1 ? "1px solid hsl(var(--border) / 0.15)" : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{r.itemId?.name || "Unknown Item"}</div>
                  <div className="font-mono" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                    {new Date(r.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="font-mono" style={{ color: "hsl(var(--secondary))", fontWeight: 700 }}>
                    -{r.itemId?.cost || 0} pts
                  </span>
                  <span className={`badge ${r.status === "completed" ? "badge-success" : "badge-warning"}`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
