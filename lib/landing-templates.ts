export interface LandingTemplate {
  id: string;
  name: string;
  description: string;
  styleBrief: string;
}

export const DEFAULT_TEMPLATE_ID = 'dark_matte';

export const LANDING_TEMPLATES: LandingTemplate[] = [
  {
    id: 'dark_matte',
    name: 'Dark Matte',
    description: 'Modern dark theme with matte surfaces and subtle contrast.',
    styleBrief:
      'dark theme, modern matte design with charcoal backgrounds, soft borders, and muted accent highlights',
  },
  {
    id: 'light_minimal',
    name: 'Light Minimal',
    description: 'Clean white layout with generous whitespace and crisp typography.',
    styleBrief:
      'light minimal design with white/off-white backgrounds, generous whitespace, thin borders, and a single accent color',
  },
  {
    id: 'bold_gradient',
    name: 'Bold Gradient',
    description: 'Vibrant gradients, high energy, and strong visual punch.',
    styleBrief:
      'bold gradient hero with vibrant purple-to-blue or orange-to-pink gradients, high contrast CTAs, and energetic typography',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional, trustworthy layout suited for B2B products.',
    styleBrief:
      'corporate professional design with navy/slate palette, structured grid, trust badges, and conservative typography',
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Friendly rounded shapes, warm colors, and approachable tone.',
    styleBrief:
      'playful friendly design with rounded corners, warm pastel accents, soft shadows, and approachable sans-serif typography',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style layout with strong typography hierarchy.',
    styleBrief:
      'editorial magazine-style layout with serif headlines, asymmetric sections, strong typographic hierarchy, and refined spacing',
  },
];

export function resolveTemplate(id: string | null | undefined): LandingTemplate {
  const found = LANDING_TEMPLATES.find((t) => t.id === id);
  return found ?? LANDING_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;
}
