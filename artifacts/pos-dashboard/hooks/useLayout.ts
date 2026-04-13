import { Platform, useWindowDimensions } from "react-native";

export interface Layout {
  width:     number;
  height:    number;
  isMobile:  boolean;
  isTablet:  boolean;
  isDesktop: boolean;
  isWide:    boolean;
  cols:      2 | 3 | 4;
  maxContentWidth: number;
  sidebarWidth: number;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  const isWide    = isWeb && width >= 768;
  const isTablet  = isWeb && width >= 768  && width < 1100;
  const isDesktop = isWeb && width >= 1100;

  const sidebarWidth = isDesktop ? 240 : isTablet ? 200 : 0;
  const contentWidth = isWide ? width - sidebarWidth : width;
  const maxContentWidth = isDesktop ? 1100 : isTablet ? 900 : width;

  const cols: 2 | 3 | 4 =
    contentWidth >= 900 ? 4 :
    contentWidth >= 600 ? 3 : 2;

  return {
    width,
    height,
    isMobile:  !isWide,
    isTablet,
    isDesktop,
    isWide,
    cols,
    maxContentWidth,
    sidebarWidth,
  };
}
