import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Firebase Service — reemplaza supa de supabase.js ─────────────────────────
// Mismas funciones: get, post, patch, delete, sub
// El resto de la app no necesita cambiar la lógica, solo el import

export const fs = {

  // GET — trae todos los documentos de una colección
  async get(table, params = {}) {
    try {
      const { orderByField = null, limitCount = null } = params;
      const col = collection(db, table);

      let q = col;
      if (orderByField) q = query(col, orderBy(orderByField, "desc"));
      if (limitCount)   q = query(q, limit(limitCount));

      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn(`[fs.get] ${table}:`, e.message);
      return null;
    }
  },

  // GET ONE — trae un documento por id
  async getOne(table, id) {
    try {
      const snap = await getDoc(doc(db, table, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (e) {
      console.warn(`[fs.getOne] ${table}:`, e.message);
      return null;
    }
  },

  // POST — crea un documento nuevo (Firestore genera el id automático)
  async post(table, body) {
    try {
      const ref = await addDoc(collection(db, table), {
        ...body,
        creadoEn: serverTimestamp(),
      });
      return { id: ref.id, ...body };
    } catch (e) {
      console.warn(`[fs.post] ${table}:`, e.message);
      return null;
    }
  },

  // PATCH — actualiza un documento por id
  async patch(table, id, body) {
    try {
      await updateDoc(doc(db, table, id), {
        ...body,
        actualizadoEn: serverTimestamp(),
      });
      return { id, ...body };
    } catch (e) {
      console.warn(`[fs.patch] ${table}:`, e.message);
      return null;
    }
  },

  // DELETE — elimina un documento por id
  async delete(table, id) {
    try {
      await deleteDoc(doc(db, table, id));
      return true;
    } catch (e) {
      console.warn(`[fs.delete] ${table}:`, e.message);
      return false;
    }
  },

  // SUB — escucha cambios en tiempo real (reemplaza el polling de Supabase)
  // Retorna la función para cancelar la suscripción — igual que antes
  sub(table, cb) {
    try {
      const q = query(collection(db, table), orderBy("creadoEn", "desc"), limit(100));
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        cb(data);
      }, (e) => {
        console.warn(`[fs.sub] ${table}:`, e.message);
      });
      return unsub; // llama unsub() para cancelar, igual que clearInterval antes
    } catch (e) {
      console.warn(`[fs.sub] ${table}:`, e.message);
      return () => {};
    }
  },
};
