// src/screens/ProfileScreen.js
// Dados do usuário + países salvos ("Quero Visitar" e "Visitados") vindos do Firestore,
// com opções de editar notas, alternar status e excluir.
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import {
  getUserTrips,
  updateTripNotes,
  updateTripStatus,
  deleteTrip,
  TRIP_STATUS,
} from '../services/firestoreService';
import LoadingIndicator from '../components/LoadingIndicator';
import { colors } from '../theme';
import { showAlert, confirmAction } from '../utils/alerts';
import useResponsive from '../hooks/useResponsive';

const TABS = [
  {
    value: TRIP_STATUS.WANT,
    label: 'Quero Visitar',
    icon: 'airplane-outline',
    color: colors.warning,
  },
  {
    value: TRIP_STATUS.VISITED,
    label: 'Visitados',
    icon: 'checkmark-done-outline',
    color: colors.accent,
  },
];

export default function ProfileScreen() {
  const user = auth.currentUser;
  const { isDesktop } = useResponsive();
  const tripColumns = isDesktop ? 2 : 1;

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(TRIP_STATUS.WANT);

  // Estado do modal de edição de notas
  const [editingTrip, setEditingTrip] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadTrips = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const data = await getUserTrips(user.uid);
      setTrips(data);
    } catch (err) {
      setError('Não foi possível carregar seus roteiros.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Recarrega sempre que a tela recebe foco (ex.: após salvar um país nos detalhes)
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleDelete = (trip) => {
    confirmAction(
      'Excluir',
      `Remover ${trip.countryName} dos seus roteiros?`,
      async () => {
        try {
          await deleteTrip(trip.id);
          setTrips((prev) => prev.filter((t) => t.id !== trip.id));
        } catch (err) {
          showAlert('Erro', 'Não foi possível excluir.');
        }
      },
      'Excluir',
    );
  };

  const handleToggleStatus = async (trip) => {
    const newStatus = trip.status === TRIP_STATUS.WANT ? TRIP_STATUS.VISITED : TRIP_STATUS.WANT;
    try {
      await updateTripStatus(trip.id, newStatus);
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      showAlert('Erro', 'Não foi possível alterar o status.');
    }
  };

  const openEditNotes = (trip) => {
    setEditingTrip(trip);
    setEditNotes(trip.notes ?? '');
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateTripNotes(editingTrip.id, editNotes);
      setTrips((prev) =>
        prev.map((t) => (t.id === editingTrip.id ? { ...t, notes: editNotes.trim() } : t)),
      );
      setEditingTrip(null);
    } catch (err) {
      showAlert('Erro', 'Não foi possível salvar as notas.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Carregando seus roteiros..." />;
  }

  const wantCount = trips.filter((t) => t.status === TRIP_STATUS.WANT).length;
  const visitedCount = trips.filter((t) => t.status === TRIP_STATUS.VISITED).length;
  const filteredTrips = trips.filter((t) => t.status === activeTab);
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
    : '-';

  const renderHeader = () => (
    <View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {(user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </Text>
          )}
        </View>
        {!!user?.displayName && <Text style={styles.displayName}>{user.displayName}</Text>}
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>Membro desde {memberSince}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{wantCount}</Text>
            <Text style={styles.statLabel}>Quero Visitar</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{visitedCount}</Text>
            <Text style={styles.statLabel}>Visitados</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab.value === activeTab;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, active && { borderBottomColor: tab.color }]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Ionicons name={tab.icon} size={18} color={active ? tab.color : colors.textMuted} />
              <Text style={[styles.tabText, active && { color: tab.color, fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const renderTrip = ({ item }) => (
    <View style={[styles.tripCard, tripColumns > 1 && styles.tripCardGrid]}>
      <View style={styles.tripHeader}>
        {!!item.flagUrl && <Image source={{ uri: item.flagUrl }} style={styles.tripFlag} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.tripName}>{item.countryName}</Text>
          <Text style={styles.tripSub}>
            {[item.capital, item.region].filter(Boolean).join(' • ')}
          </Text>
        </View>
      </View>

      <Text style={[styles.tripNotes, !item.notes && styles.tripNotesEmpty]}>
        {item.notes || 'Sem notas.'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => openEditNotes(item)}>
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Editar notas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleStatus(item)}>
          <Ionicons name="swap-horizontal-outline" size={18} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.accent }]}>
            {item.status === TRIP_STATUS.WANT ? 'Já visitei' : 'Quero voltar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        key={`trips-${tripColumns}`}
        numColumns={tripColumns}
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              Nenhum país em "{TABS.find((t) => t.value === activeTab).label}".{'\n'}
              Explore a lista de países e salve seus destinos!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <Modal
        visible={!!editingTrip}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingTrip(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notas - {editingTrip?.countryName}</Text>
            <TextInput
              style={styles.modalInput}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Escreva suas notas..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setEditingTrip(null)}
                disabled={savingNotes}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave]}
                onPress={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Centraliza e limita a largura em tablets e no navegador
  listContent: {
    paddingBottom: 32,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  tripCardGrid: {
    flex: 1,
    maxWidth: '47%',
  },
  profileCard: {
    backgroundColor: colors.card,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
  },
  email: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  memberSince: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    margin: 12,
  },
  tripCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripFlag: {
    width: 48,
    height: 32,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tripName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  tripSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  tripNotes: {
    marginTop: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  tripNotesEmpty: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  modalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: colors.background,
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '600',
  },
  modalSave: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
