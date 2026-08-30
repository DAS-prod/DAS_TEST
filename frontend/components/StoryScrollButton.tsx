"use client";

export default function StoryScrollButton() {
  const scrollToStory = () => {
    document
      .getElementById("story")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <button
      type="button"
      onClick={scrollToStory}
      className="mt-8 inline-flex rounded-full border border-white/40 px-6 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#20251f]"
    >
      Discover the story ↓
    </button>
  );
}
