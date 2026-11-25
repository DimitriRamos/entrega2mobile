// src/services/firestoreService.js
// CRUD da coleção `trips` no Firestore, sempre vinculado ao `uid` do usuário.
//
// Estrutura de um documento (id = `${uid}_${cca3}`, evitando duplicatas do mesmo país):
// {
//   uid, countryCode, countryName, capital, region, flagUrl,
//   status: 'want' | 'visited',
//   notes: string,
//   createdAt, updatedAt
// }

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const TRIPS = 'trips';

export const TRIP_STATUS = {
  WANT: 'want',
  VISITED: 'visited',
};

const tripId = (uid, countryCode) => `${uid}_${countryCode}`;

/** CREATE / UPDATE: salva (ou atualiza) um país na lista do usuário */
export async function saveTrip(uid, country, { status, notes = '' }) {
  if (!uid) throw new Error('Usuário não autenticado.');

  const ref = doc(db, TRIPS, tripId(uid, country.cca3));
  const existing = await getDoc(ref);

  const data = {
    uid,
    countryCode: country.cca3,
    countryName: country.name?.common ?? '',
    capital: country.capital?.[0] ?? '',
    region: country.region ?? '',
    flagUrl: country.flags?.png ?? '',
    status,
    notes: notes.trim(),
    updatedAt: serverTimestamp(),
  };

  if (!existing.exists()) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(ref, data, { merge: true });
  return ref.id;
}

/** READ: todos os roteiros do usuário */
export async function getUserTrips(uid) {
  const q = query(collection(db, TRIPS), where('uid', '==', uid));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
}

/** READ: roteiro de um país específico (ou null) */
export async function getTripByCountry(uid, countryCode) {
  const snapshot = await getDoc(doc(db, TRIPS, tripId(uid, countryCode)));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

/** UPDATE: altera apenas as notas */
export function updateTripNotes(id, notes) {
  return updateDoc(doc(db, TRIPS, id), {
    notes: notes.trim(),
    updatedAt: serverTimestamp(),
  });
}

/** UPDATE: altera apenas o status (Quero Visitar <-> Visitado) */
export function updateTripStatus(id, status) {
  return updateDoc(doc(db, TRIPS, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** DELETE */
export function deleteTrip(id) {
  return deleteDoc(doc(db, TRIPS, id));
}
