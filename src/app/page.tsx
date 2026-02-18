import Link from "next/link";
import Image from "next/image";

const S = {
  displayFont: "var(--font-syne), sans-serif",
  bodyFont: "var(--font-dm-sans), sans-serif",
  bg: "#faf7f2",
  bgWarm: "#fff8f3",
  surface: "#ffffff",
  border: "rgba(0,0,0,0.07)",
  borderStrong: "rgba(0,0,0,0.11)",
  text: "#1C1917",
  muted: "#78716C",
  subtle: "#A8A29E",
  orange: "#FF5C2C",
  orangeSoft: "#FEF0EB",
  orangeMid: "#FDDDD0",
} as const;

function HeroPhoto() {
  return (
    <div style={{ position: "relative", maxWidth: 420, width: "100%" }}>
      {/* Decorative offset border */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          translate: "12px 12px",
          borderRadius: "20px",
          border: "2px solid rgba(255,92,44,0.2)",
          zIndex: 0,
        }}
      />

      {/* Photo frame */}
      <div
        style={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          aspectRatio: "4/5",
          zIndex: 1,
          boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
          alt="Young professional working on laptop"
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
      </div>

      {/* Match badge — top left */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "-1.75rem",
          zIndex: 2,
          backgroundColor: "#ffffff",
          border: "1px solid rgba(255,92,44,0.2)",
          borderRadius: "999px",
          padding: "0.45rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e", display: "block", flexShrink: 0 }} />
        <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#1C1917", whiteSpace: "nowrap" }}>
          95% Culture Match
        </span>
      </div>

      {/* Hired badge — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "-1.25rem",
          zIndex: 2,
          backgroundColor: "#FF5C2C",
          borderRadius: "12px",
          padding: "0.6rem 1.1rem",
          boxShadow: "0 6px 20px rgba(255,92,44,0.35)",
        }}
      >
        <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "0.1rem" }}>
          Status
        </div>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: "0.95rem", fontWeight: 800, color: "#ffffff" }}>
          Hired!
        </div>
      </div>

      {/* Paid role badge — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          left: "-1rem",
          zIndex: 2,
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          padding: "0.5rem 0.9rem",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#78716C" }}>Monthly</div>
        <div style={{ fontFamily: "var(--font-syne), sans-serif", fontSize: "0.88rem", fontWeight: 800, color: "#1C1917" }}>₹25,000</div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{ backgroundColor: S.bg, minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "4.5rem 1.5rem 3.5rem",
        }}
      >
        {/* Orange glow — top right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-100px",
            right: "-60px",
            width: "520px",
            height: "440px",
            background: "radial-gradient(ellipse at center, rgba(255,92,44,0.09) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Subtle warm glow — bottom left */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-80px",
            width: "360px",
            height: "320px",
            background: "radial-gradient(ellipse at center, rgba(255,92,44,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Two-column layout */}
        <div
          className="hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3.5rem",
            alignItems: "center",
          }}
        >
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: S.orangeSoft,
                border: "1px solid rgba(255,92,44,0.2)",
                borderRadius: "999px",
                padding: "0.35rem 0.9rem",
                marginBottom: "2rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: S.orange,
                  display: "block",
                }}
              />
              <span
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: S.orange,
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
                fontSize: "clamp(1.875rem, 3.8vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: S.text,
                marginBottom: "1.25rem",
              }}
            >
              Your talent matters,
              <br />
              <span style={{ color: S.orange }}>not your college tag.</span>
            </h1>

            {/* Sub */}
            <p
              style={{
                fontFamily: S.bodyFont,
                fontSize: "1rem",
                lineHeight: 1.7,
                color: S.muted,
                maxWidth: "420px",
                marginBottom: "2.5rem",
              }}
            >
              The hiring platform built exclusively for freshers from non-elite
              colleges. No unpaid roles. No bias. Pure meritocracy.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link
                href="/signup?role=candidate"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: S.orange,
                  color: "#ffffff",
                  fontFamily: S.bodyFont,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "7px",
                  textDecoration: "none",
                }}
              >
                Get Started as Student
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/signup?role=employer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: `1.5px solid ${S.borderStrong}`,
                  color: S.text,
                  fontFamily: S.bodyFont,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "7px",
                  textDecoration: "none",
                  backgroundColor: "transparent",
                }}
              >
                Hire Freshers
              </Link>
            </div>
          </div>

          {/* Right — real photo */}
          <div
            className="hero-illustration"
            style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "1.5rem 2rem 1.5rem 1rem" }}
          >
            <HeroPhoto />
          </div>
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-illustration { display: none !important; }
        }
      `}</style>

      {/* ── Stats strip ──────────────────────────────── */}
      <div
        style={{
          borderTop: `1px solid ${S.border}`,
          borderBottom: `1px solid ${S.border}`,
          backgroundColor: S.surface,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "2.25rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          {[
            { num: "500+",  label: "Jobs Posted" },
            { num: "120+",  label: "Companies Hiring" },
            { num: "100%",  label: "Paid Roles Only" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                  fontWeight: 800,
                  color: S.orange,
                  lineHeight: 1,
                  marginBottom: "0.375rem",
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.8rem",
                  color: S.muted,
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <span
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: S.subtle,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Why Culture Hires
          </span>
          <h2
            style={{
              fontFamily: S.displayFont,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: S.text,
              letterSpacing: "-0.02em",
              marginTop: "0.5rem",
            }}
          >
            Built different. For real.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[
            { num: "01", title: "Tier-2 & Tier-3 Only",   desc: "No IIT/NIT gatekeeping — built for students from non-elite colleges. This space is yours." },
            { num: "02", title: "No Unpaid Roles",         desc: "Every listing on Culture Hires pays. Your time and skills deserve real compensation, period." },
            { num: "03", title: "AI Culture Matching",     desc: "Our AI figures out what makes you tick — then connects you with companies that actually fit." },
          ].map((f, i) => (
            <div
              key={f.num}
              style={{
                borderTop: `1px solid ${S.border}`,
                borderLeft: i > 0 ? `1px solid ${S.border}` : "none",
                padding: "2.25rem 1.75rem",
              }}
            >
              <div
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: S.orange,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "1.1rem",
                }}
              >
                {f.num}
              </div>
              <h3
                style={{
                  fontFamily: S.displayFont,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: S.text,
                  letterSpacing: "-0.01em",
                  marginBottom: "0.65rem",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.9rem",
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
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 5.5rem" }}>
        <div
          style={{
            backgroundColor: S.orangeSoft,
            border: `1px solid rgba(255,92,44,0.15)`,
            borderRadius: "14px",
            padding: "3.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "500px",
              height: "280px",
              background: "radial-gradient(ellipse at center, rgba(255,92,44,0.09) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: S.displayFont,
              fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: S.text,
              letterSpacing: "-0.025em",
              marginBottom: "0.875rem",
              maxWidth: "560px",
              position: "relative",
            }}
          >
            Ready to get hired for who you are?
          </h2>
          <p
            style={{
              fontFamily: S.bodyFont,
              fontSize: "0.95rem",
              color: S.muted,
              marginBottom: "2rem",
              maxWidth: "360px",
              lineHeight: 1.65,
              position: "relative",
            }}
          >
            Join freshers finding their first real opportunity on a platform that
            bets on potential, not pedigree.
          </p>
          <Link
            href="/signup?role=candidate"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: S.orange,
              color: "#ffffff",
              fontFamily: S.bodyFont,
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "0.875rem 1.875rem",
              borderRadius: "7px",
              textDecoration: "none",
              position: "relative",
            }}
          >
            Start Your Journey
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: "1.5rem" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: S.displayFont,
              fontWeight: 700,
              fontSize: "0.9rem",
              color: S.text,
            }}
          >
            Culture Hires
          </span>
          <p style={{ fontFamily: S.bodyFont, fontSize: "0.8rem", color: S.muted }}>
            &copy; {new Date().getFullYear()} Culture Hires. Fair hiring for everyone.
          </p>
        </div>
      </footer>
    </main>
  );
}
