"use client";

import {
  Cookie,
  Droplets,
  Leaf,
  Package,
  Sparkles,
  Wheat,
  Drumstick,
  Nut,
  CircleDot,
} from "lucide-react";

export const MAIN_CATEGORIES = [
  {
    name: "90s & Seasonal",
    key: "90s & Seasonal",
    icon: Sparkles,
  },
  {
    name: "Sweets",
    key: "Sweets",
    icon: Cookie,
  },
  {
    name: "Snacks",
    key: "Snacks",
    icon: Wheat,
  },
  {
    name: "Pickles",
    key: "Pickles",
    icon: CircleDot,
  },
  {
    name: "Podis",
    key: "Podis",
    icon: Drumstick,
  },
  {
    name: "Papads",
    key: "Papads",
    icon: Package,
  },
  {
    name: "Millets",
    key: "Millets",
    icon: Leaf,
  },
  {
    name: "Ghees & Oils",
    key: "Ghees & Oils",
    icon: Droplets,
  },
  {
    name: "Essentials",
    key: "Essentials",
    icon: Nut,
  },
];

export default function CategorySection() {
  function selectCategory(
    category: string
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "category-filter",
        {
          detail: category,
        }
      )
    );

    setTimeout(() => {
      document
        .getElementById("shop")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 20);
  }

  return (
    <section
      id="collections"
      className="category-section"
    >
      <div className="container-wide">
        <div className="section-heading">
          <p className="eyebrow">
            EXPLORE OUR COLLECTION
          </p>

          <h2>
            AUTHENTIC GODAVARI
            GOODNESS
          </h2>
        </div>

        <div className="category-grid">
          {MAIN_CATEGORIES.map(
            (category) => {
              const Icon =
                category.icon;

              return (
                <button
                  type="button"
                  key={
                    category.key
                  }
                  className="category-card"
                  onClick={() =>
                    selectCategory(
                      category.key
                    )
                  }
                >
                  <span className="category-icon">
                    <Icon
                      size={23}
                      strokeWidth={
                        1.5
                      }
                    />
                  </span>

                  <span>
                    {
                      category.name
                    }
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}
