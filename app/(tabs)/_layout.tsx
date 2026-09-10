import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/layout/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
