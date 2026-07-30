import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Service } from '../../types/category.types';
import { ServiceListItem } from '../service/ServiceListItem';
import { SkeletonServiceListItem } from '../ui/Skeleton/SkeletonServiceListItem';
import { EmptyState } from '../feedback/EmptyState/EmptyState';
import { StickyListHeader } from '../ui/List/StickyListHeader';

import { formatCategoryName, getServicePrice } from '../../utils/formatters';

interface CategoryServicesListProps {
  categoryId: string;
  services: Service[];
  isLoading: boolean;
  workerId?: string | null;
}

const AnyFlashList = FlashList as any;

export const CategoryServicesList: React.FC<CategoryServicesListProps> = ({
  categoryId,
  services,
  isLoading,
}) => {
  const renderItem = ({ item }: { item: Service }) => {
    const rawCategoryId = item?.categoryId || (item as any)?.category_id || categoryId;
    const categoryName = formatCategoryName(rawCategoryId, categoryId || 'SERVICE');
    const price = getServicePrice(item, 500);

    return (
      <ServiceListItem
        id={item?.id || ''}
        name={item?.name || 'Service'}
        categoryName={categoryName}
        duration={`${item?.minDurationMins || 45} mins`}
        startingPrice={price}
        currency="Rs"
        iconName={categoryId === 'ac_repair' ? 'wind' : categoryId === 'electrician' ? 'zap' : 'wrench'}
        isHeader={false}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StickyListHeader
          title="Services"
          count={0}
        />
        <View style={styles.skeletons}>
          <View style={styles.gridItem}><SkeletonServiceListItem /></View>
          <View style={styles.gridItem}><SkeletonServiceListItem /></View>
          <View style={styles.gridItem}><SkeletonServiceListItem /></View>
          <View style={styles.gridItem}><SkeletonServiceListItem /></View>
        </View>
      </View>
    );
  }

  if (services.length === 0) {
    return (
      <View style={styles.container}>
        <StickyListHeader
          title="Services"
          count={0}
        />
        <EmptyState
          title="No services listed for this category yet"
          subtitle="Please check back later or choose another category."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnyFlashList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item: Service) => item.id}
        estimatedItemSize={180}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <StickyListHeader
            title="Services"
            count={services.length}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  columnWrapper: {
    // Flex: 1 with marginHorizontal handles alignment
  },
  skeletons: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
  },
});
