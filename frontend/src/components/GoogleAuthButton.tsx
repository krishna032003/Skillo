"use client";

/**
 * GoogleAuthButton.tsx
 *
 * Uses a standard OAuth2 implicit-flow popup instead of FedCM / One-Tap
 * (One-Tap is blocked on localhost and in many browser configs).
 *
 * Flow:
 *  1. Click → opens popup to Google's OAuth2 authorization URL
 *  2. User grants all permissions (profile + Classroom) in one screen
 *  3. Google redirects popup to /auth/callback#id_token=xxx&access_token=xxx
 *  4. Callback page parses the hash and calls window.opener.postMessage()
 *  5. We receive both tokens, save them, and pre-fetch Classroom automatically
 *
 * Google Cloud Console setup required:
 *  - Authorised JavaScript origins: http://localhost:3000
 *  - Authorised redirect URIs:      http://localhost:3000/auth/callback
 *  - APIs enabled: Google Classroom API (classroom.googleapis.com)
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { API_BASE } from "@/services/api";
const CALLBACK_PATH = "/auth/callback";
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

interface GoogleAuthButtonProps {
  onSuccess: (userId: string, email: string, name: string, onboarded: boolean) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  customButton?: React.ReactNode;
}

type PostMessageData =
  | { type: "GOOGLE_AUTH_SUCCESS"; idToken: string; accessToken?: string }
  | { type: "GOOGLE_AUTH_ERROR"; error: string };

export default function GoogleAuthButton({
  onSuccess,
  onError,
  disabled = false,
  customButton,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const listenerRef = useRef<((e: MessageEvent) => void) | null>(null);

  /* ── Clean up message listener on unmount ── */
  useEffect(() => {
    return () => {
      if (listenerRef.current)
        window.removeEventListener("message", listenerRef.current);
    };
  }, []);

  /* ── Send the id_token to our backend ── */
  const exchangeToken = async (idToken: string, accessToken?: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken, access_token: accessToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail ?? `Server error ${res.status}`);
    }
    return res.json() as Promise<{ user_id: string; email: string; name: string; onboarded: boolean }>;
  };

  /* ── Open the Google OAuth popup ── */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || isLoading) return;
    setError(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      setError(
        "Google Client ID not set. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local and restart the dev server."
      );
      return;
    }

    const redirectUri = `${window.location.origin}${CALLBACK_PATH}`;
    const nonce = Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token token",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/classroom.courses.readonly",
        "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
        "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ].join(" "),
      nonce,
      prompt: "consent",
      access_type: "online",
    });
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    const left = Math.round(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2.5);
    const popup = window.open(
      authUrl,
      "google-signin",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      setError("Popup was blocked. Please allow pop-ups and try again.");
      return;
    }

    popupRef.current = popup;
    setIsLoading(true);

    if (listenerRef.current) window.removeEventListener("message", listenerRef.current);

    const handler = async (event: MessageEvent<PostMessageData>) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data?.type?.startsWith("GOOGLE_AUTH")) return;
      window.removeEventListener("message", handler);
      listenerRef.current = null;

      if (event.data.type === "GOOGLE_AUTH_ERROR") {
        const msg = event.data.error ?? "Google sign-in was cancelled.";
        setError(msg);
        onError?.(msg);
        setIsLoading(false);
        return;
      }

      try {
        const data = await exchangeToken(event.data.idToken, event.data.accessToken);
        if (event.data.accessToken) {
          localStorage.setItem("skillo_google_access_token", event.data.accessToken);
        }
        onSuccess(data.user_id, data.email, data.name, data.onboarded);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication failed.";
        setError(msg);
        onError?.(msg);
        setIsLoading(false);
      }
    };

    listenerRef.current = handler;
    window.addEventListener("message", handler);

    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed);
        if (listenerRef.current) {
          window.removeEventListener("message", listenerRef.current);
          listenerRef.current = null;
          setError("Sign-in window was closed.");
          setIsLoading(false);
        }
      }
    }, 500);
  };

  const isDisabled = disabled || isLoading;

  if (customButton) {
    return (
      <div onClick={handleClick} className={isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>
        {customButton}
        {error && <p className="text-[10px] text-red-400 mt-2 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
        className={[
          "relative w-full flex items-center justify-center gap-3",
          "px-5 py-3.5 rounded-xl",
          "bg-white text-[#1f1f1f] font-medium text-sm",
          "transition-all duration-150",
          "shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
          isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100 active:bg-gray-200",
        ].join(" ")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
              Signing in…
            </motion.span>
          ) : (
            <motion.span key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Continue with Google
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      {error && <p className="text-xs text-red-400 text-center mt-3">{error}</p>}
    </div>
  );
}

