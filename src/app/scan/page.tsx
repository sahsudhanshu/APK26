"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { QrCode, Camera, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ScanPage() {
  const { data: session } = useSession();
  const [scanning, setScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setScanning(false);
  }, []);

  const claimPoints = async (eventId: string) => {
    setClaiming(true);
    stopCamera();

    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: data.message });
        toast.success(data.message);
      } else {
        setResult({ success: false, message: data.error });
        toast.error(data.error);
      }
    } catch {
      setResult({ success: false, message: "Network error" });
      toast.error("Failed to claim points");
    } finally {
      setClaiming(false);
    }
  };

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use BarcodeDetector API if available
    if ("BarcodeDetector" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      detector.detect(imageData).then((barcodes: Array<{ rawValue: string }>) => {
        if (barcodes.length > 0) {
          try {
            const payload = JSON.parse(barcodes[0].rawValue);
            if (payload.eventId) {
              claimPoints(payload.eventId);
              return;
            }
          } catch {
            // Not valid JSON
          }
        }
        if (scanning) {
          animFrameRef.current = requestAnimationFrame(scanFrame);
        }
      }).catch(() => {
        if (scanning) {
          animFrameRef.current = requestAnimationFrame(scanFrame);
        }
      });
    } else {
      // Fallback: just keep scanning - need jsQR library for full support
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const startCamera = async () => {
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
    } catch {
      toast.error("Camera access denied");
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current || !scanning) return;

    video.srcObject = streamRef.current;
    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {
        // Ignore autoplay errors; user gesture already started the stream
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.onloadedmetadata = tryPlay;
    }

    return () => {
      video.onloadedmetadata = null;
    };
  }, [scanning]);

  useEffect(() => {
    if (scanning) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scanning, scanFrame]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
        <div className="glass-premium" style={{ maxWidth: "400px", margin: "0 auto", padding: "3rem", borderRadius: "var(--radius)" }}>
          <QrCode size={48} style={{ color: "hsl(var(--primary))", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Login Required</h2>
          <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>
            {/* Sign in to scan QR codes */}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: "4rem", maxWidth: "600px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="font-mono badge-primary" style={{ display: "inline-flex", marginBottom: "1rem" }}>
            <Camera size={12} />
            QR SCANNER
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Scan Event <span className="gradient-text">QR Code</span>
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", marginTop: "0.5rem", fontSize: "0.9375rem" }}>
            Point your camera at the event QR code to claim points
          </p>
        </div>

        {/* Scanner Area */}
        <div
          className="glass-premium"
          style={{
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {scanning ? (
            <div style={{ padding: "1rem", display: "grid", gap: "1rem" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  borderRadius: "calc(var(--radius) - 0.25rem)",
                  overflow: "hidden",
                  background: "hsl(var(--background-secondary))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <video
                  ref={videoRef}
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", background: "#000" }}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {/* Scan overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: "200px",
                      height: "200px",
                      border: "2px solid hsl(var(--primary))",
                      borderRadius: "16px",
                      boxShadow: "0 0 30px hsl(var(--primary) / 0.3)",
                      position: "relative",
                    }}
                  >
                    <div style={{ position: "absolute", top: "-2px", left: "-2px", width: "30px", height: "30px", borderTop: "4px solid hsl(var(--primary))", borderLeft: "4px solid hsl(var(--primary))", borderRadius: "8px 0 0 0" }} />
                    <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "30px", height: "30px", borderTop: "4px solid hsl(var(--primary))", borderRight: "4px solid hsl(var(--primary))", borderRadius: "0 8px 0 0" }} />
                    <div style={{ position: "absolute", bottom: "-2px", left: "-2px", width: "30px", height: "30px", borderBottom: "4px solid hsl(var(--primary))", borderLeft: "4px solid hsl(var(--primary))", borderRadius: "0 0 0 8px" }} />
                    <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "30px", height: "30px", borderBottom: "4px solid hsl(var(--primary))", borderRight: "4px solid hsl(var(--primary))", borderRadius: "0 0 8px 0" }} />
                  </div>
                </div>
              </div>
              <button onClick={stopCamera} className="btn-danger" style={{ width: "100%" }}>
                Stop Scanning
              </button>
            </div>
          ) : claiming ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <Loader2 size={48} style={{ color: "hsl(var(--primary))", margin: "0 auto", animation: "spin 1s linear infinite" }} />
              <p className="font-mono" style={{ marginTop: "1rem", color: "hsl(var(--muted-foreground))" }}>
                {/* Claiming points... */}
              </p>
            </div>
          ) : result ? (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              {result.success ? (
                <>
                  <CheckCircle size={64} style={{ color: "hsl(var(--success))", margin: "0 auto 1rem" }} />
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--success))", marginBottom: "0.5rem" }}>
                    Points Claimed!
                  </h2>
                </>
              ) : (
                <>
                  <XCircle size={64} style={{ color: "hsl(var(--destructive))", margin: "0 auto 1rem" }} />
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--destructive))", marginBottom: "0.5rem" }}>
                    Claim Failed
                  </h2>
                </>
              )}
              <p className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                {result.message}
              </p>
              <button onClick={startCamera} className="btn-primary">
                <Camera size={16} /> Scan Again
              </button>
            </div>
          ) : (
            <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
              <div
                className="animate-float"
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto 2rem",
                  background: "hsl(var(--primary) / 0.1)",
                  borderRadius: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed hsl(var(--primary) / 0.3)",
                }}
              >
                <QrCode size={48} style={{ color: "hsl(var(--primary))" }} />
              </div>
              <button onClick={startCamera} className="btn-primary" style={{ fontSize: "1rem", padding: "1rem 2rem" }}>
                <Camera size={18} /> Start Scanning
              </button>
              <p className="font-mono" style={{ marginTop: "1rem", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                {/* Requires camera permission */}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
