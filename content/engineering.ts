// Engineering portfolio entries. Newest / strongest first.
//
// HOW TO ADD A PROJECT
//   1. Put images in public/engineering/images/<id>/ (0.jpg is the cover),
//      videos in public/engineering/videos/<id>/ and PDFs in
//      public/engineering/documents/.
//   2. Append an entry below. `tools` and `skills` show as chips and feed the
//      toolbox filter at the top of /engineering — recruiters scan these.
//   3. `domains` drive the filter tabs; add a new Domain if needed.

export type Domain = "Robotics" | "Mechanical & CAD" | "Software & AI" | "Fabrication" | "Research";

export const DOMAINS: Domain[] = ["Robotics", "Mechanical & CAD", "Software & AI", "Fabrication", "Research"];

export interface Figure {
  src: string;
  caption: string;
  /** Crop anchor for the 4:3 list thumbnail (CSS object-position). The lightbox always shows the full image. */
  focus?: string;
}

export interface Author {
  name: string;
  me?: boolean;
  equal?: boolean;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  status?: string;
  /** Role or organisation line under the title. */
  context?: string;
  domains: Domain[];
  summary: string;
  points: string[];
  tools: string[];
  skills: string[];
  figures: Figure[];
  links?: { label: string; href: string }[];
  publication?: {
    authors: Author[];
    affiliations: string;
    venue: string;
    /** Components of the research system (not a claim of personal work). */
    system: string[];
  };
}

const img = (id: string, n: number, ext = "jpg") => `/engineering/images/${id}/${n}.${ext}`;

export const PROJECTS: Project[] = [
  {
    id: "haptic-imitation-learning",
    title: "Haptic feedback in demonstration collection",
    date: "2026",
    context: "National Research Council Canada · University of Waterloo",
    domains: ["Research", "Robotics", "Software & AI"],
    summary:
      "A teleoperation setup that streams contact forces back to the operator, and a study of what that feedback does to robot training data and learned policies.",
    points: [
      "With haptic feedback, operators applied 64% less peak force in a bottle-cap press (median 71.3 N → 25.7 N).",
      "Contact maintenance while wiping a whiteboard rose 45.3%.",
      "Diffusion policies trained on either dataset reached similar success (100% vs 90%, 68% vs 65%), pointing to task selection as the bottleneck.",
      "Proposes force-observability as a criterion for choosing contact-rich benchmark tasks.",
    ],
    // TODO(Aidan): add the tools you personally used and the skills you built.
    tools: [],
    skills: [],
    figures: [
      { src: "/engineering/images/haptic-imitation-learning/cover.png", caption: "Force-blind vs force-streamed teleoperation" },
      { src: img("haptic-imitation-learning", 0, "png"), caption: "Fig. 1: framework overview" },
      { src: img("haptic-imitation-learning", 1, "png"), caption: "Fig. 2: haptic feedback loop" },
    ],
    links: [{ label: "Paper (PDF)", href: "/engineering/documents/ICRA-paper.pdf" }],
    publication: {
      authors: [
        { name: "Joanna Peng", equal: true },
        { name: "Aidan Schreder", me: true, equal: true },
        { name: "Yiran Liu", equal: true },
        { name: "Manjot Dola" },
        { name: "Benjamin Tran" },
        { name: "Yue Hu" },
        { name: "Pengcheng Xi" },
      ],
      affiliations: "National Research Council Canada; University of Waterloo",
      // TODO(Aidan): confirm the full venue (main conference or a workshop, and year).
      venue: "ICRA",
      system: ["UR10e over RTDE", "Haply Inverse3 + VerseGrip", "Robotiq gripper", "2× RealSense RGB", "6-DoF force–torque sensor", "Diffusion Policy (ResNet-18, 1D U-Net)"],
    },
  },
  {
    id: "cubesat-camera-mount",
    title: "Dual-camera CubeSat payload mount",
    date: "May 2026",
    status: "In progress",
    context: "Payload for detecting resident space objects",
    domains: ["Mechanical & CAD"],
    summary: "Mounting interface for a thermal and visible-light imaging payload on a CubeSat.",
    points: [
      "Integrates a Lepton 3.1R thermal IR sensor and an Arducam visible-light sensor to help detect resident space objects (RSOs).",
      "Selected both cameras from a trade study of resolution, size and performance across several modules.",
      "Iterated the mount to fit a 90 × 94 mm frame around wiring, PCB and vibration-isolation constraints.",
      "Wrote integration studies for each camera covering mechanical, electrical and software details.",
    ],
    tools: ["SolidWorks"],
    skills: ["Trade studies", "Envelope-constrained design", "Vibration isolation", "Technical documentation"],
    figures: [
      { src: img("cubesat-camera-mount", 0), caption: "Camera mount, front (CAD)" },
      { src: img("cubesat-camera-mount", 1), caption: "Mount inside the frame (CAD)" },
      { src: img("cubesat-camera-mount", 2), caption: "Full stack" },
      { src: img("cubesat-camera-mount", 3), caption: "Plate iteration" },
      { src: img("cubesat-camera-mount", 4), caption: "Plate iteration" },
    ],
    links: [
      { label: "Arducam study", href: "https://docs.google.com/document/d/1C9PZT4D4EHVm2vDjRq-xbvJ4Jv_58vKGbOp-45ws-u4/edit?usp=drive_link" },
      { label: "Lepton study", href: "https://docs.google.com/document/d/14lzGTCDDUtCdJIiL9BMB718VrBODPgVoltelENJmziE/edit?usp=drive_link" },
    ],
  },
  {
    id: "ai-compass",
    title: "AI Compass",
    date: "May 2026",
    domains: ["Software & AI"],
    summary: "Full-stack web app that routes a user's project to the AI model best suited to it.",
    points: [
      "Cross-references prompt context against a capability dataset of public AI services, with Claude Haiku 4.5 as the reasoning engine.",
      "Designed the REST API layer and the React frontend end to end.",
      "Deployed on Vercel with server-side inference calls to the Anthropic API.",
    ],
    tools: ["React", "REST APIs", "Vercel", "Anthropic API"],
    skills: ["Full-stack development", "API design", "LLM integration", "UI/UX"],
    figures: [
      { src: img("ai-compass", 0), caption: "Model library" },
      { src: img("ai-compass", 1), caption: "Recommendation view" },
    ],
    links: [{ label: "Live app", href: "https://theaicompass.vercel.app/" }],
  },
  {
    id: "frc-reefscape",
    title: "FRC Reefscape robot",
    date: "2025 season",
    context: "Captain, FRC Team 854",
    domains: ["Robotics", "Mechanical & CAD", "Fabrication"],
    summary: "Led the design and build of a full-size competition robot for the 2025 FIRST Robotics Competition season.",
    points: [
      "Ran kickoff ideation: members pitched concepts in groups, and I documented and curated them into an idea summary.",
      "Blocked out the shortlisted designs in 3D to check dimensions and orientation and give the team a shared reference.",
      "Built wood prototypes with metal axles to test game-piece compression and intake efficiency.",
      "Riveted, machined and assembled components; worked with the electrical leads on cable routing to reduce snagging and fatigue.",
      "Helped revise the design after early testing showed steering instability. The robot competed at the provincial level.",
    ],
    tools: ["3D CAD", "Riveting", "Machining"],
    skills: ["Team leadership", "Design review", "Rapid prototyping", "Cable management", "Manufacturing & assembly"],
    figures: [
      { src: img("frc-reefscape", 0), caption: "The robot at competition" },
      { src: img("frc-reefscape", 1), caption: "3D block-out of candidate designs" },
      { src: img("frc-reefscape", 2), caption: "Design versions VG → V2.1" },
      { src: img("frc-reefscape", 3), caption: "Intake prototype" },
      { src: img("frc-reefscape", 4), caption: "Game-piece compression test" },
      { src: img("frc-reefscape", 5), caption: "Prototype mechanism" },
      { src: img("frc-reefscape", 6), caption: "On the field" },
      { src: img("frc-reefscape", 7), caption: "Elevator and cable chain" },
      { src: img("frc-reefscape", 8), caption: "Kickoff idea summary" },
    ],
  },
  {
    id: "satellite-repair-ship",
    title: "Satellite repair ship",
    date: "Jan 2025",
    domains: ["Mechanical & CAD", "Fabrication"],
    summary: "A scaled two-stage spacecraft of my own design, 3D printed with a working robotic arm.",
    points: [
      "Two-stage satellite-repair vehicle with a fully articulated, printable 4-DOF arm, a deployable door and mechanical stage locking.",
      "Assembles without adhesives.",
      "Early prototypes failed from joint binding and structural fragility; fixed over several redesign-and-test rounds.",
      "Tuned tolerances, wall thickness, print orientation and variable infill until motion was reliable.",
    ],
    tools: ["SolidWorks", "FDM printing", "PLA"],
    skills: ["Design for FDM", "Tolerance tuning", "Articulated printed joints", "Iterative testing"],
    figures: [
      { src: img("satellite-repair-ship", 0), caption: "Stages separated" },
      { src: img("satellite-repair-ship", 1), caption: "Assembled print" },
      { src: img("satellite-repair-ship", 2), caption: "Arm detail" },
      { src: img("satellite-repair-ship", 3), caption: "Section drawings" },
      { src: img("satellite-repair-ship", 4), caption: "Top and side drawings" },
    ],
  },
  {
    id: "camera-roller",
    title: "Camera Roller",
    date: "Jan 2024",
    context: "Product design",
    domains: ["Mechanical & CAD", "Fabrication"],
    summary: "A low-cost camera slider built from 3D-printed parts and hardware-store components.",
    points: [
      "Slider and dolly for side-scrolling shots: the camera rides a rolling platform along aluminum rails.",
      "Entry-level equivalents can cost up to $1,000; this one uses printed parts and off-the-shelf hardware.",
      "Main constraints were keeping vibration down and getting smooth motion from cheap components.",
      "40 × 7 × 4.5 in. Used on several film projects since.",
    ],
    tools: ["Fusion 360", "Adobe Photoshop", "FDM printing", "PLA"],
    skills: ["Product design", "Design for off-the-shelf parts", "Vibration reduction"],
    figures: [
      { src: img("camera-roller", 0), caption: "Render" },
      { src: img("camera-roller", 1), caption: "Carriage on the rails" },
      { src: img("camera-roller", 2), caption: "Printed carriage and end caps" },
      { src: img("camera-roller", 3), caption: "Render on tripods" },
      { src: img("camera-roller", 4), caption: "Orthographic sketches" },
    ],
    links: [{ label: "Full report", href: "https://docs.google.com/document/d/1m0sjLIsY6GdFfvXL2pImwIkfhiK4A0CMinb2Y4O9dDo/edit?tab=t.0" }],
  },
];

/** Every tool across projects, most-used first. */
export function toolbox(projects = PROJECTS): { tool: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.tools) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].map(([tool, count]) => ({ tool, count })).sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool));
}
