export type DocsNavItem = {
  href: string;
  label: string;
  description?: string;
};

export type DocsNavGroup = {
  label: string;
  items: DocsNavItem[];
};

export const DOCS_NAV: DocsNavGroup[] = [
  {
    label: "Guides",
    items: [
      {
        href: "/docs",
        label: "Overview",
        description: "Docs overview and navigation.",
      },
      {
        href: "/docs/getting-started",
        label: "Getting Started",
        description: "Installation, migration, first picker, and styling basics.",
      },
      {
        href: "/docs/customization",
        label: "Customization",
        description: "Rendering, overlays, external search input, and mixed-item UI.",
      },
      {
        href: "/docs/search-metadata",
        label: "Search & Metadata",
        description: "Grouped and unified search, shortcode search, and locale-aware metadata.",
      },
      {
        href: "/docs/recipes",
        label: "Recipes",
        description: "Common product patterns and end-to-end integration examples.",
      },
    ],
  },
  {
    label: "Packages",
    items: [
      {
        href: "/docs/companion-packages",
        label: "Companion Packages",
        description: "Package boundaries, installation, and composition guidance.",
      },
    ],
  },
  {
    label: "Reference",
    items: [
      {
        href: "/docs/api-reference",
        label: "API Reference",
        description: "Components, props, helpers, hooks, and types.",
      },
      {
        href: "/docs/releases",
        label: "Releases",
        description: "Version notes, changelog links, and migration checkpoints.",
      },
    ],
  },
];
