/**
 * Utility functions for safe text formatting and data extraction across Tasklync application.
 */

/**
 * Safely formats category IDs or raw category strings into readable category labels.
 * Replaces all underscores, handles null/undefined inputs gracefully, and applies upper/title casing.
 *
 * @example
 * formatCategoryName('ac_repair') => 'AC REPAIR'
 * formatCategoryName(undefined, 'GENERAL') => 'GENERAL'
 * formatCategoryName('deep_cleaning_home', 'CLEANING', 'title') => 'Deep Cleaning Home'
 */
export const formatCategoryName = (
  categoryId?: string | null,
  fallback: string = 'SERVICE',
  casing: 'uppercase' | 'title' = 'uppercase'
): string => {
  if (!categoryId || typeof categoryId !== 'string') {
    return fallback.toUpperCase();
  }

  const cleaned = categoryId.replace(/_/g, ' ').trim();
  if (!cleaned) return fallback.toUpperCase();

  if (casing === 'title') {
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return cleaned.toUpperCase();
};

/**
 * Robust numeric price parser that converts string representations (e.g. "3000.00", "800.00")
 * or numeric inputs into valid floats, returning a specified fallback if invalid.
 */
export const parsePriceNumber = (val: any, fallback: number = 0): number => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
};

/**
 * Safely extracts service price from any service data object,
 * normalizing camelCase (`basePrice`, `startingPrice`), snake_case (`base_price`, `starting_price`), `price`, or `customPrice`.
 * Correctly converts stringified prices (e.g. "3000.00") from backend JSON APIs without defaulting to hardcoded fallbacks.
 */
export const getServicePrice = (item: any, fallbackPrice: number = 0): number => {
  if (!item || typeof item !== 'object') return fallbackPrice;

  const candidateKeys = [
    item.base_price,
    item.basePrice,
    item.starting_price,
    item.startingPrice,
    item.price,
    item.custom_price,
    item.customPrice,
    item.hourly_rate,
    item.hourlyRate,
  ];

  for (const keyVal of candidateKeys) {
    if (keyVal !== undefined && keyVal !== null && keyVal !== '') {
      const parsed = parsePriceNumber(keyVal, -1);
      if (parsed > 0) return parsed;
    }
  }

  return fallbackPrice;
};
