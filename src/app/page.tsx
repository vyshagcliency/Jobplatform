import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Your talent matters,{" "}
            <span className="text-primary-600">not your college tag.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-gray-600">
            The hiring platform built exclusively for Tier-2 &amp; Tier-3
            freshers. No unpaid roles. No bias. Just fair opportunities matched
            to your vibe.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup?role=candidate"
              className="inline-flex h-14 items-center rounded-xl bg-primary-600 px-8 text-lg font-semibold text-white shadow-lg transition hover:bg-primary-700 hover:shadow-xl"
            >
              Get Started as Student
            </Link>
            <Link
              href="/signup?role=employer"
              className="inline-flex h-14 items-center rounded-xl border-2 border-primary-600 bg-white px-8 text-lg font-semibold text-primary-600 shadow transition hover:bg-primary-50 hover:shadow-lg"
            >
              Hire Freshers
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Why Underdog Jobs?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-warm-50 p-8 text-center">
              <div className="mb-4 text-4xl">🎓</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Tier-2 &amp; Tier-3 Only
              </h3>
              <p className="text-gray-600">
                Built for students from non-elite colleges. No IIT/NIT gatekeeping
                — this space is yours.
              </p>
            </div>
            <div className="rounded-2xl bg-accent-50 p-8 text-center">
              <div className="mb-4 text-4xl">💰</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No Unpaid Roles
              </h3>
              <p className="text-gray-600">
                Every listing on Underdog pays. Your time and skills deserve
                compensation, period.
              </p>
            </div>
            <div className="rounded-2xl bg-primary-50 p-8 text-center">
              <div className="mb-4 text-4xl">✨</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                AI Vibe Matching
              </h3>
              <p className="text-gray-600">
                Our AI chat figures out what makes you tick — then matches you
                with companies that fit your vibe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} Underdog Jobs. Fair hiring for everyone.</p>
      </footer>
    </main>
  );
}
