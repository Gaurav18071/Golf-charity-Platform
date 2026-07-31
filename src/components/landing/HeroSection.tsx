import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">

          {/* Content */}
          <div className="space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              🏌️ Golf • Charity • Community
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Play Golf.
              <br />
              Support Charities.
              <br />
              Win Together.
            </h1>

            {/* Description */}
            <p className="max-w-lg text-lg text-slate-600">
              Join a community where every round makes an impact.
              Compete with golfers, contribute to meaningful charities,
              and become part of something bigger than the game.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-4 sm:flex-row">

              <Link
                href="/signup"
                className="rounded-xl bg-green-700 px-6 py-4 text-center font-semibold text-white transition hover:bg-green-800"
              >
                Get Started
              </Link>

              <Link
                href="/how-it-works"
                className="rounded-xl border border-slate-300 px-6 py-4 text-center font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                How It Works
              </Link>

            </div>

            {/* Trust Cards */}
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">

              <div className="surface p-5">
                <h3 className="font-semibold">Community</h3>
                <p className="mt-2 text-sm">
                  Built for golfers who care about making a difference.
                </p>
              </div>

              <div className="surface p-5">
                <h3 className="font-semibold">Transparency</h3>
                <p className="mt-2 text-sm">
                  Designed to keep every contribution visible and accountable.
                </p>
              </div>

              <div className="surface p-5">
                <h3 className="font-semibold">Impact</h3>
                <p className="mt-2 text-sm">
                  Every participation helps support charitable initiatives.
                </p>
              </div>

            </div>

          </div>

          {/* Illustration Placeholder */}
          <div className="surface flex min-h-[420px] items-center justify-center p-8">

            <div className="text-center">

              <div className="mb-4 text-6xl">
                ⛳
              </div>

              <h3 className="text-xl font-semibold">
                Hero Illustration
              </h3>

              <p className="mt-3 max-w-sm text-slate-500">
                Reserved space for the final custom illustration.
                No temporary assets are being used.
              </p>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}