export const PROFESSIONAL_SLUGS = [
  'doctors',
  'pharmacists',
  'medical-representatives',
];

export const LINKING_RULES: Record<string, string[]> = {
  'hospitals': ['medicals', 'doctors'],
  'medicals': ['pharmacists'],
  'diagnostics': ['doctors'],
  'laboratories': ['doctors'],
};

export const isProfessional = (slug: string | undefined | null): boolean =>
  !!slug && PROFESSIONAL_SLUGS.includes(slug);

export const canLinkTo = (senderSlug: string, targetSlug: string): boolean =>
  (LINKING_RULES[senderSlug] ?? []).includes(targetSlug);
