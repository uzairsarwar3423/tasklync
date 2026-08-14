import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface BookingWorkerRowProps {
  workerName?: string | undefined;
  categoryName?: string | undefined;
  workerAvatarUrl?: string | undefined;
}

export function BookingWorkerRow({ workerName, categoryName, workerAvatarUrl }: BookingWorkerRowProps) {
  const displayCategory = categoryName || 'Service';
  const displayWorkerName = workerName && workerName !== 'Unknown Worker'
    ? workerName
    : categoryName
    ? `Assigned ${categoryName.replace(/s$/i, '')}`
    : 'Assigned Professional';

  const avatarInitial = displayWorkerName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      {workerAvatarUrl ? (
        <Image source={{ uri: workerAvatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {avatarInitial}
          </Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.workerName}>{displayWorkerName}</Text>
        <Text style={styles.categoryName}>{displayCategory}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#6B7280',
  },
  textContainer: {
    justifyContent: 'center',
  },
  workerName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#111827',
  },
  categoryName: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
