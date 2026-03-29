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
            <div
              style={{
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: 900,
                color: "#0C0E13",
              }}
            >
              ↑
            </div>
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Culture Hires
          </div>
        </div>

        {/* Headline line 1 */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#1C1917",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            display: "flex",
          }}
        >
          Your talent matters,
        </div>

        {/* Headline line 2 */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#FF5C2C",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          not your college tag.
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "22px",
            color: "#78716C",
            textAlign: "center",
            maxWidth: "560px",
            lineHeight: 1.5,
            display: "flex",
          }}
        >
          Fair hiring for every fresher. No unpaid roles. No bias. Pure meritocracy.
        </div>
      </div>
    ),
    { ...size }
  );
}
