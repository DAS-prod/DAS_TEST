"use client";

import { useEffect, useState } from "react";

export default function IntroAnimation() {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the intro has already played in this browser
    const hasSeenIntro = localStorage.getItem("hasSeenIntroAnimation");

    if (hasSeenIntro) {
      return;
    }

    // First visit: Show intro and mark as seen
    setVisible(true);
    localStorage.setItem("hasSeenIntroAnimation", "true");

    // 0–2 seconds: logo
    const logoTimer = setTimeout(() => {
      setStage(1);
    }, 2000);

    // 2–4 seconds: tagline
    const taglineTimer = setTimeout(() => {
      setStage(2);
    }, 4000);

    // 4–5.3 seconds: hold everything
    const exitTimer = setTimeout(() => {
      setStage(3);
    }, 5300);

    // 6 seconds: remove intro
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[99999]
        flex items-center justify-center
        bg-[#f8f6ef]
        transition-opacity duration-700 ease-in-out
        ${stage === 3 ? "opacity-0" : "opacity-100"}
      `}
    >
      <div className="flex flex-col items-center text-center">

        {/* LOGO */}
        <div
          className={`
            transition-all duration-1000 ease-out
            ${
              stage >= 0
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-95 opacity-0"
            }
          `}
        >
          <img
            src="/logo.png"
            alt="Godavari Basket"
            className="
              w-[280px]
              object-contain
              sm:w-[380px]
              md:w-[460px]
            "
          />
        </div>

        {/* TAGLINE */}
        <div
          className={`
            transition-all duration-1000 ease-out
            ${
              stage >= 1
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }
          `}
        >
          <p
            className="
              mt-5
              text-[10px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#264e36]
              sm:text-xs
            "
          >
            Authentic Goodness From Godavari
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#8b5e34]/40" />
            <span className="text-sm text-[#264e36]">✦</span>
            <span className="h-px w-12 bg-[#8b5e34]/40" />
          </div>
        </div>

      </div>
    </div>
  );
}