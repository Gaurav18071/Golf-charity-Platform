import {
  ShieldCheck,
  HeartHandshake,
  Trophy,
  Leaf,
} from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Transparent Platform",
    description:
      "Every contribution and competition is designed with clarity, accountability, and trust.",
  },
  {
    icon: HeartHandshake,
    title: "Community Driven",
    description:
      "Bring together golfers and charities to create meaningful experiences for everyone involved.",
  },
  {
    icon: Trophy,
    title: "Fair Competition",
    description:
      "Every participant competes under the same rules, ensuring a level playing field.",
  },
  {
    icon: Leaf,
    title: "Meaningful Impact",
    description:
      "Every round contributes toward supporting charitable initiatives and stronger communities.",
  },
];

export default function TrustSection() {
  return (
    <section className="section">
      <div className="container">

        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            ✓ Why Choose Us
          </span>

          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built on Trust,
            <br />
            Transparency & Community
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Our platform connects golfers, charities, and communities through
            transparent participation, fair competition, and meaningful impact.
          </p>

        </div>

        {/* Trust Grid */}
        <div className="grid gap-6 md:grid-cols-2">

          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="surface group flex h-full flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-4 flex-grow leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}

        </div>

        {/* Bottom Statement */}
        <div className="mx-auto mt-16 max-w-3xl text-center">

          <p className="text-xl font-medium text-slate-800">
            Together, we're building more than a golf platform—
            <span className="text-emerald-700">
              {" "}
              we're creating a community that plays with purpose.
            </span>
          </p>

        </div>

      </div>
    </section>
  );
}