// 3D pieces (Blender renders, models, animation), in display order.
// Images live in public/3d/images/<id>/ (0.jpg is the cover), videos in
// public/3d/videos/<id>/ and web models in public/3d/models/.

export interface ThreeDPiece {
  id: string;
  title: string;
  date: string;
  tags: string[];
  text: string[];
  captions: string[];
  links?: { label: string; href: string }[];
  /**
   * A short silent loop at public/3d/videos/<id>/preview.mp4 that plays over
   * the card's still while it's hovered (on touch screens, while it's in view).
   */
  preview?: boolean;
}

export const THREE_D: ThreeDPiece[] = [
  {
    id: "research-and-sample-pod-13",
    title: "Research and Sample Pod #13",
    date: "April 2026",
    tags: ["Modelling", "Animation", "Sound design"],
    text: [
      "Animated sci-fi short film with original modelling, texturing, rendering, video editing and sound design, made with Blender, Premiere Pro and the eSpeak NG package for robotic text-to-speech. Early unedited frames pictured here.",
    ],
    captions: ["Unedited frame", "Unedited frame", "Unedited frame", "Unedited frame"],
    links: [{ label: "Watch on YouTube", href: "https://youtu.be/NnYOx5x_wQg" }],
    preview: true,
  },
  {
    id: "orbital-ship",
    title: "Orbital Ship",
    date: "Mar 2024",
    tags: ["Concept design", "Modelling", "Physical model"],
    text: [
      "I imagined a long-term transport system connecting Earth and Mars, approaching space infrastructure as architecture rather than simply a vehicle. Drawing on biomimicry, I based my early sketches on organic forms, including an eyeball, a whale, and a fly, exploring shapes that felt protective, balanced, and alive.",
      "The final design takes the form of a multilayered glass sphere surrounding a rotating internal ring. As the station spins around its central axis, the ring generates artificial gravity, allowing it to function as a habitable waypoint in deep space. The ring itself is tiered, subtly adapting to the changing gravitational force experienced as one moves closer to or farther from the axis of rotation.",
      "Through sketches, digital modelling, and a physical model, I developed the concept as a permanent orbital destination: an enduring piece of infrastructure for interplanetary travel.",
    ],
    captions: ["Final ship design image 1", "Final ship design image 2", "Final ship design image 3", "Ship subsystem breakdown", "Initial organism-based sketches"],
  },
  {
    id: "machine-replication-horizon",
    title: "Machine Replication: Horizon",
    date: "Oct 2023",
    tags: ["Hard-surface", "Low-poly", "Rigging"],
    text: [
      "I’ve always been drawn to the mechanical creature design in Horizon Zero Dawn, particularly the elegance of the game’s smallest machine: the Watcher. To explore that design language, I recreated the creature as a low-poly model in Blender, translating the complex hard-surface forms of the original into a simplified mesh while preserving its distinctive silhouette and mechanical character. The model emphasizes clean topology and hard-surface modelling techniques.",
      "I built a simple rig for posing and presentation, then placed the asset within a stylized low-poly forest environment that I designed and modelled from scratch. All materials in the scene are procedural, with the exception of the Horizon logos applied to the machine. I used controlled directional lighting to highlight the mechanical structure of the model and create contrast within the environment. The forest assets developed for this scene are available for purchase on CGTrader.",
    ],
    captions: [
      "Watchers in the forest: environment",
      "Watchers in the forest: close up",
      "Watchers in the forest: close up, grayscale",
      "Textured Watcher model 1",
      "Watcher model grayscale 1",
      "Textured Watcher model 2",
      "Watcher model grayscale 2",
    ],
  },
  {
    id: "a-shallow-past",
    title: "A Shallow Past",
    date: "Nov 2022",
    tags: ["Environment", "Simulation"],
    text: [
      "A Shallow Past draws inspiration from the Horizon video game series, which features submerged remnants of past civilizations. I focused on developing a believable architectural layout and implied narrative for the structure, giving the environment a sense of history and purpose.",
      "I gave particular attention to long-term decay and environmental storytelling. Aging materials, particulate simulations, shaders, and volumetric effects were used to convey the passage of time and the atmosphere of a submerged ruin.",
    ],
    captions: ["Final image", "Grayscale render", "Raw Blender render", "Alternate perspective grayscale render"],
  },
  {
    id: "spring-morning",
    title: "Spring Morning",
    date: "Aug 2023",
    tags: ["Environment", "Procedural"],
    text: [
      "For Spring Morning, I explored realistic nature in 3D, focusing on immersive vegetation, lighting, and atmosphere. I positioned a cottage using the rule of thirds and populated the scene with procedural trees and grass. I added volumetric mist and a meandering creek to enhance depth and guide the viewer’s eye.",
    ],
    captions: ["Final image", "Fog, post processing, and environment tweaks removed", "Vegetation refinement", "Basic scene blocking"],
  },
  {
    id: "evacuation",
    title: "Evacuation",
    date: "July 2021",
    tags: ["Challenge entry", "Simulation"],
    text: [
      "In the aftermath of a devastating war, the Earth is destroyed. Citizens flee to advanced stations and refugee camps on other celestial bodies, including the moon. This image was a submission to the CGBoost “Life on a Train” render challenge.",
      "I used smoke and fire simulations, advanced texturing and realistic lighting as I gradually built the scene, which took me approximately 14 hours.",
    ],
    captions: ["Challenge submission", "Scene blocking and scale adjustment", "Substitution of models developed in parallel", "Sparse scene lighting from searchlights and transport ships"],
  },
];
