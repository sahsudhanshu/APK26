"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "hsl(225 22% 10%)",
            color: "hsl(210 20% 98%)",
            border: "1px solid hsl(225 18% 20%)",
            borderRadius: "12px",
            fontFamily: "'Inter', 'Space Grotesk', sans-serif",
            fontSize: "0.875rem",
            boxShadow: "0 8px 32px hsla(225, 50%, 2%, 0.6)",
          },
          success: {
            iconTheme: {
              primary: "hsl(200, 100%, 55%)",
              secondary: "hsl(225, 25%, 4%)",
            },
          },
          error: {
            iconTheme: {
              primary: "hsl(0, 75%, 55%)",
              secondary: "hsl(210, 20%, 98%)",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
