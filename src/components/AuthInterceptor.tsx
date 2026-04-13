"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthInterceptor() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "InvalidEmail") {
      // Small timeout to ensure toaster is mounted
      setTimeout(() => {
        toast.error("Please login exclusively using your @iiita.ac.in email ID.", {
          duration: 8000,
          style: {
            background: "hsl(var(--destructive) / 0.9)",
            color: "#fff",
            border: "1px solid hsl(var(--border))",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "hsl(var(--destructive))",
          },
        });
      }, 500);
      router.replace("/");
    }
  }, [searchParams, router]);

  return null;
}
