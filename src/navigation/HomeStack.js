// src/navigation/HomeStack.js
// Stack interno do Drawer: lista de países -> detalhes.
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import { colors } from '../theme';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Na web o Stack não limita a altura da tela à janela, e as listas não rolam.
        // flex: 1 faz cada tela ocupar exatamente a área visível.
        cardStyle: { flex: 1 },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Explorador de Países',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={{ marginLeft: 16 }}
              accessibilityLabel="Abrir menu"
            >
              <Ionicons name="menu" size={26} color="#FFF" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.country?.name?.common ?? 'Detalhes',
        })}
      />
    </Stack.Navigator>
  );
}
