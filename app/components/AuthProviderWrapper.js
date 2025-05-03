'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../lib/authContext";

export function AuthProviderWrapper({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}