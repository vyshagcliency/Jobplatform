import Link from "next/link";

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

function PersonIllustration() {
  return (
    <svg
      viewBox="0 0 400 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 380, width: "100%" }}
      aria-hidden
    >
      {/* Decorative rings */}
      <circle cx="200" cy="250" r="192" fill="rgba(255,92,44,0.04)" />
      <circle cx="200" cy="250" r="148" stroke="rgba(255,92,44,0.10)" strokeWidth="1" />
      <circle cx="200" cy="250" r="105" stroke="rgba(255,92,44,0.06)" strokeWidth="1" />

      {/* Scattered dots */}
      <circle cx="78"  cy="115" r="2.5" fill="#FF5C2C" opacity="0.4" />
      <circle cx="58"  cy="152" r="1.5" fill="#FF5C2C" opacity="0.25" />
      <circle cx="96"  cy="86"  r="2"   fill="#FF5C2C" opacity="0.25" />
      <circle cx="328" cy="345" r="2.5" fill="#FF5C2C" opacity="0.35" />
      <circle cx="350" cy="315" r="1.5" fill="#FF5C2C" opacity="0.2" />
      <circle cx="42"  cy="310" r="2"   fill="#FF5C2C" opacity="0.18" />

      {/* Body — warm caramel */}
      <path d="M148 172 C148 155 170 148 200 148 C230 148 252 155 252 172 L268 295 H132 Z" fill="#F0C090" />
      {/* Collar */}
      <path d="M182 172 L200 195 L218 172" fill="#FEF8F0" />

      {/* Head */}
      <circle cx="200" cy="108" r="44" fill="#E8A868" />
      {/* Hair */}
      <path d="M160 100 Q160 64 200 64 Q240 64 240 100 Q236 78 200 76 Q164 78 160 100Z" fill="#2D1B12" />

      {/* Eyes */}
      <ellipse cx="188" cy="112" rx="3.5" ry="4"   fill="#1C1917" opacity="0.85" />
      <ellipse cx="212" cy="112" rx="3.5" ry="4"   fill="#1C1917" opacity="0.85" />
      <circle  cx="189.5" cy="110" r="1"            fill="white"   opacity="0.7" />
      <circle  cx="213.5" cy="110" r="1"            fill="white"   opacity="0.7" />

      {/* Smile */}
      <path d="M191 127 Q200 135 209 127" stroke="#78716C" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Laptop screen */}
      <rect x="130" y="292" width="140" height="96" rx="7" fill="#E5DECE" stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
      <rect x="137" y="299" width="126" height="80" rx="4" fill="#faf7f2" />
      {/* Code lines */}
      <rect x="145" y="311" width="52" height="3"   rx="1.5" fill="#FF5C2C" opacity="0.80" />
      <rect x="145" y="320" width="84" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.5"  />
      <rect x="145" y="328" width="62" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.4"  />
      <rect x="153" y="336" width="72" height="2.5" rx="1.25" fill="#FF5C2C" opacity="0.35" />
      <rect x="145" y="344" width="48" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.35" />
      <rect x="145" y="352" width="88" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.25" />
      <rect x="153" y="360" width="56" height="2.5" rx="1.25" fill="#FF5C2C" opacity="0.22" />
      {/* Laptop base */}
      <rect x="118" y="388" width="164" height="9" rx="4.5" fill="#D5C8B5" />

      {/* Floating job card — top right */}
      <rect x="277" y="119" width="110" height="74" rx="10" fill="rgba(0,0,0,0.04)" />
      <rect x="274" y="116" width="110" height="74" rx="10" fill="white" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <rect x="286" y="128" width="52" height="3"   rx="1.5" fill="#1C1917" opacity="0.75" />
      <rect x="286" y="137" width="78" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.5"  />
      <rect x="286" y="145" width="60" height="2.5" rx="1.25" fill="#A8A29E" opacity="0.4"  />
      <rect x="286" y="156" width="50" height="20"  rx="10"  fill="#FEF0EB" />
      <text x="311" y="170" textAnchor="middle" fill="#FF5C2C" fontSize="8.5" fontWeight="600" fontFamily="sans-serif">Apply</text>

      {/* Match badge — left */}
      <rect x="8"  y="196" width="112" height="30" rx="15" fill="#FEF0EB" stroke="rgba(255,92,44,0.25)" strokeWidth="1" />
      <text x="64" y="216" textAnchor="middle" fill="#FF5C2C" fontSize="9.5" fontWeight="700" fontFamily="sans-serif">95% Match</text>

      {/* Hired badge — bottom right */}
      <rect x="292" y="292" width="84" height="30" rx="15" fill="#FF5C2C" />
      <text x="334" y="312" textAnchor="middle" fill="white" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">Hired!</text>
    </svg>
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

          {/* Right — illustration */}
          <div
            className="hero-illustration"
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <PersonIllustration />
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
