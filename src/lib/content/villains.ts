export interface Villain {
  id: "twitch" | "youtube" | "tiktok" | "discord";
  name: string;
  icon: string;
  color: string;
  colorRgb: string;
  painPoint: string;
  details: string;
  solution: string;
  solutionIcon: string;
}

export const villains: Villain[] = [
  {
    id: "twitch",
    name: "TWITCH",
    icon: "TV",
    color: "#9146FF",
    colorRgb: "145, 70, 255",
    painPoint: "TAKES 50% OF EVERYTHING YOU EARN",
    details:
      "Standard affiliates lose 50% of every $4.99 sub. Even the mythical Partner Plus 70/30 split is temporary and requires you to maintain 350+ paid subs for months. Miss a month? Back to 50/50. They profit from YOUR audience.",
    solution:
      "Keep 95-100% of your earnings. Automatic payments flow directly to your wallet -- no middleman taking half. No mysterious deductions. No waiting 30 days for a check that's already been gutted.",
    solutionIcon: "VAULT",
  },
  {
    id: "youtube",
    name: "YOUTUBE",
    icon: "EYE",
    color: "#FF0000",
    colorRgb: "255, 0, 0",
    painPoint: "AN ALGORITHM THAT DECIDES IF YOU EXIST",
    details:
      "YouTube's algorithm is a black box that buries new creators under established channels. One policy change can tank your reach overnight. Demonetization strikes hit without warning, without explanation, without recourse.",
    solution:
      "Our discovery engine boosts new creators from day one. Your content gets seen based on community engagement, not corporate algorithms. No demonetization roulette -- your revenue is yours by design.",
    solutionIcon: "SIGNAL",
  },
  {
    id: "tiktok",
    name: "TIKTOK",
    icon: "MASK",
    color: "#00F2EA",
    colorRgb: "0, 242, 234",
    painPoint: "CENSORS YOUR VOICE, SELLS YOUR DATA",
    details:
      "Shadow bans are real. Content suppression is policy. Your biometric data, your viewing habits, your messages -- all harvested and monetized. You're not the user. You're the product being sold.",
    solution:
      "Community-powered delivery means no single authority can silence you. Community-run moderation rules, not corporate censorship. Your data stays scrambled and private -- nothing stored, nothing to sell.",
    solutionIcon: "SHIELD",
  },
  {
    id: "discord",
    name: "DISCORD",
    icon: "TOMB",
    color: "#5865F2",
    colorRgb: "88, 101, 242",
    painPoint: "ZERO DISCOVERY. YOUR COMMUNITY IS A WALLED GRAVE.",
    details:
      "Your server is invisible unless you spam invite links everywhere. No organic discovery. No algorithm helps you grow. Discord profits from Nitro while your community sits in a sealed tomb that nobody new can find.",
    solution:
      "Built-in discovery from day one. Your community isn't hidden behind invite links -- it's part of a living ecosystem where new viewers find new creators naturally. Growth is the default, not the exception.",
    solutionIcon: "COMPASS",
  },
];
