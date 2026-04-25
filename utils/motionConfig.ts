// utils/motionConfig.ts
import { MotionConfig } from "framer-motion";

export const springConfig = {
  type: "spring",
  stiffness: 120,  // lower for smoother animations
  damping: 20,     // reduce oscillation
  mass: 0.5,
  restDelta: 0.01,
};

export const reducedMotionConfig = {
  duration: 0.25,
  ease: "easeOut",
};
