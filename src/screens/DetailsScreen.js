// src/screens/DetailsScreen.js
// Detalhes completos do país + formulário para salvar na coleção `trips` do Firestore.
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { saveTrip, getTripByCountry, deleteTrip, TRIP_STATUS } from '../services/firestoreService';
import { colors } from '../theme';
import { showAlert, confirmAction } from '../utils/alerts';
import useResponsive from '../hooks/useResponsive';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.primary} style={styles.infoIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DetailsScreen({ route }) {
  const { country } = route.params;
  const uid = auth.currentUser?.uid;
  const { isDesktop, isTablet } = useResponsive();

  const [status, setStatus] = useState(TRIP_STATUS.WANT);
  const [notes, setNotes] = useState('');
  const [savedTrip, setSavedTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carrega o registro existente (se o país já foi salvo pelo usuário)
  useEffect(() => {
    let active = true;

    async function loadTrip() {
      try {
        const trip = await getTripByCountry(uid, country.cca3);
        if (!active) return;
        setSavedTrip(trip);
        if (trip) {
          setStatus(trip.status);
          setNotes(trip.notes ?? '');
        }
      } catch (error) {
        console.warn('Erro ao carregar roteiro:', error);
      } finally {
        if (active) setLoadingTrip(false);
      }
    }

    if (uid) loadTrip();
    else setLoadingTrip(false);

    return () => {
      active = false;
    };
  }, [uid, country.cca3]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTrip(uid, country, { status, notes });
      setSavedTrip({ status, notes });
      showAlert(
        'Salvo!',
        `${country.name.common} foi salvo em "${
          status === TRIP_STATUS.WANT ? 'Quero Visitar' : 'Visitados'
        }".`,
      );
    } catch (error) {
      console.error('Firestore (salvar):', error?.code, error?.message);
      showAlert(
        'Erro',
        `Não foi possível salvar. Verifique sua conexão e o Firestore.\n(${error?.code || error?.message})`,
      );
    } finally {
      setSaving(false);
    }
  };

  const removeTrip = async () => {
    setSaving(true);
    try {
      await deleteTrip(`${uid}_${country.cca3}`);
      setSavedTrip(null);
      setStatus(TRIP_STATUS.WANT);
      setNotes('');
    } catch (error) {
      showAlert('Erro', 'Não foi possível remover.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    confirmAction(
      'Remover',
      `Remover ${country.name.common} dos seus roteiros?`,
      removeTrip,
      'Remover',
    );
  };

  // Formatação dos dados da API
  const capital = country.capital?.join(', ') || 'Não possui';
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/D';
  const currencies = country.currencies
    ? Object.entries(country.currencies)
        .map(([code, c]) => `${c.name} (${c.symbol ?? code})`)
        .join(', ')
    : 'N/D';
  const population = country.population?.toLocaleString('pt-BR') ?? 'N/D';
  const timezones = country.timezones?.join(', ') || 'N/D';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: country.flags?.png }}
          style={[styles.flag, isTablet && styles.flagLarge]}
          resizeMode="contain"
          accessibilityLabel={country.flags?.alt || `Bandeira de ${country.name.common}`}
        />

        <View style={styles.header}>
          <Text style={styles.name}>{country.name.common}</Text>
          <Text style={styles.official}>{country.name.official}</Text>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{country.cca3}</Text>
          </View>
        </View>

        <View style={[styles.columns, isDesktop && styles.columnsRow]}>
          <View style={[styles.section, isDesktop && styles.sectionColumn]}>
            <Text style={styles.sectionTitle}>Informações gerais</Text>
            <InfoRow icon="business-outline" label="Capital" value={capital} />
            <InfoRow icon="globe-outline" label="Região" value={country.region || 'N/D'} />
            <InfoRow icon="map-outline" label="Sub-região" value={country.subregion || 'N/D'} />
            <InfoRow icon="people-outline" label="População" value={population} />
            <InfoRow icon="chatbubbles-outline" label="Idiomas" value={languages} />
            <InfoRow icon="cash-outline" label="Moedas" value={currencies} />
            <InfoRow icon="time-outline" label="Fusos horários" value={timezones} />
          </View>

          <View style={[styles.section, isDesktop && styles.sectionColumn]}>
            <Text style={styles.sectionTitle}>Meu roteiro</Text>

            {loadingTrip ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            ) : (
              <>
                {savedTrip && (
                  <View style={styles.savedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                    <Text style={styles.savedText}>
                      Salvo em "
                      {savedTrip.status === TRIP_STATUS.WANT ? 'Quero Visitar' : 'Visitados'}"
                    </Text>
                  </View>
                )}

                <View style={styles.statusRow}>
                  <TouchableOpacity
                    style={[styles.statusButton, status === TRIP_STATUS.WANT && styles.statusWant]}
                    onPress={() => setStatus(TRIP_STATUS.WANT)}
                  >
                    <Ionicons
                      name="airplane-outline"
                      size={18}
                      color={status === TRIP_STATUS.WANT ? '#FFF' : colors.warning}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        status === TRIP_STATUS.WANT && styles.statusTextActive,
                      ]}
                    >
                      Quero Visitar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      status === TRIP_STATUS.VISITED && styles.statusVisited,
                    ]}
                    onPress={() => setStatus(TRIP_STATUS.VISITED)}
                  >
                    <Ionicons
                      name="checkmark-done-outline"
                      size={18}
                      color={status === TRIP_STATUS.VISITED ? '#FFF' : colors.accent}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        status === TRIP_STATUS.VISITED && styles.statusTextActive,
                      ]}
                    >
                      Visitado
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.notesInput}
                  placeholder="Notas: pontos turísticos, datas, dicas..."
                  placeholderTextColor={colors.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{notes.length}/500</Text>

                <TouchableOpacity
                  style={[styles.saveButton, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#FFF" />
                      <Text style={styles.saveText}>
                        {savedTrip ? 'Atualizar roteiro' : 'Salvar no roteiro'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {savedTrip && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={handleRemove}
                    disabled={saving}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    <Text style={styles.removeText}>Remover dos roteiros</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Centraliza e limita a largura em tablets e no navegador
  scrollContent: {
    paddingBottom: 32,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  flag: {
    width: '100%',
    height: 200,
    backgroundColor: colors.card,
  },
  flagLarge: {
    height: 260,
  },
  columns: {},
  // Navegador/tela larga: informações e roteiro lado a lado
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  sectionColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  official: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  codeBadge: {
    marginTop: 8,
    backgroundColor: '#E3EEF6',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    backgroundColor: colors.card,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F6F1',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  savedText: {
    marginLeft: 6,
    color: '#2D7A64',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  statusWant: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  statusVisited: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  statusText: {
    marginLeft: 6,
    fontWeight: '600',
    color: colors.text,
  },
  statusTextActive: {
    color: '#FFF',
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 12,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  removeText: {
    color: colors.danger,
    fontWeight: '600',
    marginLeft: 6,
  },
});
