import React from 'react';

export interface Category {
  id: string;
  name: string;
  nameUr: string | null;
  iconUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  serviceCount?: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  nameUr: string | null;
  description: string | null;
  basePrice: number | null;
  priceType: 'fixed' | 'hourly' | 'quote';
  minDurationMins: number;
  iconUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryWithServices extends Category {
  services: Service[];
}

export type CategoryIconMap = Record<string, React.ComponentType<any>>;
