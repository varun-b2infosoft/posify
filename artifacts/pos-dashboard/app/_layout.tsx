import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"               options={{ headerShown: false }} />
      <Stack.Screen name="auth/welcome"        options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="auth/login"          options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="auth/register"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="auth/pin-setup"      options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="auth/pin-entry"      options={{ headerShown: false, animation: "fade" }} />
      <Stack.Screen name="(tabs)"              options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]"    options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="product/edit"    options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="purchase/new"    options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="purchase/[id]"   options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="suppliers/edit"   options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="shops/index"          options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="shops/[id]"           options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="shops/edit"           options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="shops/staff-edit"     options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="transfer/new"         options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="transfer/[id]"        options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="reports/index"        options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="expenses/index"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="customers/index"      options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="customers/[id]"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="credit/index"         options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="credit/[id]"          options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="invoices/index"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="invoices/[id]"        options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="notifications/index"  options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="settings/index"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="returns/index"        options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="delivery/index"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="delivery/[id]"        options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="security/index"       options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/index"           options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="store-settings/index"    options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="receipt-settings/index" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/guide"             options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/videos"            options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/terms"             options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/privacy"           options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="help/licenses"          options={{ headerShown: false, animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Explicitly load icon fonts so they render correctly on Android
    ...Feather.font,
    ...AntDesign.font,
    ...FontAwesome.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
