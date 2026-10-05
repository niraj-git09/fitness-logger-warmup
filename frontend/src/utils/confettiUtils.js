import confetti from 'canvas-confetti';

/**
 * Fires an energetic, multi-stage celebratory confetti burst
 * when a fitness goal is reached, crushed, or celebrated.
 */
export const triggerGoalCrushedConfetti = () => {
  const count = 180;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 99999,
    colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
  };

  const fire = (particleRatio, opts) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  };

  // Stage 1: Central fountain blast
  fire(0.25, {
    spread: 26,
    startVelocity: 55
  });

  // Stage 2: Medium spread
  fire(0.2, {
    spread: 60
  });

  // Stage 3: Wide aerial cloud
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });

  // Stage 4: High velocity floats
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45
  });

  // Stage 5: Side cannons after 250ms for extra dynamic excitement
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      zIndex: 99999,
      colors: ['#10b981', '#06b6d4', '#f59e0b']
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      zIndex: 99999,
      colors: ['#10b981', '#3b82f6', '#ec4899']
    });
  }, 250);
};

/**
 * Snappy celebratory pop when an individual workout session is logged.
 */
export const triggerWorkoutLoggedBurst = () => {
  confetti({
    particleCount: 65,
    spread: 70,
    origin: { y: 0.78 },
    zIndex: 99999,
    colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b']
  });
};
