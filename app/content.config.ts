// ── CONTENT CONFIGURATION ────────────────────────────────────────────────────
//
// Single source of truth for all site content.
// No component knowledge required — edit the data below to update the site.
//
// ── HOW TO UPDATE "LAST UPDATED" ─────────────────────────────────────────────
// Change LAST_UPDATED whenever you make meaningful changes.
// Format: "Month YYYY"  e.g. "March 2026"
//
// ── HOW TO ADD A PROJECT (home page) ─────────────────────────────────────────
// Append to ENGINEERING_PROJECTS:
//   { id: "04", title: "YOUR PROJECT", stack: "TECH · STACK", desc: "One sentence." }
//
// ── HOW TO ADD A PORTFOLIO PIECE ─────────────────────────────────────────────
// 1. Append an object to PORTFOLIO_PIECES.
// 2. Add captions to PORTFOLIO_CAPTIONS keyed as "id-slideIndex" (0-based).
// 3. Drop images into /public/images/portfolio/<id>/0.jpg, 1.jpg, etc.
//
// ── HOW TO ADD A PORTFOLIO CATEGORY ──────────────────────────────────────────
// Append a string to PORTFOLIO_CATEGORIES. At least one piece must use it.

export const LAST_UPDATED = "March 2026";

// ── HOME PAGE — PROJECTS ──────────────────────────────────────────────────────

export interface EngineeringProject {
  id: string;
  title: string;
  stack: string;
  desc: string;
}

export const ENGINEERING_PROJECTS: EngineeringProject[] = [
  {
    id: "01",
    title: "STEM 4 ALL Rebrand",
    stack: "LOGO · BRAND · APPAREL · ACCESSORIES",
    desc: "Full brand identity revamp for an evolving highschool FRC robotics team: Team 8224. STEM 4 ALL, previously Vanguard Robotics. See portfolio.",
  },
  {
    id: "02",
    title: "Satellite-Repair Rocket Design",
    stack: "3D MODEL · PHOTOGRAPHY · 3D PRINT",
    desc: "Designed a multi-stage rocket model with a four degree of freedom deployable arm. See above.",
  },
  {
    id: "03",
    title: "Spright Games Launch",
    stack: "LOGO · BRAND",
    desc: "Logo and brand design work for a Minecraft DLC content company: Spright Games. See portfolio",
  },
];

// ── PORTFOLIO PAGE — CATEGORIES ───────────────────────────────────────────────

export const PORTFOLIO_CATEGORIES: string[] = [
  "Graphic Design",
  "3D Visualization",
  "Photography",
];

// ── PORTFOLIO PAGE — PIECES ───────────────────────────────────────────────────

export interface PortfolioPiece {
  id: string;
  title: string;
  categories: string[];
  date: string;
  desc: string;
  slides: number;
}

export const PORTFOLIO_PIECES: PortfolioPiece[] = [
  {
    id: "01",
    title: "Evacuation",
    categories: ["3D Visualization"],
    date: "July 2021",
    desc: `In the aftermath of a devastating war, the Earth is destroyed, millennia of civilization
            shattering into a devastating fireball. Citizens flee to advanced stations and refugee 
            camps on other celestial bodies, including the moon. This image was a submission to
            the CGBoost Art Challenge for 3D Artists, \u201cLife on a Train\u201d render challenge.
            I used smoke and fire simulations, advanced texturing and realistic
            lighting as I gradually built the scene, which took me approximately 14 hours.`,
    slides: 4,
  },
  {
    id: "02",
    title: "Spright Games",
    categories: ["Graphic Design"],
    date: "Nov 2025",
    desc: `Spright Games is a new Minecraft DLC content company producing add-ons, maps and
            and skin packs. I translated their core values of friendliness and excitement
            into bright colors, bold shapes, and a recognizable aesthetic that could stand out in a
            busy digital storefront. My sketches began with the silhouette of the Minecraft allay,
            which I stylized and simplified to work at a small scale, and continued with logo ornaments
            and supporting graphics like the Mario-esque background and brandmark.`,
    slides: 6,
  },
  {
    id: "03",
    title: "STEM 4 ALL",
    categories: ["Graphic Design"],
    date: "February 2026",
    desc: `Full brand identity revamp for an evolving highschool FRC robotics team: Team 8224.
            STEM 4 ALL, previously Vanguard Robotics, is spreading FIRST values by focusing their 
            efforts on inclusivity and the belief that STEM is for everyone. Therefore, the
            logo I created simultaneously demonstrated unity - featuring a team-huddle of students putting
            their heads together - and connection to hands-on robotics experience - forming a sprocket shape.
            \n
            I optimized their logo for FRC avatar use, and it also features a forward moving title font,
            Hemi Head, that can be applied to bumper graphics. To complete the package I included 
            traditional FRC pin designs, a flashy print-all-over jersey, a distinct color palette including
            secondary color combinations, and a brand style guide to help unify their team image. `,
    slides: 7,
  },
  {
    id: "04",
    title: "Iron Bears",
    categories: ["Graphic Design"],
    date: "March 2025",
    desc: `FRC Team 854 has over 20 years of history competing in the FIRST Robotics Competition
    and continues to perform at the provincial level. For the 2024–2025 season, the team sought 
    a visual refresh that reflected its longevity and competitive standing while unifying a 
    collection of legacy graphics.\n
    I modernized the team’s historical mechanical bear logo, preserving its recognizable 
    character while refining its form and structure for contemporary use. From this mark, 
    I developed a visual brand used across team apparel, pit signage, engraved robot decals, 
    and other competition materials. All graphics were rebuilt as scalable vector assets to 
    ensure consistent reproduction across formats while accommodating common fabrication 
    constraints such as print size limits and engraving requirements.\n
    The resulting identity maintained continuity with the team’s established orange and black 
    school colors while introducing a cleaner, more modern aesthetic. The designs were produced 
    as merchandise for team members and used throughout competitions, becoming the team’s active 
    visual identity for the 2024–2025 season.`,
    slides: 6,
  },
  {
    id: "05",
    title: "TEDx Youth",
    categories: ["Graphic Design"],
    date: "Nov 2024",
    desc: `TED and its independently organized TEDx events maintain a highly recognizable 
    and carefully controlled visual identity. Motivated by the opportunity to work within 
    a refined brand, I entered a design competition for a local TEDx Youth branch 
    whose slogan is “Breaking Down Barriers.” \n
    My concepts visually interpreted the slogan by treating the “X” in TEDx as a structural 
    barrier, drawing inspiration from construction and demolition imagery to represent the 
    act of overcoming obstacles. The design works within TED’s bold, angular aesthetic while 
    introducing additional visual storytelling and structural detail. \n
    The concept won the design competition two years consecutively. Since then, my graphics
    have appeared regularly across event social media, promotional materials, and apparel,
    becoming a recurring visual element of the organization’s public-facing identity.`,
    slides: 6,
  },
  {
    id: "06",
    title: "Relay For Life",
    categories: ["Graphic Design"],
    date: "April 2025",
    desc: `Relay For Life is a global cancer fundraising initiative known for its community
    endurance events. When a local branch approached me for visual assets, I began by 
    researching the organization’s brand language and its emphasis on hope and perseverance.\n
    I designed a logo and brandmark inspired by relay race symbolism, incorporating batons 
    and ribbons to reference both racing and cancer awareness imagery. The graphics were 
    used across apparel, social media, and promotional materials for an event with over 200
    attendees.`,
    slides: 5,
  },
  {
    id: "07", 
    title: "A Shallow Past",
    categories: ["3D Visualization"],
    date: "Nov 2022",
    desc: `A Shallow Past draws inspiration from the Horizon video game series, which
    features submerged remnants of past civilizations. I focused on developing a believable 
    architectural layout and implied narrative for the structure, giving the environment a 
    sense of history and purpose. \n
    I gave particular attention to long-term decay and environmental storytelling. Aging
    materials, particulate simulations, shaders, and volumetric effects were used to convey
    the passage of time and the atmosphere of a submerged ruin.`,
    slides: 4,
  },
  {
    id: "08",
    title: "Spring Morning",
    categories: ["3D Visualization"],
    date: "Aug 2023",
    desc: `For Spring Morning, I explored realistic nature in 3D, focusing on immersive 
    vegetation, lighting, and atmosphere. I positioned a cottage using the rule of thirds 
    and populated the scene with procedural trees and grass. I added volumetric mist and a 
    meandering creek to enhance depth and guide the viewer’s eye, creating a serene, layered 
    environment.`,
    slides: 4,
  },
  {
    id: "09",
    title: "Orbital Ship",
    categories: ["3D Visualization"],
    date: "Mar 2024",
    desc: `I imagined a long-term transport system connecting Earth and Mars, 
    approaching space infrastructure as architecture rather than simply a vehicle. Drawing on biomimicry,
    I based my early sketches on organic forms—including an eyeball, a whale, and a fly—exploring shapes 
    that felt protective, balanced, and alive. \n
    The final design takes the form of a multilayered glass sphere surrounding a rotating internal ring. 
    As the station spins around its central axis, the ring generates artificial gravity, allowing it to 
    function as a habitable waypoint in deep space. The ring itself is tiered, subtly adapting to the 
    changing gravitational force experienced as one moves closer to or farther from the axis of rotation. \n
    Through sketches, digital modelling, and a physical model, I developed the concept as a permanent orbital
    destination—an enduring piece of infrastructure for interplanetary travel.`,
    slides: 5,
  },
  {
    id: "10",
    title: "Machine Replication - Horizon",
    categories: ["3D Visualization"],
    date: "Oct 2023",
    desc: `I’ve always been drawn to the mechanical creature design in Horizon Zero Dawn, particularly the 
    elegance of the game’s smallest machine: the Watcher. To explore that design language, I recreated the 
    creature as a low-poly model in Blender, translating the complex hard-surface forms of the original into
    a simplified mesh while preserving its distinctive silhouette and mechanical character. The model emphasizes 
    clean topology and hard-surface modelling techniques.\n
    I built a simple rig for posing and presentation, then placed the asset within a stylized low-poly forest 
    environment that I designed and modelled from scratch. All materials in the scene are procedural, with the 
    exception of the Horizon logos applied to the machine. I used controlled directional lighting to highlight 
    the mechanical structure of the model and create contrast within the environment. The forest assets developed 
    for this scene are optimized for reuse and are currently available for purchase on CGTrader.`,
    slides: 7,
  },
  {
    id: "11",
    title: "Family Field",
    categories: ["Photography"],
    date: "",
    desc: `Family Field was captured for a local division of the Bondar Challenge, named after Roberta Bondar, 
    where it was awarded third place. The photograph centers on two twin dandelions rising from an endless field 
    of their own kind, their stems intertwined within a landscape that stretches far beyond the frame. \n
    In editing the image, I emphasized the way the dandelions catch and reflect light, giving them a soft glow
    against the surrounding field. The scene became less about a single plant and more about relationships within 
    the environment. The pairing of the two flowers suggests connection and mutual support, while the vast field
    surrounding them evokes a quiet sense of belonging—an ecosystem where growth, companionship, and resilience 
    exist side by side.`,
    slides: 1,
  },
  {
    id: "12",
    title: "Quebec: Night",
    categories: ["Photography"],
    date: "",
    desc: `These photographs are the final images from my time in Québec, all captured at night. I’m drawn to 
    nighttime street photography because of the way artificial light transforms ordinary spaces, creating contrast 
    between illuminated areas and the small pockets of darkness that appear in streets, doorways, and alleyways. \n
    The first image in the set is my favourite and was captured using a long exposure of over 60 seconds on a tripod 
    to fully capture the ambient street lighting. The remaining photographs were taken handheld, requiring careful 
    stabilization to maintain sharpness in low light. I enjoy working in these conditions because it forces a slower,
    more deliberate approach to composition while allowing the textures of urban nightlife and subtle lighting to 
    shape the final image.`,
    slides: 3,
  },
  {
    id: "13",
    title: "Streets of Quebec",
    categories: ["Photography"],
    date: "",
    desc: `This set explores the intricate architecture found throughout the streets of Québec. While walking through 
    the city, I focused on capturing details in the stonework, arches, and glass that define many of its historic buildings.
    These photographs highlight the textures, patterns, and craftsmanship that often go unnoticed when moving quickly 
    through the streets.`,
    slides: 5,
  },
  {
    id: "14",
    title: "Le Château Frontenac",
    categories: ["Photography"],
    date: "",
    desc: `This series captures the interior architecture of the Château Frontenac in Québec City. The building is known for
    its historic design, where wood and stone are used extensively throughout the structure.\n
    In this set, I focused on interior details and architectural compositions, capturing the textures, structure, and craftsmanship
    found throughout the space. The photographs explore how light interacts with the wood and stone surfaces, highlighting the character
    and scale of the château’s interior.`,
    slides: 5,
  },
  //{
  //  id: "15",
  //  title: "Experimental Photo",
  //  categories: ["Photography"],
  //  date: "",
  //  desc: "Included in future updates",
  //  slides: 1,
  //},
  //{
  //  id: "16",
  //  title: "Winnipeg",
  //  categories: ["Photography"],
  //  date: "",
  //  desc: "Included in future updates",
  //  slides: 3,
  //},
  //{
  //  id: "17",
  //  title: "Japan 1",
  //  categories: ["Photography"],
  //  date: "",
  //  desc: "Included in future updates",
  //  slides: 3,
  //},
  //{
  //  id: "18",
  //  title: "Japan etc. 2",
  //  categories: ["Photography"],
  // date: "",
  //  desc: "Included in future updates",
  //  slides: 3,
  //},
];

// ── PORTFOLIO PAGE — SLIDE CAPTIONS ──────────────────────────────────────────
// Keyed as "pieceId-slideIndex" (0-based). Missing keys fall back to "Image N".

export const PORTFOLIO_CAPTIONS: Record<string, string> = {
  "01-0": "Challenge submission",
  "01-1": "Scene blocking and scale adjustment",
  "01-2": "Substitution of models developed in parallel",
  "01-3": "Sparse scene lighting from searchlights and transport ships",
  "02-0": "Final logomark",
  "02-1": "Rudimentary shape and style brainstorming",
  "02-2": "Further shape and rotation refinement",
  "02-3": "Embellishment",
  "02-4": "Background and supporting graphic development",
  "02-5": "Final brandmark",
  "03-0": "Logomark \u2014 full colour version.",
  "03-1": "Monochrome variant for dark backgrounds.",
  "03-2": "Letterhead and envelope system.",
  "03-3": "Pitch deck template \u2014 cover slide.",
  "03-4": "Pitch deck template \u2014 content slide.",
  "04-0": "Final logomark",
  "04-1": "Logo historical comparison",
  "04-2": "Final sweater design",
  "04-3": "Stylized sweater design presentation",
  "04-4": "Alternate sweater design",
  "04-5": "T-shirt sponsor graphic arrangements",
  "05-0": "Slant design | Logo graphic",
  "05-1": "Shatter design | Sweater graphic",
  "05-2": "Shatter design with initial sketches",
  "05-3": "Rolling design",
  "05-4": "Stylized sweater design presentation - 2024",
  "05-5": "Stylized sweater design presentation - 2025",
  "06-0": "Final logomark",
  "06-1": "Baton and ribbon alternate logo",
  "06-2": "Flower alternate logo",
  "06-3": "Baton and ribbon alternate logo 2",
  "06-4": "Stylized sweater design presentation",
  "07-0": "Final image",
  "07-1": "Grayscale render",
  "07-2": "Raw Blender render",
  "07-3": "Alternate perspective grayscale render",
  "08-0": "Final image",
  "08-1": "Fog, post processing, and environment tweaks removed",
  "08-2": "Vegetation refinement",
  "08-3": "Basic scene blocking",
  "09-0": "Final ship design image 1",
  "09-1": "Final ship design image 2",
  "09-2": "Final ship design image 3",
  "09-3": "Ship subsystem breakdown",
  "09-4": "Initial organism-based sketches",
  "10-0": "Watchers in the forest - environment",
  "10-1": "Watchers in the forest - close up",
  "10-2": "Watchers in the forest - close up grayscale",
  "10-3": "Textured watcher model 1",
  "10-4": "Watcher model grayscale 1",
  "10-5": "Textured watcher model 2",
  "10-6": "Watcher model grayscale 2",
};
