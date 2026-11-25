// src/navigation/AppNavigator.js
// Controla o estado de autenticação: usuário logado -> Drawer; caso contrário -> Login.
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import useAuth from '../hooks/useAuth';
import LoadingIndicator from '../components/LoadingIndicator';
import LoginScreen from '../screens/LoginScreen';
import DrawerNavigator from './DrawerNavigator';

const RootStack = createStackNavigator();

export default function AppNavigator() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <LoadingIndicator message="Verificando sessão..." />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
      {user ? (
        <RootStack.Screen name="Main" component={DrawerNavigator} />
      ) : (
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animationTypeForReplace: 'pop' }}
        />
      )}
    </RootStack.Navigator>
  );
}
