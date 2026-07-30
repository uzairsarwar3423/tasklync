import { Category, Service } from '../../types/category.types';
import { parsePriceNumber } from '../../utils/formatters';

/**
 * Data Mapper for Category & Master Service endpoints (Spec v2.0.0 Modules 1 & 2)
 */

export const mapRawCategory = (raw: any): Category => {
  return {
    id: raw.id || raw.slug || '',
    name: raw.name || 'Category',
    nameUr: raw.name_ur || raw.nameUr || null,
    iconUrl: raw.icon_url || raw.iconUrl || null,
    parentId: raw.parent_id || raw.parentId || null,
    isActive: raw.is_active ?? raw.isActive ?? true,
    sortOrder: raw.sort_order || raw.sortOrder || 1,
    serviceCount: raw.service_count || raw.serviceCount,
  };
};

export const mapRawService = (raw: any): Service => {
  const rawPrice = raw.base_price ?? raw.basePrice ?? raw.starting_price ?? raw.startingPrice ?? raw.price;
  const basePrice = parsePriceNumber(rawPrice, 0);

  const priceTypeRaw = raw.price_type || raw.priceType || raw.price_unit;
  const priceType = priceTypeRaw === 'hourly' || priceTypeRaw === 'PER_HOUR' ? 'hourly' : priceTypeRaw === 'quote' || priceTypeRaw === 'QUOTE' ? 'quote' : 'fixed';

  return {
    id: raw.id || '',
    categoryId: raw.category_id || raw.categoryId || '',
    name: raw.title || raw.name || 'Service',
    nameUr: raw.name_ur || raw.title_ur || raw.nameUr || null,
    description: raw.description || null,
    basePrice,
    priceType,
    minDurationMins: raw.min_duration_mins || raw.minDurationMins || (raw.estimated_duration_hours ? raw.estimated_duration_hours * 60 : 45),
    iconUrl: raw.icon_url || raw.iconUrl || null,
    isActive: raw.is_active ?? raw.isActive ?? true,
    sortOrder: raw.sort_order || raw.sortOrder || 1,
  };
};
