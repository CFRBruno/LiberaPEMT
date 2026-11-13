import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
const app = initializeApp(cfg)
const fbAuth = getAuth(app)
const db = getFirestore(app)
// Usuário/senha -> e-mail interno fictício (o usuário nunca vê isso).
const mail = (u) => `${u.trim().toLowerCase()}@liberapemt.app`

export const demo = false
export const auth = {
  onChange(cb) {
    return onAuthStateChanged(fbAuth, async (u) => {
      if (!u) return cb(null)
      const s = await getDoc(doc(db, 'users', u.uid))
      if (s.exists() && s.data().ativo === false) { await signOut(fbAuth); return cb(null) }
      cb(s.exists() ? { uid: u.uid, ...s.data() } : null)
    })
  },
  async signIn(username, senha) {
    try { await signInWithEmailAndPassword(fbAuth, mail(username), senha) } catch { throw new Error('Usuário ou senha inválidos.') }
  },
  signOut: () => signOut(fbAuth),
  // Cria o usuário sem deslogar o PCM (usa uma segunda instância do app).
  async createUser({ username, nome, role, setor, password, admin }) {
    const sec = initializeApp(cfg, 'sec' + Date.now())
    const secAuth = getAuth(sec)
    try {
      const c = await createUserWithEmailAndPassword(secAuth, mail(username), password)
      await setDoc(doc(db, 'users', c.user.uid), { username: username.trim().toLowerCase(), nome, role, setor: setor || null, admin: !!admin, ativo: true })
    } catch (e) {
      throw new Error(e.code === 'auth/email-already-in-use' ? 'Usuário já existe.' : e.code === 'auth/weak-password' ? 'Senha fraca (mín. 6 caracteres).' : e.message)
    } finally { await signOut(secAuth) }
  },
}
export const subscribe = (c, cb) => onSnapshot(collection(db, c), (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
export async function batch(ops) {
  for (let i = 0; i < ops.length; i += 400) {
    const b = writeBatch(db)
    for (const { col, id, data, merge, del } of ops.slice(i, i + 400)) {
      const r = doc(db, col, id)
      del ? b.delete(r) : b.set(r, data, { merge: !!merge })
    }
    await b.commit()
  }
}
