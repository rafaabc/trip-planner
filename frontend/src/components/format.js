export const CATEGORIES = [
  'Flights',
  'Accommodation',
  'Activities',
  'Food',
  'Transport',
  'Travel insurance',
  'Extras',
];

export function formatDKK(value) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 2,
  }).format(value || 0);
}
