import { ImageResponse } from "next/og";
import { siteMetadata } from "@/lib/metadata";

export const runtime = "edge";
export const alt = siteMetadata.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030305 0%, #0a0a1a 40%, #0d0520 70%, #030305 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow - neon blue */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,149,255,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Radial glow - purple */}
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "30%",
            width: "400px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(123,47,247,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Border glow top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(to right, transparent, #FFD700, #0095FF, transparent)",
          }}
        />

        {/* Border glow bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(to right, transparent, #7B2FF7, #FFD700, transparent)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ULTRA
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "#f0f0f5",
            }}
          >
            STREAM
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            letterSpacing: "0.25em",
            color: "#a0a0b0",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: "40px",
          }}
        >
          TAKE STREAMING BACK
        </div>

        {/* Description line */}
        <div
          style={{
            fontSize: "18px",
            color: "#606070",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          The decentralized streaming platform for creators and gamers
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "40px",
            fontSize: "16px",
            color: "#404050",
            letterSpacing: "0.1em",
          }}
        >
          ultrastream.gg
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
