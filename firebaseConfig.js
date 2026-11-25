// firebaseConfig.js
// Configuração inicial do Firebase (SDK v9+ modular).
//
// ⚠️  SUBSTITUA os placeholders abaixo pelas credenciais do SEU projeto:
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
  apiKey: 'SUA_API_KEY_AQUI',
  authDomain: 'SEU_PROJETO.firebaseapp.com',
  projectId: 'SEU_PROJECT_ID_AQUI',
  storageBucket: 'SEU_PROJETO.appspot.com',
  messagingSenderId: 'SEU_MESSAGING_SENDER_ID_AQUI',
  appId: 'SEU_APP_ID_AQUI',
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
