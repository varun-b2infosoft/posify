import React from "react";
import { View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface MiniBarChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniBarChart({ data, color, height = 60 }: MiniBarChartProps) {
  const colors = useColors();
  const barColor = color || colors.primary;
  const max = Math.max(...data, 1);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((val, idx) => {
        const barH = Math.max((val / max) * height, 4);
        const isLast = idx === data.length - 1;
        return (
          <View key={idx} style={[styles.barWrap, { height }]}>
            <View
              style={[
                styles.bar,
                {
                  height: barH,
                  backgroundColor: isLast ? barColor : barColor + "55",
                  borderRadius: 3,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  barWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
  },
});
