import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export type CheckoutPaymentMethod = "cash" | "mpesa_manual";

type CheckoutColors = {
  navy: string;
  surface: string;
  orange: string;
  amber: string;
  white: string;
  muted: string;
  green: string;
  red: string;
  border: string;
  paper: string;
  ink: string;
};

export type CheckoutLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type PosCheckoutProps = {
  colors: CheckoutColors;
  currency: string;
  lines: CheckoutLine[];
  subtotal: number;
  total: number;
  given: number;
  change: number;
  paymentState: string;
  amountGiven: string;
  discount: string;
  paymentMethod: CheckoutPaymentMethod;
  mpesaReceiptNumber: string;
  mpesaPhone: string;
  money: (value: number, currency?: string) => string;
  onQuantityChange: (id: string, delta: number) => void;
  onDiscountChange: (value: string) => void;
  onAmountGivenChange: (value: string) => void;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  onMpesaReceiptChange: (value: string) => void;
  onMpesaPhoneChange: (value: string) => void;
  onClearCart: () => void;
  onHoldSale: () => void;
  onRestoreHeldSale: () => void;
  onPrintReceipt: () => void;
  onCompleteSale: () => void;
  hasHeldSale: boolean;
};

function CheckoutField({ value, onChangeText, placeholder, keyboardType, secureTextEntry, colors, multiline }: { value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "decimal-pad" | "phone-pad"; secureTextEntry?: boolean; colors: CheckoutColors; multiline?: boolean }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} secureTextEntry={secureTextEntry} multiline={multiline} style={[styles.input, { backgroundColor: colors.navy, borderColor: colors.border, color: colors.white }, multiline && styles.multiline]} />;
}

function CheckoutButton({ label, onPress, colors, secondary = false, small = false }: { label: string; onPress: () => void; colors: CheckoutColors; secondary?: boolean; small?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: secondary ? "transparent" : colors.orange, borderColor: colors.orange }, secondary && styles.secondaryButton, small && styles.smallButton, pressed && styles.pressed]}><Text style={[styles.buttonText, { color: secondary ? colors.orange : colors.navy }]}>{label}</Text></Pressable>;
}

export function PosCheckout({ colors, currency, lines, subtotal, total, given, change, paymentState, amountGiven, discount, paymentMethod, mpesaReceiptNumber, mpesaPhone, money, onQuantityChange, onDiscountChange, onAmountGivenChange, onPaymentMethodChange, onMpesaReceiptChange, onMpesaPhoneChange, onClearCart, onHoldSale, onRestoreHeldSale, onPrintReceipt, onCompleteSale, hasHeldSale }: PosCheckoutProps) {
  return <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.navy }]}>
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.eyebrow, { color: colors.amber }]}>TODAY’S SALE</Text>
      {lines.length ? lines.map(line => <View key={line.id} style={styles.noteLine}><Text style={[styles.hand, { color: colors.ink }]}>{line.quantity} {line.name} = {money(line.lineTotal, currency)}</Text><View style={styles.qty}><CheckoutButton label="−" onPress={() => onQuantityChange(line.id, -1)} colors={colors} secondary small /><Text style={[styles.qtyText, { color: colors.ink }]}>{line.quantity}</Text><CheckoutButton label="＋" onPress={() => onQuantityChange(line.id, 1)} colors={colors} secondary small /></View></View>) : <Text style={[styles.hand, { color: colors.ink }]}>Add products from Sell to begin…</Text>}
      <View style={[styles.rule, { borderBottomColor: colors.border }]} />
      <View style={styles.checkoutRow}><Text style={[styles.hand, { color: colors.ink }]}>SUBTOTAL</Text><Text style={[styles.hand, { color: colors.ink }]}>{money(subtotal, currency)}</Text></View>
      <CheckoutField value={discount} onChangeText={onDiscountChange} placeholder="Discount amount" keyboardType="decimal-pad" colors={colors} />
      <View style={styles.checkoutRow}><Text style={[styles.hand, { color: colors.ink }]}>TOTAL</Text><Text style={[styles.hand, { color: colors.ink, fontSize: 24 }]}>{money(total, currency)}</Text></View>
      <Text style={[styles.muted, { color: colors.muted }]}>Payment method</Text>
      <View style={styles.row}>{([["cash", "Cash"], ["mpesa_manual", "M-Pesa (manual)"]] as [CheckoutPaymentMethod, string][]).map(([key, label]) => <Pressable key={key} onPress={() => onPaymentMethodChange(key)} style={[styles.chip, { borderColor: colors.border }, paymentMethod === key && { backgroundColor: colors.orange, borderColor: colors.orange }]}><Text style={[styles.chipText, { color: colors.muted }, paymentMethod === key && { color: colors.navy }]}>{label}</Text></Pressable>)}</View>
      <CheckoutField value={amountGiven} onChangeText={onAmountGivenChange} placeholder={paymentMethod === "mpesa_manual" ? "Amount received" : "Amount given"} keyboardType="decimal-pad" colors={colors} />
      {paymentMethod === "mpesa_manual" && <View style={[styles.mpesaCard, { backgroundColor: colors.navy, borderColor: `${colors.orange}66` }]}><Text style={[styles.muted, { color: colors.muted }]}>Manual record only — no STK Push or network request.</Text><CheckoutField value={mpesaReceiptNumber} onChangeText={onMpesaReceiptChange} placeholder="M-Pesa confirmation code" colors={colors} /><CheckoutField value={mpesaPhone} onChangeText={onMpesaPhoneChange} placeholder="Customer phone (optional)" keyboardType="phone-pad" colors={colors} /></View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickCash}>{[50, 100, 200, 500, 1000].map(value => <Pressable key={value} onPress={() => onAmountGivenChange(String(value))} style={[styles.quickCashButton, { backgroundColor: colors.navy, borderColor: colors.orange }]}><Text style={[styles.quickCashText, { color: colors.orange }]}>{money(value, currency)}</Text></Pressable>)}</ScrollView>
      <View style={styles.checkoutRow}><Text style={[styles.hand, { color: colors.ink }]}>GIVEN</Text><Text style={[styles.hand, { color: colors.ink }]}>{money(given, currency)}</Text></View>
      <Text style={[styles.checkoutStatus, { color: given === 0 ? colors.muted : given < total ? colors.red : given === total ? colors.orange : colors.green }]}>{paymentState}</Text>
      <Text style={[styles.hand, { color: given < total ? colors.red : colors.green, fontSize: 25 }]}>{given < total ? `Balance due = ${money(total - given, currency)}` : `Change = ${money(change, currency)}`}</Text>
    </View>
    <View style={styles.actionRow}><CheckoutButton label="Clear cart" onPress={onClearCart} colors={colors} secondary /><CheckoutButton label={hasHeldSale ? "Hold / replace" : "Hold sale"} onPress={onHoldSale} colors={colors} secondary />{hasHeldSale && <CheckoutButton label="Restore held" onPress={onRestoreHeldSale} colors={colors} secondary />}</View>
    <View style={styles.actionRow}><CheckoutButton label="Print receipt" onPress={onPrintReceipt} colors={colors} secondary /><CheckoutButton label="Complete sale" onPress={onCompleteSale} colors={colors} /></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 28 },
  card: { borderRadius: 18, padding: 16, gap: 10, borderWidth: 1 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  muted: { fontSize: 13, lineHeight: 19 },
  noteLine: { gap: 6 },
  hand: { fontSize: 18, fontWeight: "700" },
  qty: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyText: { minWidth: 28, textAlign: "center", fontSize: 16, fontWeight: "800" },
  rule: { borderBottomWidth: 1, marginVertical: 4 },
  checkoutRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  input: { minHeight: 46, paddingHorizontal: 13, fontSize: 15, borderRadius: 12, borderWidth: 1, flex: 1 },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "800" },
  mpesaCard: { borderRadius: 10, borderWidth: 1, padding: 10, gap: 6 },
  quickCash: { gap: 8, paddingVertical: 4 },
  quickCashButton: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 8 },
  quickCashText: { fontSize: 12, fontWeight: "800" },
  checkoutStatus: { fontSize: 15, fontWeight: "900", textAlign: "right", marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  button: { minHeight: 44, minWidth: 88, flex: 1, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  secondaryButton: { backgroundColor: "transparent" },
  smallButton: { minHeight: 34, minWidth: 34, flex: 0, paddingHorizontal: 8, borderRadius: 9 },
  buttonText: { fontSize: 13, fontWeight: "900" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
