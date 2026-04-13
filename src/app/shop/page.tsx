"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Zap,
  Package,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ShopItemData {
  _id: string;
  name: string;
  cost: number;
  quantity: number;
}

export default function ShopPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShopItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shop/items")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (itemId: string) => {
    if (!session) {
      toast.error("Please login first");
      return;
    }

    setRedeeming(itemId);
    try {
      const res = await fetch("/api/shop/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        // Refresh items
        const updated = await fetch("/api/shop/items").then((r) => r.json());
        setItems(updated.items || []);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to redeem");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "2.5rem" }}
      >
        <div className="font-mono badge-secondary" style={{ display: "inline-flex", marginBottom: "1rem" }}>
          <ShoppingBag size={12} />
          REWARDS SHOP
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
          Redeem Your <span className="gradient-text-secondary">Rewards</span>
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", maxWidth: "500px", marginTop: "0.5rem" }}>
          Spend your hard-earned points on exclusive Aparoksha merchandise and prizes.
        </p>
        {session && (
          <div className="glass" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "var(--radius)", marginTop: "1rem" }}>
            <Zap size={16} style={{ color: "hsl(var(--primary))" }} />
            <span className="font-mono" style={{ fontWeight: 700, color: "hsl(var(--primary))" }}>
              {session.user.points}
            </span>
            <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>points available</span>
          </div>
        )}
      </motion.div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "250px" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-premium" style={{ textAlign: "center", padding: "4rem", borderRadius: "var(--radius)" }}>
          <Package size={48} style={{ color: "hsl(var(--muted-foreground))", margin: "0 auto 1rem", opacity: 0.3 }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600 }}>Shop is empty</p>
          <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {/* Check back later for awesome rewards */}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {items.map((item, index) => {
            const canAfford = session ? session.user.points >= item.cost : false;
            const inStock = item.quantity > 0;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-premium card-hover"
                style={{
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Item header orb */}
                <div
                  style={{
                    height: "100px",
                    background: "linear-gradient(135deg, hsl(var(--secondary) / 0.15), hsl(var(--primary) / 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "120px",
                      height: "120px",
                      background: "hsl(var(--secondary) / 0.1)",
                      borderRadius: "50%",
                      filter: "blur(40px)",
                    }}
                  />
                  <ShoppingBag size={36} style={{ color: "hsl(var(--secondary))", position: "relative" }} />
                </div>

                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.75rem" }}>{item.name}</h3>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div>
                      <span className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 800, color: "hsl(var(--secondary))" }}>
                        {item.cost}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginLeft: "0.25rem" }}>pts</span>
                    </div>
                    <span className={`badge ${inStock ? "badge-success" : "badge-destructive"}`}>
                      {inStock ? (
                        <><CheckCircle size={10} /> {item.quantity} left</>
                      ) : (
                        <><AlertCircle size={10} /> Sold Out</>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(item._id)}
                    disabled={!session || !canAfford || !inStock || redeeming === item._id}
                    className={inStock && canAfford ? "btn-primary" : "btn-secondary"}
                    style={{ marginTop: "auto", width: "100%", opacity: !inStock || !canAfford ? 0.5 : 1 }}
                  >
                    {redeeming === item._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : !session ? (
                      "Login to Redeem"
                    ) : !inStock ? (
                      "Out of Stock"
                    ) : !canAfford ? (
                      "Not Enough Points"
                    ) : (
                      <>
                        <Zap size={16} /> Redeem
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
