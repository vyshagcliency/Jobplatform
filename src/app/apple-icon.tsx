import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#BBFF3B",
          borderRadius: "36px",
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 30 30"
          fill="none"
        >
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
    ),
    { ...size }
  );
}
