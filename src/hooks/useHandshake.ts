"use client";

import { useEffect, useRef, useState } from "react";
import type { HandshakeStep } from "@/lib/types";

const HANDSHAKE_STEPS: Omit<HandshakeStep, "status">[] = [
  { id: 1, label: "Establishing Diffie-Hellman key exchange..." },
  { id: 2, label: "Exchanging ephemeral public session keys..." },
  { id: 3, label: "Completing cryptographic handshake..." },
  { id: 4, label: "Securing channel with 256-bit AES-GCM..." },
];

const STEP_DURATION_MS = 1200;

export function useHandshake(onComplete: () => void) {
  const [steps, setSteps] = useState<HandshakeStep[]>(
    HANDSHAKE_STEPS.map((step, index) => ({
      ...step,
      status: index === 0 ? "active" : "pending",
    })),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isComplete) {
      return;
    }

    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, index) => {
          if (index < currentStep) {
            return { ...step, status: "complete" };
          }
          if (index === currentStep) {
            return { ...step, status: "complete" };
          }
          if (index === currentStep + 1) {
            return { ...step, status: "active" };
          }
          return step;
        }),
      );

      if (currentStep >= HANDSHAKE_STEPS.length - 1) {
        setIsComplete(true);
        onCompleteRef.current();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [currentStep, isComplete]);

  return { steps, isComplete, progress: ((currentStep + 1) / HANDSHAKE_STEPS.length) * 100 };
}
