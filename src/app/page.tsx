import Link from "next/link";

const S = {
  displayFont: "var(--font-syne), sans-serif",
  bodyFont: "var(--font-dm-sans), sans-serif",
  bg: "#0C0E13",
  surface: "#13161D",
  border: "rgba(255,255,255,0.07)",
  text: "#EDEAE4",
  muted: "#6B7280",
  lime: "#BBFF3B",
} as const;

function PersonIllustration() {
  return (
    <svg
      width="100%"
      viewBox="0 0 400 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 400 }}
    >
      {/* Background rings */}
      <circle cx="200" cy="250" r="195" fill="rgba(187,255,59,0.03)" />
      <circle cx="200" cy="250" r="152" stroke="rgba(187,255,59,0.07)" strokeWidth="1" />
      <circle cx="200" cy="250" r="108" stroke="rgba(187,255,59,0.04)" strokeWidth="1" />

      {/* Scattered dots */}
      <circle cx="78"  cy="115" r="2.5" fill="#BBFF3B" opacity="0.35" />
      <circle cx="58"  cy="152" r="1.5" fill="#BBFF3B" opacity="0.2"  />
      <circle cx="96"  cy="86"  r="2"   fill="#BBFF3B" opacity="0.2"  />
      <circle cx="328" cy="345" r="2.5" fill="#BBFF3B" opacity="0.3"  />
      <circle cx="350" cy="315" r="1.5" fill="#BBFF3B" opacity="0.2"  />
      <circle cx="42"  cy="310" r="2"   fill="#BBFF3B" opacity="0.15" />

      {/* Person body */}
      <path
        d="M148 172 C148 155 170 148 200 148 C230 148 252 155 252 172 L268 295 H132 Z"
        fill="#1E2230"
      />

      {/* Head */}
      <circle cx="200" cy="106" r="44" fill="#1E2230" />
      {/* Hair */}
      <path d="M162 98 Q162 62 200 62 Q238 62 238 98" fill="#13161D" />

      {/* Eyes */}
      <circle cx="188" cy="110" r="3.5" fill="#BBFF3B" opacity="0.65" />
      <circle cx="212" cy="110" r="3.5" fill="#BBFF3B" opacity="0.65" />

      {/* Smile */}
      <path d="M192 125 Q200 132 208 125" stroke="rgba(187,255,59,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Laptop screen */}
      <rect x="130" y="292" width="140" height="96" rx="7" fill="#13161D" stroke="rgba(187,255,59,0.18)" strokeWidth="1.5" />
      <rect x="137" y="299" width="126" height="80" rx="4" fill="#0C0E13" />

      {/* Screen code lines */}
      <rect x="145" y="311" width="52" height="3"   rx="1.5" fill="#BBFF3B" opacity="0.65" />
      <rect x="145" y="320" width="84" height="2.5" rx="1.25" fill="#4B5563" opacity="0.5"  />
      <rect x="145" y="328" width="62" height="2.5" rx="1.25" fill="#4B5563" opacity="0.4"  />
      <rect x="153" y="336" width="72" height="2.5" rx="1.25" fill="#BBFF3B" opacity="0.3"  />
      <rect x="145" y="344" width="48" height="2.5" rx="1.25" fill="#4B5563" opacity="0.35" />
      <rect x="145" y="352" width="88" height="2.5" rx="1.25" fill="#4B5563" opacity="0.25" />
      <rect x="153" y="360" width="56" height="2.5" rx="1.25" fill="#BBFF3B" opacity="0.22" />

      {/* Laptop base */}
      <rect x="118" y="388" width="164" height="9" rx="4.5" fill="#13161D" />

      {/* Floating job card — top right */}
      <rect x="276" y="118" width="110" height="74" rx="10" fill="#1E2230" stroke="rgba(187,255,59,0.14)" strokeWidth="1" />
      <rect x="288" y="130" width="52" height="3"   rx="1.5" fill="#BBFF3B" opacity="0.7"  />
      <rect x="288" y="139" width="78" height="2.5" rx="1.25" fill="#4B5563" opacity="0.45" />
      <rect x="288" y="147" width="60" height="2.5" rx="1.25" fill="#4B5563" opacity="0.35" />
      <rect x="288" y="158" width="46" height="20"  rx="10"  fill="rgba(187,255,59,0.12)"   />
      <text x="311" y="172" textAnchor="middle" fill="#BBFF3B" fontSize="8.5" fontWeight="600" fontFamily="sans-serif">Apply</text>

      {/* Match badge — left */}
      <rect x="12" y="198" width="104" height="30" rx="15" fill="rgba(187,255,59,0.09)" stroke="rgba(187,255,59,0.25)" strokeWidth="1" />
      <text x="64" y="218" textAnchor="middle" fill="#BBFF3B" fontSize="10" fontWeight="700" fontFamily="sans-serif">95% Match</text>

      {/* Hired badge — bottom right */}
      <rect x="294" y="292" width="84" height="30" rx="15" fill="#BBFF3B" />
      <text x="336" y="312" textAnchor="middle" fill="#0C0E13" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">Hired!</text>
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
        {/* Lime glow top-right */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-100px",
            right: "-60px",
            width: "540px",
            height: "460px",
            background:
              "radial-gradient(ellipse at center, rgba(187,255,59,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3.5rem",
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "rgba(187,255,59,0.06)",
                border: "1px solid rgba(187,255,59,0.18)",
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
                  backgroundColor: S.lime,
                  display: "block",
                }}
              />
              <span
                style={{
                  fontFamily: S.bodyFont,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: S.lime,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                For Tier-2 &amp; Tier-3 Freshers
              </span>
            </div>

            {/* Headline — reduced size */}
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
              <span style={{ color: S.lime }}>not your college tag.</span>
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
                  backgroundColor: S.lime,
                  color: S.bg,
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
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: S.text,
                  fontFamily: S.bodyFont,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "7px",
                  textDecoration: "none",
                }}
              >
                Hire Freshers
              </Link>
            </div>
          </div>

          {/* Right — illustration (hidden on mobile) */}
          <div className="hero-illustration" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <PersonIllustration />
          </div>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-illustration { display: none !important; }
        }
      `}</style>

      {/* ── Stats strip ──────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
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
              <div style={{ fontFamily: S.displayFont, fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", fontWeight: 800, color: S.lime, lineHeight: 1, marginBottom: "0.375rem" }}>
                {stat.num}
              </div>
              <div style={{ fontFamily: S.bodyFont, fontSize: "0.8rem", color: S.muted, fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <div style={{ marginBottom: "3rem" }}>
          <span style={{ fontFamily: S.bodyFont, fontSize: "0.72rem", fontWeight: 600, color: S.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Why Culture Hires
          </span>
          <h2 style={{ fontFamily: S.displayFont, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800, color: S.text, letterSpacing: "-0.02em", marginTop: "0.5rem" }}>
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
              <div style={{ fontFamily: S.displayFont, fontSize: "0.65rem", fontWeight: 700, color: S.lime, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.1rem" }}>{f.num}</div>
              <h3 style={{ fontFamily: S.displayFont, fontSize: "1.15rem", fontWeight: 700, color: S.text, letterSpacing: "-0.01em", marginBottom: "0.65rem" }}>{f.title}</h3>
              <p style={{ fontFamily: S.bodyFont, fontSize: "0.9rem", lineHeight: 1.65, color: S.muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA block ────────────────────────────────── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 5.5rem" }}>
        <div
          style={{
            backgroundColor: S.surface,
            border: `1px solid ${S.border}`,
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
              background: "radial-gradient(ellipse at center, rgba(187,255,59,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2 style={{ fontFamily: S.displayFont, fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)", fontWeight: 800, color: S.text, letterSpacing: "-0.025em", marginBottom: "0.875rem", maxWidth: "560px", position: "relative" }}>
            Ready to get hired for who you are?
          </h2>
          <p style={{ fontFamily: S.bodyFont, fontSize: "0.95rem", color: S.muted, marginBottom: "2rem", maxWidth: "360px", lineHeight: 1.65, position: "relative" }}>
            Join freshers finding their first real opportunity on a platform that bets on potential, not pedigree.
          </p>
          <Link
            href="/signup?role=candidate"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              backgroundColor: S.lime,
              color: S.bg,
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
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: "1.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ fontFamily: S.displayFont, fontWeight: 700, fontSize: "0.9rem", color: S.text }}>Culture Hires</span>
          <p style={{ fontFamily: S.bodyFont, fontSize: "0.8rem", color: S.muted }}>
            &copy; {new Date().getFullYear()} Culture Hires. Fair hiring for everyone.
          </p>
        </div>
      </footer>
    </main>
  );
}
