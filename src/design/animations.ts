export const springConfig = {
  gentle: {
    damping: 20,
    stiffness: 150,
  },
  default: {
    damping: 18,
    stiffness: 220,
  },
  snappy: {
    damping: 22,
    stiffness: 350,
  },
  bouncy: {
    damping: 10,
    stiffness: 280,
  },
  stiff: {
    damping: 30,
    stiffness: 500,
  },
};

export const timingConfig = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  deliberate: 600,
};

export const stagger = {
  tight: 30,
  normal: 50,
  loose: 80,
  slow: 120,
};

// Use for keyframe animations or repetitive sequences
export const shakeSequence = [-8, 8, -6, 6, -4, 4, 0];
