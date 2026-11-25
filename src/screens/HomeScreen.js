// src/screens/HomeScreen.js
// Dashboard: busca por texto + filtro de região + FlatList de países.
import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useCountries from '../hooks/useCountries';
import CountryCard from '../components/CountryCard';
import RegionFilter from '../components/RegionFilter';
import LoadingIndicator from '../components/LoadingIndicator';
import useResponsive from '../hooks/useResponsive';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const [region, setRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const { countries, loading, error } = useCountries(region, searchQuery, reloadKey);
  const { gridColumns } = useResponsive();
  const isGrid = gridColumns > 1;

  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator message="Buscando países..." />;
    }

    if (error) {
      return (
        <View style={styles.feedback}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.danger} />
          <Text style={styles.feedbackText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setReloadKey((k) => k + 1)}>
            <Ionicons name="refresh" size={18} color="#FFF" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        // numColumns não pode mudar "ao vivo": a key força recriar a lista ao redimensionar
        key={`grid-${gridColumns}`}
        numColumns={gridColumns}
        data={countries}
        keyExtractor={(item) => item.cca3}
        renderItem={({ item }) => (
          <View style={isGrid ? { width: `${100 / gridColumns}%`, padding: 6 } : null}>
            <CountryCard
              country={item}
              grid={isGrid}
              onPress={() => navigation.navigate('Details', { country: item })}
            />
          </View>
        )}
        contentContainerStyle={[
          countries.length === 0 ? styles.emptyList : styles.list,
          isGrid && styles.gridList,
        ]}
        ListHeaderComponent={
          countries.length > 0 ? (
            <Text style={[styles.counter, isGrid && { marginHorizontal: 6 }]}>
              {countries.length} {countries.length === 1 ? 'país encontrado' : 'países encontrados'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.feedback}>
            <Ionicons name="search-outline" size={56} color={colors.textMuted} />
            <Text style={styles.feedbackText}>Nenhum país encontrado.</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={10}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar país (em inglês, ex.: Brazil)"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View>
          <RegionFilter selectedRegion={region} onSelectRegion={setRegion} />
        </View>

        <View style={styles.content}>{renderContent()}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Limita a largura em telas muito grandes e centraliza o conteúdo
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
  },
  gridList: {
    paddingHorizontal: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0, // na web o input não encolhe sem isso
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.text,
  },
  content: { flex: 1 },
  list: { paddingBottom: 24 },
  emptyList: { flexGrow: 1 },
  counter: {
    marginHorizontal: 16,
    marginBottom: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  feedback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
  },
});
