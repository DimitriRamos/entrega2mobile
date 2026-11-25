// src/components/CountryCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function CountryCard({ country, onPress }) {
  const capital = country.capital?.length ? country.capital.join(', ') : 'Sem capital';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: country.flags?.png }}
        style={styles.flag}
        resizeMode="cover"
        accessibilityLabel={country.flags?.alt || `Bandeira de ${country.name.common}`}
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {country.name.common}
        </Text>

        <View style={styles.row}>
          <Ionicons name="business-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detail} numberOfLines={1}>
            {capital}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="globe-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detail}>{country.region}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={22} color={colors.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flag: {
    width: 72,
    height: 48,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detail: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.textMuted,
    flexShrink: 1,
  },
});
