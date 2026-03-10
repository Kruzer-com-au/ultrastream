export const tokens = {
  colors: {
    void: "#050505",
    abyss: "#0a0a0a",
    obsidian: "#111111",
    gunmetal: "#1a1a2e",
    slateDark: "#16213e",
    neonBlue: "#00d4ff",
    neonPurple: "#7b2ff7",
    neonRed: "#ff0040",
    neonPink: "#ff00ff",
    electricViolet: "#8b5cf6",
    gold: "#ffd700",
    goldDark: "#b8860b",
    goldLight: "#ffe55c",
    textPrimary: "#f0f0f0",
    textSecondary: "#a0a0b0",
    textMuted: "#6b7280",
  },
  spacing: {
    section: "6rem",
    sectionMobile: "3rem",
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  transitions: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeInOutExpo: "cubic-bezier(0.87, 0, 0.13, 1)",
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      glacial: "1000ms",
    },
  },
} as const;

export const gradients = {
  goldText: "linear-gradient(90deg, #b8860b, #ffd700, #ffe55c)",
  neonBlue: "linear-gradient(135deg, #00d4ff, #7b2ff7)",
  neonPurple: "linear-gradient(135deg, #7b2ff7, #ff00ff)",
  neonRed: "linear-gradient(135deg, #ff0040, #ff00ff)",
  darkFade: "linear-gradient(180deg, #0a0a0a, #050505)",
  sectionDivider: "linear-gradient(90deg, transparent, #7b2ff7, transparent)",
} as const;

export const shadows = {
  neonBlue:
    "0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)",
  neonPurple:
    "0 0 20px rgba(123, 47, 247, 0.3), 0 0 60px rgba(123, 47, 247, 0.1)",
  gold: "0 0 20px rgba(255, 215, 0, 0.3), 0 0 60px rgba(255, 215, 0, 0.1)",
  card: "0 4px 24px rgba(0, 0, 0, 0.5)",
  cardHover: "0 8px 40px rgba(0, 0, 0, 0.7)",
} as const;
