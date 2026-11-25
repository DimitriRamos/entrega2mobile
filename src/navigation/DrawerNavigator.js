// src/navigation/DrawerNavigator.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';
import { showAlert, confirmAction } from '../utils/alerts';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const email = auth.currentUser?.email ?? '';

  const doSignOut = async () => {
    try {
      await signOut(auth); // AppNavigator detecta a mudança e volta ao Login
    } catch (error) {
      showAlert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  const handleSignOut = () => {
    confirmAction('Sair', 'Deseja realmente sair da sua conta?', doSignOut, 'Sair');
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.header}>
          <Ionicons name="earth" size={48} color="#FFF" />
          <Text style={styles.appName}>Explorador de Países</Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem
          label="Sair"
          labelStyle={{ color: colors.danger, fontWeight: '700' }}
          icon={({ size }) => <Ionicons name="log-out-outline" size={size} color={colors.danger} />}
          onPress={handleSignOut}
        />
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '700' },
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: '#E3EEF6',
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={HomeStack}
        options={{
          title: 'Início',
          headerShown: false, // o HomeStack já possui header próprio
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil / Roteiros',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  appName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  email: {
    color: '#D6E6F2',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24,
  },
});
