import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  UNITS,
  addProduct,
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/store/products";

type FormData = {
  name: string;
  price: string;
  sku: string;
  category: string;
  unit: string;
  stock: string;
  lowStockThreshold: string;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  hint?: string;
}) {
  const colors = useColors();
  return (
    <View style={fieldStyles.wrap}>
      <Text style={[fieldStyles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
      />
      {hint && <Text style={[fieldStyles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{hint}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:  { gap: 5 },
  label: { fontSize: 13 },
  input: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 15,
  },
  hint: { fontSize: 11 },
});

function PickerRow({
  label,
  options,
  value,
  onChange,
  getColor,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  getColor?: (opt: string) => string | null;
}) {
  const colors = useColors();
  return (
    <View style={pickerStyles.wrap}>
      <Text style={[pickerStyles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={pickerStyles.options}>
        {options.map((opt) => {
          const active = value === opt;
          const col = getColor ? (getColor(opt) ?? colors.primary) : colors.primary;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                pickerStyles.chip,
                {
                  backgroundColor: active ? col : colors.card,
                  borderColor: active ? col : colors.border,
                },
              ]}
            >
              <Text style={[pickerStyles.chipText, {
                color: active ? "#fff" : colors.mutedForeground,
                fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
              }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  wrap:     { gap: 8 },
  label:    { fontSize: 13 },
  options:  { gap: 6, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 7,
    borderRadius: 16, borderWidth: 1,
  },
  chipText: { fontSize: 13 },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[sectionStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[sectionStyles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{title}</Text>
      <View style={[sectionStyles.divider, { backgroundColor: colors.border }]} />
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    borderRadius: 14, borderWidth: 1,
    overflow: "hidden",
  },
  title:   { fontSize: 13, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  divider: { height: 1 },
  body:    { padding: 14, gap: 14 },
});

function generateSku(category: string): string {
  const prefix: Record<string, string> = {
    "Food & Bev": "FB", Electronics: "EL", Clothing: "CL",
    "Home & Living": "HL", Books: "BK", Sports: "SP",
    Beauty: "BE", Accessories: "AC", Stationery: "ST",
  };
  const pre = prefix[category] ?? "PR";
  return `${pre}-${Math.floor(100 + Math.random() * 900)}`;
}

export default function ProductEditScreen() {
  const { id }   = useLocalSearchParams<{ id?: string }>();
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const topPad   = Platform.OS === "web" ? 67 : insets.top;
  const botPad   = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const isEditing = Boolean(id);

  const existing = id ? getProduct(id) : undefined;

  const [form, setForm] = useState<FormData>({
    name:              existing?.name              ?? "",
    price:             existing?.price?.toString() ?? "",
    sku:               existing?.sku               ?? "",
    category:          existing?.category          ?? CATEGORIES[0],
    unit:              existing?.unit              ?? "pcs",
    stock:             existing?.stock?.toString() ?? "",
    lowStockThreshold: existing?.lowStockThreshold?.toString() ?? "5",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (key: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const autoSku = () => {
    if (!form.sku) setForm((f) => ({ ...f, sku: generateSku(f.category) }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim())              e.name  = "Product name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.sku.trim())               e.sku   = "SKU is required";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) e.stock = "Enter a valid stock qty";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      name:              form.name.trim(),
      price:             Number(form.price),
      sku:               form.sku.trim().toUpperCase(),
      category:          form.category,
      unit:              form.unit,
      stock:             Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
    };
    if (isEditing && existing) {
      updateProduct({ ...existing, ...data });
      router.replace(`/product/${existing.id}` as any);
    } else {
      const newP = addProduct(data);
      router.replace(`/product/${newP.id}` as any);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Product", `Delete "${existing?.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteProduct(id!); router.replace("/(tabs)/products" as any); } },
    ]);
  };

  const catColor = CATEGORY_COLORS[form.category] ?? CATEGORY_COLORS.default;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: catColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_600SemiBold" }]}>
            {isEditing ? "Edit Product" : "Add Product"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveTopBtn}>
            <Text style={[styles.saveTopText, { fontFamily: "Inter_700Bold" }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 90 }]}
        >
          {/* Basic info */}
          <Section title="Basic Info">
            <FormField
              label="Product Name *"
              value={form.name}
              onChangeText={set("name")}
              placeholder="e.g. Espresso Pods 10pk"
            />
            {errors.name && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.name}</Text>}

            <FormField
              label="Price (₹) *"
              value={form.price}
              onChangeText={set("price")}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            {errors.price && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.price}</Text>}

            <View style={{ gap: 5 }}>
              <Text style={[{ fontSize: 13, color: colors.foreground, fontFamily: "Inter_500Medium" }]}>SKU *</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[fieldStyles.input, { flex: 1, backgroundColor: colors.background, borderColor: errors.sku ? colors.destructive : colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={form.sku}
                  onChangeText={set("sku")}
                  placeholder="e.g. FB-019"
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={autoSku}
                  style={[styles.autoBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                >
                  <Feather name="zap" size={14} color={colors.primary} />
                  <Text style={[styles.autoBtnText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Auto</Text>
                </TouchableOpacity>
              </View>
              {errors.sku && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.sku}</Text>}
            </View>
          </Section>

          {/* Category & unit */}
          <Section title="Category & Unit">
            <PickerRow
              label="Category"
              options={CATEGORIES}
              value={form.category}
              onChange={set("category")}
              getColor={(opt) => CATEGORY_COLORS[opt] ?? null}
            />
            <PickerRow
              label="Unit"
              options={UNITS}
              value={form.unit}
              onChange={set("unit")}
            />
          </Section>

          {/* Stock */}
          <Section title="Inventory">
            <FormField
              label="Current Stock *"
              value={form.stock}
              onChangeText={set("stock")}
              placeholder="0"
              keyboardType="numeric"
            />
            {errors.stock && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.stock}</Text>}

            <FormField
              label="Low Stock Alert Threshold"
              value={form.lowStockThreshold}
              onChangeText={set("lowStockThreshold")}
              placeholder="5"
              keyboardType="numeric"
              hint="You'll be alerted when stock drops to this level"
            />
          </Section>

          {/* Image placeholder */}
          <Section title="Product Image">
            <TouchableOpacity style={[styles.imagePicker, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <View style={[styles.imageIconBox, { backgroundColor: catColor + "18" }]}>
                <Feather name="camera" size={26} color={catColor} />
              </View>
              <Text style={[styles.imagePickerText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                Upload Product Image
              </Text>
              <Text style={[styles.imagePickerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Tap to choose from gallery or camera
              </Text>
            </TouchableOpacity>
          </Section>
        </ScrollView>

        {/* Bottom actions */}
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
          {isEditing && (
            <TouchableOpacity
              style={[styles.deleteBtnBottom, { borderColor: colors.destructive }]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={15} color={colors.destructive} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: catColor, flex: 1 }]}
            onPress={handleSave}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>
              {isEditing ? "Save Changes" : "Add Product"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn:     { padding: 2 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 17, marginHorizontal: 12, textAlign: "center" },
  saveTopBtn:  { paddingHorizontal: 4, paddingVertical: 2 },
  saveTopText: { color: "#fff", fontSize: 15 },

  content: { paddingHorizontal: 14, paddingTop: 16, gap: 14 },

  error: { fontSize: 12, marginTop: -8 },

  autoBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: 10, borderWidth: 1,
  },
  autoBtnText: { fontSize: 13 },

  imagePicker: {
    borderRadius: 12, borderWidth: 1.5, borderStyle: "dashed",
    padding: 20, alignItems: "center", gap: 8,
  },
  imageIconBox: {
    width: 60, height: 60, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  imagePickerText: { fontSize: 14 },
  imagePickerSub:  { fontSize: 12 },

  bottomBar: {
    flexDirection: "row", gap: 8, padding: 12, paddingTop: 10,
    borderTopWidth: 1,
  },
  deleteBtnBottom: {
    width: 44, alignItems: "center", justifyContent: "center",
    borderRadius: 10, borderWidth: 1.5,
  },
  cancelBtn: {
    paddingHorizontal: 18, paddingVertical: 13,
    borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  cancelText:  { fontSize: 14 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    paddingVertical: 13, borderRadius: 12,
  },
  saveBtnText: { color: "#fff", fontSize: 15 },
});
