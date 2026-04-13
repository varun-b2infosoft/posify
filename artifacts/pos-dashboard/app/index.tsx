import { Redirect } from "expo-router";
import { getAuthState } from "@/store/auth";

export default function Index() {
  const auth = getAuthState();
  if (!auth.isLoggedIn) return <Redirect href="/auth/welcome" />;
  if (!auth.hasPinSetup) return <Redirect href="/auth/pin-setup" />;
  if (!auth.pinVerified) return <Redirect href="/auth/pin-entry" />;
  return <Redirect href="/(tabs)" />;
}
