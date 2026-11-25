// src/utils/alerts.js
// Alert.alert do React Native não exibe nada na web; estes helpers usam
// window.alert / window.confirm no navegador e Alert.alert no celular.
import { Alert, Platform } from 'react-native';

export function showAlert(title, message) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

export function confirmAction(title, message, onConfirm, confirmText = 'Confirmar') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
