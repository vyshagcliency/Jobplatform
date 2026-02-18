import Link from "next/link";

const S = {
  // typography
  displayFont: "var(--font-syne), sans-serif",
  bodyFont: "var(--font-dm-sans), sans-serif",
  // colors
  bg: "#0C0E13",
  surface: "#13161D",
  border: "rgba(255,255,255,0.07)",
  text: "#EDEAE4",
  muted: "#6B7280",
  lime: "#BBFF3B",
  orange: "#FF5C2C",
} as const;

export default function Home() {
  return (
    <main style={{ backgroundColor: S.bg, minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "5rem 1.5rem 4rem",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* Lime glow — top right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "600px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(187,255,59,0.08) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(187,255,59,0.06)",
            border: "1px solid rgba(187,255,59,0.18)",
            borderRadius: "999px",
            padding: "0.375rem 1rem",
            marginBottom: "2.25rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: S.lime,
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: S.lime,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            For Tier-2 &amp; Tier-3 Freshers
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: S.displayFont,
            fontSize: "clamp(2.75rem, 7.5vw, 5.75rem)",
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: S.text,
            maxWidth: "820px",
            marginBottom: "1.5rem",
          }}
        >
          Your talent matters,
          <br />
          <span style={{ color: S.lime }}>not your college tag.</span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontFamily: S.bodyFont,
            fontSize: "1.125rem",
            lineHeight: 1.7,
            color: S.muted,
            maxWidth: "500px",
            marginBottom: "2.75rem",
          }}
        >
          The hiring platform built exclusively for freshers from non-elite
          colleges. No unpaid roles. No bias. Pure meritocracy.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem" }}>
          <Link
            href="/signup?role=candidate"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: S.lime,
              color: S.bg,
              fontFamily: S.bodyFont,
              fontWeight: 700,
              fontSize: "0.9375rem",
              padding: "0.875rem 1.75rem",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Get Started as Student
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/signup?role=employer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid rgba(255,255,255,0.14)",
              color: S.text,
              fontFamily: S.bodyFont,
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.875rem 1.75rem",
              borderRadius: "8px",
              textDecoration: "none",
              backgroundColor: "transparent",
            }}
          >
            Hire Freshers
          </Link>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${S.border}`,
          borderBottom: `1px solid ${S.border}`,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2.5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          {[
            { num: "500+", label: "Jobs Posted" },
            { num: "120+", label: "Companies Hiring" },
            { num: "100%", label: "Paid Roles Only" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 800,
                  color: S.lime,
                  lineHeight: 1,
                  marginBottom: "0.375rem",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.8125rem",
                  color: S.muted,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5.5rem 1.5rem",
        }}
      >
        {/* Section label */}
        <div style={{ marginBottom: "3.5rem" }}>
          <span
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.75rem",
              fontWeight: 600,
              color: S.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Why Culture Hires
          </span>
          <h2
            style={{
              fontFamily: S.displayFont,
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: S.text,
              letterSpacing: "-0.02em",
              marginTop: "0.625rem",
            }}
          >
            Built different. For real.
          </h2>
        </div>

        {/* Feature columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "0",
          }}
        >
          {[
            {
              num: "01",
              title: "Tier-2 & Tier-3 Only",
              desc: "Built for students from non-elite colleges. No IIT/NIT gatekeeping — this space belongs to you.",
            },
            {
              num: "02",
              title: "No Unpaid Roles",
              desc: "Every listing on Culture Hires pays. Your time and skills deserve real compensation, period.",
            },
            {
              num: "03",
              title: "AI Culture Matching",
              desc: "Our AI figures out what makes you tick — then connects you with companies that actually fit.",
            },
          ].map((f, i) => (
            <div
              key={f.num}
              style={{
                borderTop: `1px solid ${S.border}`,
                borderLeft:
                  i > 0 ? `1px solid ${S.border}` : "none",
                padding: "2.5rem 2rem 2.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: S.lime,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                {f.num}
              </div>
              <h3
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: S.text,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.75rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  color: S.muted,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA block ────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem 6rem",
        }}
      >
        <div
          style={{
            backgroundColor: S.surface,
            border: `1px solid ${S.border}`,
            borderRadius: "16px",
            padding: "4rem 2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle lime glow inside card */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "500px",
              height: "300px",
              background:
                "radial-gradient(ellipse at center, rgba(187,255,59,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <h2
            style={{
              fontFamily: S.displayFont,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 800,
              color: S.text,
              letterSpacing: "-0.025em",
              marginBottom: "1rem",
              maxWidth: "600px",
              position: "relative",
            }}
          >
            Ready to get hired for who you are?
          </h2>
          <p
            style={{
              fontFamily: S.bodyFont,
              fontSize: "1rem",
              color: S.muted,
              marginBottom: "2.25rem",
              maxWidth: "380px",
              lineHeight: 1.65,
              position: "relative",
            }}
          >
            Join freshers finding their first real opportunity on a platform
            that bets on potential, not pedigree.
          </p>
          <Link
            href="/signup?role=candidate"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: S.lime,
              color: S.bg,
              fontFamily: S.bodyFont,
              fontWeight: 700,
              fontSize: "0.9375rem",
              padding: "0.9375rem 2rem",
              borderRadius: "8px",
              textDecoration: "none",
              position: "relative",
            }}
          >
            Start Your Journey
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${S.border}`,
          padding: "1.75rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: S.displayFont,
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: S.text,
            }}
          >
            Culture Hires
          </span>
          <p
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.8125rem",
              color: S.muted,
            }}
          >
            &copy; {new Date().getFullYear()} Culture Hires. Fair hiring for
            everyone.
          </p>
        </div>
      </footer>
    </main>
  );
}
