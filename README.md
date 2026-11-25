# 🌍 Explorador de Países - Guia de Viagens e Destinos

Aplicativo mobile em **React Native (Expo)** + **Firebase** para explorar países do mundo
(REST Countries API v3.1) e montar roteiros pessoais ("Quero Visitar" / "Visitados") salvos no Firestore.

## Stack
- React Native + Expo (JavaScript), apenas componentes funcionais e Hooks
- `@react-navigation/native` + `stack` + `drawer` (combinados)
- Firebase v9+ Modular SDK (`firebase/auth` E-mail/Senha + Google na web, `firebase/firestore`)
- `@expo/vector-icons` (Ionicons)

## Estrutura
```
App.js                      # NavigationContainer
firebaseConfig.js           # credenciais do Firebase (placeholders)
firestore.rules             # regras de segurança sugeridas
src/
  components/  CountryCard.js · RegionFilter.js · LoadingIndicator.js
  screens/     LoginScreen.js · HomeScreen.js · DetailsScreen.js · ProfileScreen.js
  navigation/  AppNavigator.js · DrawerNavigator.js · HomeStack.js
  services/    api.js · firestoreService.js
  hooks/       useAuth.js · useCountries.js
  theme.js     # paleta de cores
```

### Fluxo de navegação
```
AppNavigator (useAuth)
 ├─ LoginScreen                      (usuário deslogado)
 └─ DrawerNavigator                  (usuário logado)
     ├─ "Início" → HomeStack
     │     ├─ HomeScreen
     │     └─ DetailsScreen
     ├─ "Meu Perfil / Roteiros" → ProfileScreen
     └─ botão "Sair" (signOut)
```

## Endpoints utilizados (REST Countries v3.1)
Todos com `?fields=name,flags,capital,region,subregion,population,languages,currencies,timezones,cca3`
- Todos: `https://restcountries.com/v3.1/all`
- Por região: `https://restcountries.com/v3.1/region/{region}`
- Por nome: `https://restcountries.com/v3.1/name/{nome}`
- Por código: `https://restcountries.com/v3.1/alpha/{cca3}`

Se a API oficial falhar, o app usa automaticamente o espelho `https://studies.cs.helsinki.fi/restcountries/api/all` (mesmo formato v3.1) e filtra os dados localmente.

## Firestore - coleção `trips`
Documento com id `{uid}_{cca3}` (evita duplicar o mesmo país para o mesmo usuário):

| Campo        | Tipo      | Descrição                          |
|--------------|-----------|------------------------------------|
| uid          | string    | dono do registro                   |
| countryCode  | string    | código cca3                        |
| countryName  | string    | nome do país                       |
| capital      | string    |                                    |
| region       | string    |                                    |
| flagUrl      | string    | URL da bandeira (png)              |
| status       | string    | `want` (Quero Visitar) / `visited` |
| notes        | string    | notas do usuário                   |
| createdAt    | timestamp |                                    |
| updatedAt    | timestamp |                                    |

## Como executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. No [Console do Firebase](https://console.firebase.google.com/):
   - crie um projeto e um **App Web**;
   - em **Authentication › Sign-in method**, habilite **E-mail/senha**;
   - em **Firestore Database**, crie o banco e publique as regras de `firestore.rules`.
3. Copie as credenciais do App Web para `firebaseConfig.js` (substitua os placeholders `SUA_API_KEY_AQUI` etc.).
4. Rode o app:
   ```bash
   npx expo start
   ```
   Abra no **Expo Go** (QR Code), emulador Android (`a`) ou simulador iOS (`i`).
