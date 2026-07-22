import React, { useEffect, useRef, useState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LoadingScreenProps {
  backgroundColor?: string;
  countSpeed?: number;
  swipeDuration?: number;
  style?: React.CSSProperties;
  scrollBlock?: boolean;
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({
  backgroundColor = "#000000",
  countSpeed = 16,
  swipeDuration = 750,
  style,
  scrollBlock = true,
  onLoadingComplete,
}: LoadingScreenProps) {
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [swipe, setSwipe] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollBlockedRef = useRef(false);

  // Block scroll when loading
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    
    function preventScroll(e: Event) {
      e.preventDefault();
    }
    
    if (loading && scrollBlock && !scrollBlockedRef.current) {
      document.body.style.overflow = "hidden";
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      scrollBlockedRef.current = true;
    } else if ((!loading || scrollBlock === false) && scrollBlockedRef.current) {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll, false);
      window.removeEventListener("touchmove", preventScroll, false);
      scrollBlockedRef.current = false;
    }
    
    return () => {
      if (scrollBlockedRef.current) {
        document.body.style.overflow = "";
        window.removeEventListener("wheel", preventScroll, false);
        window.removeEventListener("touchmove", preventScroll, false);
        scrollBlockedRef.current = false;
      }
    };
  }, [loading, scrollBlock]);

  // Counting logic from 1 to 100
  useEffect(() => {
    if (!loading) return;
    
    if (count >= 100) {
      timerRef.current = setTimeout(() => {
        startTransition(() => setSwipe(true));
        timerRef.current = setTimeout(() => {
          startTransition(() => {
            setLoading(false);
            if (onLoadingComplete) onLoadingComplete();
          });
        }, swipeDuration);
      }, 350);
      return;
    }
    
    timerRef.current = setTimeout(() => {
      startTransition(() => setCount((c) => c + 1));
    }, countSpeed);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [count, loading, countSpeed, swipeDuration, onLoadingComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const swipeVariants = {
    initial: { y: 0 },
    animate: {
      y: "-100%",
      transition: { duration: swipeDuration / 1000, ease: [0.76, 0, 0.24, 1] },
    },
    exit: { y: "-100%" },
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            initial="initial"
            animate={swipe ? "animate" : "initial"}
            exit="exit"
            variants={swipeVariants}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              background: backgroundColor,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
            aria-label="Loading screen"
            role="dialog"
            aria-modal="true"
            tabIndex={0}
            aria-live="polite"
            aria-busy={loading}
            onKeyDown={(e) => {
              if (e.key === "Escape" && loading) {
                startTransition(() => setLoading(false));
              }
            }}
          >
            {/* Center: Razor-thin 100vw Horizontal White Progress Line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: "100vw",
                height: "1px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: `${count}%`,
                  height: "100%",
                  backgroundColor: "#FFFFFF",
                  transition: "width 0.08s linear",
                  boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
                }}
              />
            </div>

            {/* Bottom-Right: Large Google Sans Number + Baseline Percentage Symbol */}
            <div
              style={{
                position: "absolute",
                bottom: "2.5rem",
                right: "3.5rem",
                display: "flex",
                alignItems: "baseline",
                color: "#FFFFFF",
                fontFamily: "'Google Sans', 'Google Sans Text', 'Product Sans', sans-serif",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(5.5rem, 13vw, 11rem)",
                  fontWeight: 300,
                  lineHeight: 0.9,
                  letterSpacing: "-0.04em",
                }}
              >
                {count}
              </span>
              <span
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  fontWeight: 300,
                  marginLeft: "0.25rem",
                  lineHeight: 1,
                }}
              >
                %
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
