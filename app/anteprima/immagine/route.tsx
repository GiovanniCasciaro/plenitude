import { ImageResponse } from "next/og";
import {
  ENOVA_GRADIENT,
  PREVIEW_HEADLINE,
  PREVIEW_SUBLINE,
  PREVIEW_TILES,
} from "@/lib/preview-collage";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            height: 10,
            width: "100%",
            background: ENOVA_GRADIENT,
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "36px 40px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 72,
                height: 28,
                borderRadius: 6,
                background: "#009e62",
              }}
            />
            <span
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 700,
                color: "#009e62",
              }}
            >
              Plenitude Leader
            </span>
          </div>

          <p
            style={{
              display: "flex",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#009e62",
              marginBottom: 10,
            }}
          >
            Collabora con noi
          </p>
          <h1
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.2,
              color: "#009e62",
              marginBottom: 14,
              maxWidth: 520,
            }}
          >
            {PREVIEW_HEADLINE}
          </h1>
          <p
            style={{
              display: "flex",
              fontSize: 18,
              lineHeight: 1.45,
              color: "#5a6478",
              marginBottom: 28,
              maxWidth: 520,
            }}
          >
            {PREVIEW_SUBLINE}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 28,
            }}
          >
            {PREVIEW_TILES.map((tile) => (
              <div
                key={tile.title}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  width: 248,
                  height: 118,
                  borderRadius: 14,
                  background: tile.accent,
                  color: "#ffffff",
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    display: "flex",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {tile.label}
                </p>
                <p
                  style={{
                    display: "flex",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {tile.title}
                </p>
                <p style={{ display: "flex", fontSize: 14, lineHeight: 1.35 }}>
                  {tile.detail}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #009e62 0%, #007a4c 100%)",
              color: "#ffffff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Scopri Plenitude Leader
              </p>
              <p style={{ display: "flex", fontSize: 16, opacity: 0.92 }}>
                plenitudeleader.it
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 42,
                height: 42,
                borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                fontSize: 24,
              }}
            >
              →
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 920,
    },
  );
}
