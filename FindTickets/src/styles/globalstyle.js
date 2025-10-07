import { StyleSheet } from 'react-native';

export const gs = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E0F13' },
  container: { padding: 16 },

  // Typography
  title: { fontSize: 18, fontWeight: '700', color: 'white' },
  subtitle: { fontSize: 12, color: '#B8BDC7' },
  h1: { fontSize: 32, fontWeight: '800', color: 'white', letterSpacing: 0.2, marginBottom: 20 },
  muted: { color: '#B8BDC7' },

  // Layout
  section: { marginTop: 24 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Cards & grid
  card: { backgroundColor: '#191B22', padding: 14, borderRadius: 16 },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6EE7B7',
    alignItems: 'center', justifyContent: 'center'
  },
  shadowSm: {
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 4
  },

  // Buttons
  buttonPrimary: { backgroundColor: '#6EE7B7', padding: 12, borderRadius: 12, alignItems: 'center' },
  buttonTextDark: { color: '#0E0F13', fontWeight: '700' },

  // List items (du bruger dem i Results)
  listItem: { backgroundColor: '#191B22', padding: 12, borderRadius: 12 },
  badgeVerified: { backgroundColor: '#22C55E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#191B22' },
pricePill: { backgroundColor: '#6EE7B7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
metaValue: { color: 'white' },
divider: { height: 1, backgroundColor: '#2A2E36', marginVertical: 12 },
ctaBar: {
  position: 'absolute', left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(14,15,19,0.96)',
  borderTopWidth: 1, borderTopColor: '#1F232B',
  padding: 12, paddingBottom: 16,
  flexDirection: 'row', alignItems: 'center', gap: 12
},


});
