import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import StoryScrollButton from "../../../components/StoryScrollButton";
export const metadata: Metadata = {
  title: "The Story Behind Ghanugu Nuvvula Nune | Godavari Basket",
  description:
    "Discover the story, traditional process, people and care behind Godavari Basket's Ghanugu Nuvvula Nune.",
  openGraph: {
    title: "The Story Behind Ghanugu Nuvvula Nune",
    description:
      "Discover the story behind this traditional Godavari sesame oil.",
    images: ["/stories/ghanugu-nuvvula-nune/hero.jpg"],
    type: "article",
  },
};

const storyImages = {
  hero: "/stories/ghanugu-nuvvula-nune/hero.jpg",
  seeds: "/stories/ghanugu-nuvvula-nune/sesame-seeds.jpg",
  preparation: "/stories/ghanugu-nuvvula-nune/preparation.jpg",
  ghanugu: "/stories/ghanugu-nuvvula-nune/ghanugu.jpg",
  pressing: "/stories/ghanugu-nuvvula-nune/pressing.jpg",
  filtering: "/stories/ghanugu-nuvvula-nune/filtering.jpg",
  bottling: "/stories/ghanugu-nuvvula-nune/bottling.jpg",
  people: "/stories/ghanugu-nuvvula-nune/people.jpg",
  bottle: "/stories/ghanugu-nuvvula-nune/bottle.jpg",
  godavari: "/stories/ghanugu-nuvvula-nune/godavari.jpg",
};

function StoryImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-[#eee9dc] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}

export default function GhanuguNuvvulaNuneStoryPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ec] text-[#20251f]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f8f5ec]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-wide"
          >
            GODAVARI BASKET
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#314c38] transition hover:opacity-70"
          >
            Back to Store
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[75vh] overflow-hidden">
        <StoryImage
          src={storyImages.hero}
          alt="Traditional Ghanugu sesame oil making process"
          priority
          className="absolute inset-0 h-full w-full rounded-none"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-5xl items-end px-5 pb-16 md:px-8 md:pb-24">
          <div className="max-w-3xl text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Godavari Basket
            </p>

            <h1 className="font-serif text-5xl leading-[0.95] md:text-7xl">
              Ghanugu Nuvvula Nune
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
              The story behind every bottle.
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              From sesame seed to oil — discover the process, patience and
              people behind this traditional product.
            </p>

         <StoryScrollButton />
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="story" className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <StoryImage
            src={storyImages.people}
            alt="People involved in preparing traditional sesame oil"
            className="aspect-[4/5]"
          />

          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              The story behind the bottle
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              Before it reaches your kitchen, there is a story behind it.
            </h2>

            <p className="mt-6 text-base leading-8 text-black/65">
              A bottle of sesame oil may look simple. But behind it are
              carefully selected seeds, preparation, pressing, filtering and
              the work of people who carry the process forward.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              This is the journey we want you to discover when you scan the
              story on your bottle.
            </p>
          </div>
        </div>
      </section>

      {/* Where it begins */}
      <section className="bg-[#eee9dc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div className="order-2 md:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              01 — Where it begins
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              It starts with the humble sesame seed.
            </h2>

            <p className="mt-6 leading-8 text-black/65">
              The journey begins with sesame seeds. Selection and preparation
              are important parts of creating an oil that reflects the
              character of the raw ingredient.
            </p>

            <p className="mt-4 leading-8 text-black/65">
              Before pressing begins, the seeds are prepared for the next
              stage of the process.
            </p>
          </div>

          <StoryImage
            src={storyImages.seeds}
            alt="Sesame seeds used for making sesame oil"
            className="order-1 aspect-[4/3] md:order-2"
          />
        </div>
      </section>

      {/* Ghanugu */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
            02 — The tradition
          </p>

          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            The Ghanugu
          </h2>

          <p className="mt-6 leading-8 text-black/65">
            Traditional oil pressing is a process that requires time,
            attention and care. The ghanugu is at the heart of this story.
          </p>
        </div>

        <StoryImage
          src={storyImages.ghanugu}
          alt="Traditional ghanugu oil press"
          className="mt-12 aspect-[16/9]"
        />
      </section>

      {/* Process */}
      <section className="bg-[#314c38] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6bf83]">
              03 — The process
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              From seed to bottle.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Prepare",
                image: storyImages.preparation,
                alt: "Sesame seeds being prepared",
              },
              {
                number: "02",
                title: "Press",
                image: storyImages.pressing,
                alt: "Sesame seeds being pressed",
              },
              {
                number: "03",
                title: "Filter",
                image: storyImages.filtering,
                alt: "Sesame oil being filtered",
              },
              {
                number: "04",
                title: "Bottle",
                image: storyImages.bottling,
                alt: "Sesame oil being bottled",
              },
            ].map((step) => (
              <article key={step.number}>
                <div className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>

                <p className="mt-5 text-xs tracking-[0.2em] text-[#d6bf83]">
                  {step.number}
                </p>

                <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Human effort */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <StoryImage
            src={storyImages.people}
            alt="Person working during traditional sesame oil production"
            className="aspect-[16/10]"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              04 — The work behind every bottle
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              It takes more than a bottle to make the story.
            </h2>

            <p className="mt-6 leading-8 text-black/65">
              Every stage requires attention. From preparing the seeds to
              pressing, filtering and preparing the finished oil, the process
              depends on people and their care.
            </p>

            <p className="mt-4 leading-8 text-black/65">
              This is the part that is often invisible when we simply pick a
              bottle from a shelf.
            </p>
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="bg-[#eee9dc]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              05 — The finished oil
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              From the process to your kitchen.
            </h2>

            <p className="mt-6 leading-8 text-black/65">
              Once the oil has completed its preparation, it becomes something
              simple and familiar — ready to become part of everyday cooking
              and traditional recipes.
            </p>
          </div>

          <StoryImage
            src={storyImages.bottle}
            alt="Godavari Basket Ghanugu Nuvvula Nune bottle"
            className="aspect-[4/5]"
          />
        </div>
      </section>

      {/* Usage and storage */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-black/10 bg-white p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              How to use
            </p>

            <h2 className="mt-4 font-serif text-3xl">
              Bring it into your kitchen.
            </h2>

            <ul className="mt-6 space-y-3 text-black/65">
              <li>• Traditional cooking</li>
              <li>• Tempering</li>
              <li>• Pickles</li>
              <li>• Regional recipes</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8b6f38]">
              How to store
            </p>

            <h2 className="mt-4 font-serif text-3xl">
              Take care of the bottle.
            </h2>

            <ul className="mt-6 space-y-3 text-black/65">
              <li>• Keep in a cool, dry place.</li>
              <li>• Keep away from direct sunlight.</li>
              <li>• Keep properly sealed after use.</li>
              <li>• Follow the storage instructions on the product label.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Godavari Basket */}
      <section className="bg-[#314c38] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <StoryImage
            src={storyImages.bottle}
            alt="Ghanugu Nuvvula Nune from Godavari Basket"
            className="aspect-square"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6bf83]">
              06 — Why Godavari Basket
            </p>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              We want you to know what is behind what you buy.
            </h2>

            <p className="mt-6 leading-8 text-white/70">
              Godavari Basket brings together products connected to the
              Godavari region — products with character, tradition and a story
              worth discovering.
            </p>
          </div>
        </div>
      </section>

      {/* Final */}
      <section className="relative overflow-hidden">
        <StoryImage
          src={storyImages.godavari}
          alt="Godavari river region"
          className="min-h-[65vh] rounded-none"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-center justify-center px-5 text-center text-white">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Godavari Basket
            </p>

            <h2 className="mt-4 font-serif text-5xl md:text-7xl">
              From the Godavari
              <br />
              to your home.
            </h2>

            <p className="mx-auto mt-6 max-w-xl leading-8 text-white/80">
              The seed. The process. The patience. The people. And the story.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#314c38] transition hover:bg-[#f0eadb]"
            >
              Explore Godavari Basket
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#20251f] px-5 py-10 text-center text-sm text-white/50">
        <p>GODAVARI BASKET</p>
        <p className="mt-2">
          Authentic products and specialities from the Godavari region.
        </p>
      </footer>
    </main>
  );
}
