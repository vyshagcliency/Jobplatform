import Link from "next/link";

export default function BlockedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-warm-50 px-4 text-center">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Thanks for stopping by!
      </h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        This platform is exclusively for Tier-2 &amp; Tier-3 freshers to keep
        opportunities fair. You&apos;re already a rockstar — we know you&apos;ll
        find something great elsewhere!
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
      >
        Go Home
      </Link>
    </main>
  );
}
