// Design (brand identity) pieces, in display order.
//
// HOW TO ADD A PIECE
//   1. Images go in public/design/images/<id>/0.jpg, 1.jpg, ... (a folder per
//      piece, named after its id). 0.jpg leads the project page — use the
//      final mark.
//   2. Add an entry below. Each piece gets a page at /design/<id> showing every
//      slide with its caption.
//   3. Wrap a caption in home("…") to put that slide on the /design grid (the
//      design version of photography's `_home` filename tag). The tile fades
//      through tagged slides in order and takes its proportions from the first
//      one, so tag slides of about the same shape; the rest are cropped to it.
//      Nothing tagged: the tile shows slide 0.

export interface Slide {
  src: string;
  caption: string;
  /** Shown on the /design grid tile. */
  home?: boolean;
}

export interface DesignPiece {
  id: string;
  title: string;
  year: string;
  /** Short list under the title on the grid. */
  deliverables: string[];
  /** Paragraphs on the project page. */
  text: string[];
  slides: Slide[];
  status?: string;
}

type Entry = string | { caption: string; home: true };

/** Tags a slide for the /design grid tile. */
const home = (caption: string): Entry => ({ caption, home: true });

const slides = (id: string, entries: Entry[]): Slide[] =>
  entries.map((e, i) => ({ src: `/design/images/${id}/${i}.jpg`, ...(typeof e === "string" ? { caption: e } : e) }));

/** The slides a piece's grid tile fades through. */
export const homeSlides = (p: Pick<DesignPiece, "slides">) => {
  const tagged = p.slides.filter((s) => s.home);
  return tagged.length ? tagged : p.slides.slice(0, 1);
};

export const DESIGN: DesignPiece[] = [
  {
    id: "spright-games",
    title: "Spright Games",
    year: "2025",
    deliverables: ["Logo", "Brandmark", "Supporting graphics"],
    text: [
      "Spright Games is a new Minecraft DLC content company producing add-ons, maps and skin packs. I translated their core values of friendliness and excitement into bright colors, bold shapes, and a recognizable aesthetic that could stand out in a busy digital storefront.",
      "My sketches began with the silhouette of the Minecraft allay, which I stylized and simplified to work at a small scale, and continued with logo ornaments and supporting graphics like the Mario-esque background and brandmark.",
    ],
    slides: slides("spright-games", [
      home("Final logomark"),
      "Rudimentary shape and style brainstorming",
      "Further shape and rotation refinement",
      "Embellishment",
      "Background and supporting graphic development",
      home("Final brandmark"),
    ]),
  },
  {
    id: "stem-4-all",
    title: "STEM 4 ALL",
    year: "2026",
    deliverables: ["Identity", "Apparel", "Pins", "Style guide"],
    text: [
      "Full brand identity revamp for an evolving high school FRC robotics team: Team 8224. STEM 4 ALL, previously Vanguard Robotics, is spreading FIRST values by focusing their efforts on inclusivity and the belief that STEM is for everyone. Therefore, the logo I created simultaneously demonstrated unity (a team huddle of students putting their heads together) and connection to hands-on robotics experience, forming a sprocket shape.",
      "I optimized their logo for FRC avatar use, and it also features a forward-moving title font, Hemi Head, that can be applied to bumper graphics. To complete the package I included traditional FRC pin designs, a flashy print-all-over jersey, a distinct color palette including secondary color combinations, and a brand style guide to help unify their team image.",
    ],
    slides: slides("stem-4-all", [
      home("Logomark"),
      home("Construction: team huddle and sprocket"),
      home("Team number lockup"),
      home("Jersey design"),
      home("Pin designs"),
      home("Colour palette"),
      "Brand style guide",
    ]),
  },
  {
    id: "tedx-youth",
    title: "TEDx Youth",
    year: "2024–25",
    deliverables: ["Event graphics", "Apparel"],
    text: [
      "TED and its independently organized TEDx events maintain a highly recognizable and carefully controlled visual identity. Motivated by the opportunity to work within a refined brand, I entered a design competition for a local TEDx Youth branch whose slogan is “Breaking Down Barriers.”",
      "My concepts visually interpreted the slogan by treating the “X” in TEDx as a structural barrier, drawing inspiration from construction and demolition imagery to represent the act of overcoming obstacles. The design works within TED’s bold, angular aesthetic while introducing additional visual storytelling and structural detail.",
      "The concept won the design competition two years consecutively. Since then, my graphics have appeared regularly across event social media, promotional materials, and apparel, becoming a recurring visual element of the organization’s public-facing identity.",
    ],
    slides: slides("tedx-youth", [
      home("Slant design | Logo graphic"),
      home("Shatter design | Sweater graphic"),
      home("Shatter design with initial sketches"),
      home("Rolling design"),
      home("Stylized sweater design presentation, 2024"),
      home("Stylized sweater design presentation, 2025"),
    ]),
  },
  {
    id: "iron-bears",
    title: "Iron Bears",
    year: "2025",
    deliverables: ["Logo refresh", "Apparel", "Pit signage", "Robot decals"],
    text: [
      "FRC Team 854 has over 20 years of history competing in the FIRST Robotics Competition and continues to perform at the provincial level. For the 2024–2025 season, the team sought a visual refresh that reflected its longevity and competitive standing while unifying a collection of legacy graphics.",
      "I modernized the team’s historical mechanical bear logo, preserving its recognizable character while refining its form and structure for contemporary use. From this mark, I developed a visual brand used across team apparel, pit signage, engraved robot decals, and other competition materials. All graphics were rebuilt as scalable vector assets to ensure consistent reproduction across formats while accommodating common fabrication constraints such as print size limits and engraving requirements.",
      "The resulting identity maintained continuity with the team’s established orange and black school colors while introducing a cleaner, more modern aesthetic. The designs were produced as merchandise for team members and used throughout competitions, becoming the team’s active visual identity for the 2024–2025 season.",
    ],
    slides: slides("iron-bears", [
      home("Final logomark"),
      "Logo historical comparison",
      "Final sweater design",
      home("Stylized sweater design presentation"),
      home("Alternate sweater design"),
      "T-shirt sponsor graphic arrangements",
    ]),
  },
  {
    id: "relay-for-life",
    title: "Relay For Life",
    year: "2025",
    deliverables: ["Logo", "Brandmark", "Apparel"],
    text: [
      "Relay For Life is a global cancer fundraising initiative known for its community endurance events. When a local branch approached me for visual assets, I began by researching the organization’s brand language and its emphasis on hope and perseverance.",
      "I designed a logo and brandmark inspired by relay race symbolism, incorporating batons and ribbons to reference both racing and cancer awareness imagery. The graphics were used across apparel, social media, and promotional materials for an event with over 200 attendees.",
    ],
    slides: slides("relay-for-life", [
      home("Final logomark"),
      home("Baton and ribbon alternate logo"),
      home("Flower alternate logo"),
      home("Baton and ribbon alternate logo 2"),
      home("Stylized sweater design presentation"),
    ]),
  },
  {
    id: "can-rgx",
    title: "CAN-RGX",
    year: "2026",
    status: "In progress",
    deliverables: ["Patch", "Award graphics"],
    text: ["Collaboration with Students for the Exploration and Development of Space (SEDS Canada)."],
    slides: slides("can-rgx", [home("Challenge patch"), "Overall Excellence award graphic"]),
  },
];
