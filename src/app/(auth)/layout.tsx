// app/login/layout.tsx
import React from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
