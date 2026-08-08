import { FC, useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { CartItem as CartItemType } from '../../store/cart.store';
import { CartItem } from './CartItem';
import { SwipeToDeleteRow } from './SwipeToDeleteRow';
import { CartSkeletonItem } from './CartSkeletonItem';

interface CartItemListProps {
  items: CartItemType[];
  isLoading?: boolean;
  onIncrement: (serviceId: string) => void;
  onDecrement: (serviceId: string) => void;
  onRemoveItem: (serviceId: string) => void;
}

export const CartItemList: FC<CartItemListProps> = ({
  items,
  isLoading = false,
  onIncrement,
  onDecrement,
  onRemoveItem,
}) => {
  const renderItem = useCallback(
    ({ item }: { item: CartItemType }) => (
      <SwipeToDeleteRow onDelete={() => onRemoveItem(item.serviceId)}>
        <CartItem
          item={item}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </SwipeToDeleteRow>
    ),
    [onIncrement, onDecrement, onRemoveItem]
  );

  if (isLoading) {
    return (
      <View style={styles.listContainer}>
        <CartSkeletonItem />
        <CartSkeletonItem />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.serviceId}
      renderItem={renderItem}
      scrollEnabled={false} // Container view handles outer scrolling
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 4,
  },
});
