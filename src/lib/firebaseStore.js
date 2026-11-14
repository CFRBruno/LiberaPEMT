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
// O Firebase exige senha com 6+ caracteres; o prefixo permite ao usuário ter qualquer senha (mesmo curta).
const PW = 'liberapemt:'
export const authEmailOf = (u) => u.authEmail || mail(u.username)

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
    const u = username.trim().toLowerCase()
    let email = mail(u)
    try { const l = await getDoc(doc(db, 'logins', u)); if (l.exists()) email = l.data().email } catch { /* usa o padrão */ }
    for (const pw of [PW + senha, senha]) { // 2ª tentativa: contas antigas criadas à mão no console
      try { await signInWithEmailAndPassword(fbAuth, email, pw); return } catch { /* tenta a próxima */ }
    }
    throw new Error('Usuário ou senha inválidos.')
  },
  signOut: () => signOut(fbAuth),
  // Cria o usuário sem deslogar o PCM (usa uma segunda instância do app).
  async createUser({ username, nome, role, setor, password, admin }) {
    const sec = initializeApp(cfg, 'sec' + Date.now())
    const secAuth = getAuth(sec)
    try {
      const email = mail(username)
      const c = await createUserWithEmailAndPassword(secAuth, email, PW + password)
      const un = username.trim().toLowerCase()
      await setDoc(doc(db, 'users', c.user.uid), { username: un, authEmail: email, nome, role, setor: setor || null, admin: !!admin, ativo: true })
      await setDoc(doc(db, 'logins', un), { email })
    } catch (e) {
      throw new Error(e.code === 'auth/email-already-in-use' ? 'Usuário já existe.' : e.message)
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
