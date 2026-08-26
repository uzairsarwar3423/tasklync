import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { usePaymentMethods } from '../../src/hooks/usePaymentMethods';
import { AddWalletDTO, AddCardDTO } from '../../src/types/payment.types';
import {
  PaymentMethodCard,
  PaymentMethodCardSkeleton,
  PaymentMethodSwipeActions,
  AddCardSheet,
  AddCardButton,
  PaymentEmptyState,
} from '../../src/components/payment';
import { colors, palette, fontFamily, fontSize, spacing, shadows } from '../../src/design';
import * as Haptics from 'expo-haptics';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    methods,
    isLoading,
    addWallet,
    addCard,
    deleteMethod,
    setDefaultMethod,
    isAdding,
  } = usePaymentMethods();

  const [addSheetVisible, setAddSheetVisible] = useState<boolean>(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const handleAddWalletSubmit = async (dto: AddWalletDTO) => {
    const res = await addWallet(dto);
    if (res?.id) {
      setNewlyAddedId(res.id);
      setTimeout(() => setNewlyAddedId(null), 1000);
    }
  };

  const handleAddCardSubmit = async (dto: AddCardDTO) => {
    const res = await addCard(dto);
    if (res?.id) {
      setNewlyAddedId(res.id);
      setTimeout(() => setNewlyAddedId(null), 1000);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgApp} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} maxFontSizeMultiplier={1.3}>
          Payment Methods
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <PaymentMethodCardSkeleton />
            <PaymentMethodCardSkeleton />
            <PaymentMethodCardSkeleton />
          </View>
        ) : methods.length === 0 ? (
          <PaymentEmptyState onAddPress={() => setAddSheetVisible(true)} />
        ) : (
          <FlatList
            data={methods}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: spacing.xs,
              paddingBottom: insets.bottom + 80,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PaymentMethodSwipeActions
                method={item}
                onDelete={(id) => deleteMethod(id)}
              >
                <PaymentMethodCard
                  method={item}
                  isNewlyAdded={item.id === newlyAddedId}
                  onSetDefault={(id) => setDefaultMethod(id)}
                />
              </PaymentMethodSwipeActions>
            )}
          />
        )}
      </View>

      {/* Sticky Bottom Footer CTA */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AddCardButton
          label="+ Add New Payment Method"
          onPress={() => setAddSheetVisible(true)}
        />
      </View>

      {/* Add Payment Method Bottom Sheet */}
      <AddCardSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onAddWallet={handleAddWalletSubmit}
        onAddCard={handleAddCardSubmit}
        isLoading={isAdding}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgApp,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.iceGray,
  },
  headerTitle: {
    fontFamily: fontFamily.poppins.semiBold,
    fontSize: fontSize.h3,
    color: colors.textPrimary,
  },
  headerRightSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  skeletonContainer: {
    gap: spacing.xs,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.md,
  },
});
