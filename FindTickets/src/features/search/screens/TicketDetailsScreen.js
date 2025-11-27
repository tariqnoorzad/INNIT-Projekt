import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ref, get, set, update, remove, push, onValue } from 'firebase/database';
import { rtdb, auth } from '../Firebase/database'; // 🔥 nu også auth
import { gs } from '../../../styles/globalstyle';
import { formatDateLong } from '../Utils/date';

function MetaItem({ icon, children }) {
  return ( 
    <View style={gs.metaRow}>
      <Icon name={icon} size={18} color="#B8BDC7" />
      <Text style={gs.metaValue}>{children}</Text>
    </View>
  );
}

export default function TicketDetailsScreen({ route, navigation }) {
  const { id } = route.params || {}; // fx "-OaVGWaKCCmV8fnVDX38"
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [sellerRating, setSellerRating] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // NYT: state til antal billetter
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    // Henter specifik billet fra /tickets/<id>
    const ticketRef = ref(rtdb, `tickets/${id}`);
    get(ticketRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          setTicket({ id, ...snapshot.val() });
        } else {
          setTicket(null);
        }
      })
      .catch(err => {
        console.error("Error fetching ticket:", err);
        setTicket(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Live lyt på sælgers rating (kun P2P)
  const resolvedSellerId =
    ticket?.sellerId ||
    ticket?.ownerId ||
    ticket?.userId ||
    ticket?.uid ||
    ticket?.createdBy ||
    null;
  const resolvedSellerType = ticket?.sellerType || 'p2p';

  useEffect(() => {
    if (!resolvedSellerId || resolvedSellerType === 'partner') return undefined;
    const summaryRef = ref(rtdb, `users/${resolvedSellerId}/ratingSummary`);
    const unsub = onValue(summaryRef, snap => {
      setSellerRating(snap.val() || null);
    });
    return () => unsub();
  }, [resolvedSellerId, resolvedSellerType]);

  if (loading) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={gs.screen}>
        <View style={[gs.container, { paddingTop: 24 }]}>
          <Text style={gs.subtitle}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unitPrice = Number(ticket.price) || 0;
  const totalPrice = unitPrice * quantity;

  const handleBuy = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Login påkrævet', 'Du skal være logget ind for at købe en billet.');
      return;
    }

    setBuying(true);

    try {
      const ticketRef = ref(rtdb, `tickets/${ticket.id}`);
      const snap = await get(ticketRef);

      if (!snap.exists()) {
        Alert.alert('Ups', 'Billetten findes ikke længere.');
        return;
      }

      const latestTicket = snap.val();
      const availableQty = latestTicket.qty || 1;

      if (quantity > availableQty) {
        Alert.alert(
          'Ikke nok billetter',
          `Der er kun ${availableQty} billett(er) tilbage.`
        );
        return;
      }

      // 1) Gem købet under brugeren
      const purchasesRef = ref(rtdb, `userPurchases/${user.uid}`);
      const newPurchaseRef = push(purchasesRef);
      const purchaseId = newPurchaseRef.key;

      const resolvedSellerIdPurchase =
        latestTicket.sellerId ||
        latestTicket.ownerId ||
        latestTicket.userId ||
        latestTicket.uid ||
        latestTicket.createdBy ||
        null;
      const resolvedSellerTypePurchase = latestTicket.sellerType || 'p2p';
      const resolvedSellerNamePurchase =
        latestTicket.sellerName ||
        latestTicket.seller ||
        latestTicket.partner ||
        'Sælger';

      await set(newPurchaseRef, {
        purchaseId,
        ticketId: ticket.id,
        quantity,
        purchasedAt: Date.now(),
        // Gem lidt info om billetten, så du nemt kan vise den i "Mine billetter"
        title: latestTicket.title,
        price: latestTicket.price,
        dateTime: latestTicket.dateTime,
        city: latestTicket.city || null,
        partner: latestTicket.partner || null,
        sellerId: resolvedSellerIdPurchase,
        sellerType: resolvedSellerTypePurchase,
        sellerName: resolvedSellerNamePurchase,
      });

      // 2) Opdater eller slet billetten i tickets
      if (availableQty - quantity <= 0) {
        // Ingen billetter tilbage → fjern fra liste
        await remove(ticketRef);
      } else {
        await update(ticketRef, { qty: availableQty - quantity });
      }

      Alert.alert('Success', 'Din billet er købt.');

      const shouldPromptRating =
        resolvedSellerTypePurchase !== 'partner' &&
        resolvedSellerIdPurchase &&
        resolvedSellerIdPurchase !== user.uid;

      // Start rating-flow hvis P2P-sælger
      if (shouldPromptRating) {
        setRatingTarget({
          sellerId: resolvedSellerIdPurchase,
          sellerName: resolvedSellerNamePurchase,
          purchaseId,
          ticketId: ticket.id,
          ticketTitle: latestTicket.title,
        });
        setShowRatingModal(true);
      } else {
        // Ingen rating → luk skærmen
        navigation.goBack();
      }
    } catch (err) {
      console.error('Error buying ticket:', err);
      Alert.alert('Fejl', 'Noget gik galt under køb. Prøv igen.');
    } finally {
      setBuying(false);
    }
  };

  const handleSubmitRating = async (stars) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Login påkrævet', 'Log ind for at give en rating.');
        return;
      }
      if (!ratingTarget) return;

      const { sellerId, purchaseId, ticketId, ticketTitle } = ratingTarget;
      const ratingRef = ref(rtdb, `userRatings/${sellerId}/${purchaseId}`);
      const existing = await get(ratingRef);
      if (existing.exists()) {
        Alert.alert('Allerede vurderet', 'Denne handel er allerede blevet vurderet.');
        setShowRatingModal(false);
        return;
      }

      await set(ratingRef, {
        stars,
        fromUid: user.uid,
        ticketId,
        ticketTitle: ticketTitle || '',
        purchaseId,
        createdAt: Date.now(),
      });

      const summaryRef = ref(rtdb, `users/${sellerId}/ratingSummary`);
      const summarySnap = await get(summaryRef);
      const { avg = 0, count = 0 } = summarySnap.val() || {};
      const newCount = count + 1;
      const newAvg = Number(((avg * count + stars) / newCount).toFixed(2));
      await set(summaryRef, { avg: newAvg, count: newCount });

      Alert.alert('Tak', 'Din vurdering er gemt.');
      navigation.goBack();
    } catch (err) {
      console.error('Error saving rating:', err);
      Alert.alert('Fejl', 'Kunne ikke gemme rating. Prøv igen.');
    } finally {
      setShowRatingModal(false);
      setRatingTarget(null);
    }
  };

  return (
    <SafeAreaView style={gs.screen} edges={['top','bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Titel & basisinfo */}
        <Text style={gs.h1}>{ticket.title}</Text>

        {/* Info-kort */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <View style={[gs.rowBetween, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={gs.pill}>
                <Text style={gs.muted}>{(ticket.category || 'event').toUpperCase()}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {resolvedSellerType !== 'partner' && resolvedSellerId && (
                <View
                  style={{
                    backgroundColor: '#111823',
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Icon name="account" size={16} color="#6EE7B7" />
                  {sellerRating ? (
                    <>
                    <Text style={{ color: 'white', fontWeight: '700' }}>
                      Sælger-rating:
                    </Text>
                      <Icon name="star" size={16} color="#FACC15" />
                      <Text style={{ color: 'white', fontWeight: '700' }}>
                        {sellerRating.avg?.toFixed(1)}
                      </Text>
                      <Text style={gs.muted}>({sellerRating.count || 0})</Text>
                    </>
                  ) : (
                    <Text style={gs.muted}>Ny sælger · ingen rating</Text>
                  )}
                </View>
              )}
              <View style={gs.pricePill}>
                <Text style={gs.buttonTextDark}>{unitPrice} DKK</Text>
              </View>
            </View>
          </View>

          <View style={gs.divider} />

          <MetaItem icon="calendar">{formatDateLong(ticket.dateTime)}</MetaItem>
          <MetaItem icon="map-marker">{ticket.city || "Ukendt by"}</MetaItem>
          <MetaItem icon="store">{ticket.partner || "Ingen partner"}</MetaItem>
          <MetaItem icon="ticket-confirmation">
            Antal til salg: {ticket.qty || 1}
          </MetaItem>
        </View>

        {/* Vælg antal billetter */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16, paddingVertical: 12 }]}>
          <Text style={gs.title}>Vælg antal billetter</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Pressable
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#3F3F46',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>−</Text>
            </Pressable>

            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '700',
                minWidth: 32,
                textAlign: 'center',
              }}
            >
              {quantity}
            </Text>

            <Pressable
              onPress={() => {
                if (ticket.qty && quantity >= ticket.qty) return;
                setQuantity(q => q + 1);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#3F3F46',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 16,
              }}
            >
              <Text style={{ color: 'white', fontSize: 20 }}>+</Text>
            </Pressable>
          </View>

          {ticket.qty && (
            <Text style={[gs.muted, { marginTop: 8, fontSize: 12 }]}>
              Maks {ticket.qty} billetter pr. køb
            </Text>
          )}
        </View>

        {/* Tryg handel */}
        <View style={[gs.card, gs.shadowSm, { marginTop: 16 }]}>
          <Text style={gs.title}>Tryg handel</Text>
          <MetaItem icon="shield-check">Verificeret sælger/partner</MetaItem>
          <MetaItem icon="credit-card-check">Escrow: pengene frigives efter overdragelse</MetaItem>
          <MetaItem icon="qrcode-scan">QR tjek ved møde</MetaItem>
        </View>

        {/* Report */}
        <Pressable style={{ marginTop: 12 }} onPress={() => Alert.alert('Report', 'Report issue')}>
          <Text style={{ color: 'white' }}>Report issue</Text>
        </Pressable>
      </ScrollView>

      {/* CTA bar i bunden */}
      <View style={gs.ctaBar}>
        <View style={{ flex: 1 }}>
          <Text style={[gs.muted, { fontSize: 12 }]}>Total</Text>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
            {totalPrice} DKK
          </Text>
          <Text style={[gs.muted, { fontSize: 11 }]}>
            {quantity} × {unitPrice} DKK
          </Text>
        </View>
        <Pressable
          style={[gs.buttonPrimary, { flex: 1.2, height: 48, borderRadius: 12, opacity: buying ? 0.7 : 1 }]}
          onPress={handleBuy}
          disabled={buying}
        >
          {buying ? (
            <ActivityIndicator color="#0E0F13" />
          ) : (
            <Text style={gs.buttonTextDark}>Buy securely</Text>
          )}
        </Pressable>
      </View>

      {/* Rating modal */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View style={[gs.card, { padding: 20 }]}>
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
              Vurder sælger
            </Text>
            <Text style={[gs.muted, { marginTop: 6 }]}>
              {ratingTarget?.sellerName || 'Sælger'} · {ratingTarget?.ticketTitle}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleSubmitRating(star)}
                  style={{ padding: 8, alignItems: 'center', flex: 1 }}
                >
                  <Icon
                    name="star"
                    size={30}
                    color="#FACC15"
                    style={{ opacity: 0.9 }}
                  />
                  <Text style={{ color: 'white', marginTop: 4 }}>{star}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Pressable
              style={[gs.buttonPrimary, { marginTop: 18 }]}
              onPress={() => {
                setShowRatingModal(false);
                setRatingTarget(null);
                navigation.goBack();
              }}
            >
              <Text style={gs.buttonTextDark}>Spring over</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
