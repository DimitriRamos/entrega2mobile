// firebaseConfig.js
// Configuração inicial do Firebase (SDK v9+ modular).
//
// Credenciais do projeto Firebase (para trocar de projeto, substitua os valores abaixo):
//     Console do Firebase > Configurações do projeto > Seus apps > App da Web > SDK setup and configuration
//
// Lembre-se também de, no Console do Firebase:
//   1. Authentication > Sign-in method > habilitar "E-mail/senha"
//   2. Firestore Database > Criar banco de dados (e publicar as regras de firestore.rules)

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDID9E2XwJ2h9cu4BmWtRAtHRJYZ54nDH4',
  authDomain: 'entrega2mobile.firebaseapp.com',
  projectId: 'entrega2mobile',
  storageBucket: 'entrega2mobile.firebasestorage.app',
  messagingSenderId: '960957656383',
  appId: '1:960957656383:web:1592c0dbef62854ede378a',
  measurementId: 'G-3MZRFD4NZ7',
};

// Evita inicializar o app mais de uma vez (ex.: Fast Refresh)
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Auth com persistência: a sessão do usuário sobrevive ao fechamento do app
let auth;
if (isFirstInit) {
  auth = initializeAuth(app, {
    persistence:
      Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage),
  });
} else {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
