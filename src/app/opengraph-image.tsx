import { ImageResponse } from "next/og";

export const alt = "Culture Hires — Fair Hiring for Every Fresher";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          backgroundColor: "#faf7f2",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-40px",
            width: "500px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(255,92,44,0.1) 0%, transparent 65%)",
          }}
        />

        {/* Logo + Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "#BBFF3B",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <path
                d="M15 22 L15 8"
                stroke="#0C0E13"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M10 13.5 L15 8 L20 13.5"
                stroke="#0C0E13"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 20 L19 20"
                stroke="#0C0E13"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.02em",
            }}
          >
            Culture Hires
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#1C1917",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            marginBottom: "20px",
          }}
        >
          Your talent matters,
          <br />
          <span style={{ color: "#FF5C2C" }}>not your college tag.</span>
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "22px",
            color: "#78716C",
            textAlign: "center",
            maxWidth: "560px",
            lineHeight: 1.5,
          }}
        >
          Fair hiring for every fresher. No unpaid roles. No bias. Pure
          meritocracy.
        </div>
      </div>
    ),
    { ...size }
  );
}
