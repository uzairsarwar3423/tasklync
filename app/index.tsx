import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Auth check will go here when store is implemented
  // For now, redirect to auth flow
  return <Redirect href="/(auth)" />;
}
