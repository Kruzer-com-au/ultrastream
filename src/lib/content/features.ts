export interface Feature {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  accentRgb: string;
}

export const features: Feature[] = [
  {
    id: "monetization",
    title: "YOUR MONEY STAYS YOURS",
    tagline: "0-5% platform fee. Not 50%. Not 30%. Yours.",
    description:
      "Smart subscriptions and peer-to-peer tipping mean your supporters pay YOU, not a corporation. Automatic payments flow directly to your wallet. No waiting 30 days for a check. No mysterious deductions.",
    icon: "COINS",
    accentColor: "#FFD700",
    accentRgb: "255, 215, 0",
  },
  {
    id: "viewer-rewards",
    title: "GET PAID TO WATCH",
    tagline: "Your time has value. We actually pay you for it.",
    description:
      "Proof-of-Engagement rewards you with KZR tokens for actually watching and participating. Share your bandwidth, earn more. This isn't fake channel points -- it's real value you can spend or save.",
    icon: "GEM",
    accentColor: "#00D4FF",
    accentRgb: "0, 212, 255",
  },
  {
    id: "discovery",
    title: "YOUR CONTENT WILL BE SEEN",
    tagline: "New creators get boosted, not buried.",
    description:
      "Our discovery system uses community engagement signals -- not corporate algorithms -- to surface content. New creators get an automatic boost. Your audience finds you because the community vouches for you, not because you gamed an algorithm.",
    icon: "RADAR",
    accentColor: "#7B2FF7",
    accentRgb: "123, 47, 247",
  },
  {
    id: "censorship-resistance",
    title: "NO ONE CAN SILENCE YOU",
    tagline: "Community-powered delivery. No single kill switch.",
    description:
      "Content flows through a community mesh network and lives on distributed storage. Rules are set by The Architects -- a community council, not a corporate boardroom. No single authority can pull the plug on your career overnight.",
    icon: "MEGAPHONE",
    accentColor: "#FF0040",
    accentRgb: "255, 0, 64",
  },
  {
    id: "privacy-verification",
    title: "VERIFY WITHOUT SURRENDERING",
    tagline: "We confirm your age, then forget everything.",
    description:
      "Other platforms store your government ID and get breached. We verify your age and scramble everything private. Nothing stored. Nothing to hack. Nothing to sell. Compliant with the latest FTC guidance -- because privacy isn't optional.",
    icon: "LOCK",
    accentColor: "#00F2EA",
    accentRgb: "0, 242, 234",
  },
  {
    id: "ultraverse",
    title: "PART OF SOMETHING BIGGER",
    tagline: "ULTRASTREAM + ULTRAVERSE.games = the future of gaming entertainment.",
    description:
      "ULTRASTREAM lives within the ULTRAVERSE.games ecosystem. Cross-platform benefits, shared community, unified token economy. Your streaming career connects to the entire gaming universe.",
    icon: "GALAXY",
    accentColor: "#8B5CF6",
    accentRgb: "139, 92, 246",
  },
];
