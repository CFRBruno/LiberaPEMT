// Cria (ou atualiza) um administrador: conta no Authentication + cadastro no Firestore.
// Uso: node scripts/criar-admin.mjs <usuario> "<Nome>" <senha> [chave.json]
// A chave.json (conta de serviço) NUNCA deve ir para o Git — ela já está no .gitignore.
import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const [usuario, nome, senha, chave = 'chave-servico.json'] = process.argv.slice(2)
if (!usuario || !nome || !senha) { console.error('Uso: node scripts/criar-admin.mjs <usuario> "<Nome>" <senha> [chave.json]'); process.exit(1) }

initializeApp({ credential: cert(JSON.parse(readFileSync(chave, 'utf8'))) })
const un = usuario.trim().toLowerCase()
const email = `${un}@liberapemt.app`
const PW = 'liberapemt:' // mesmo prefixo usado pelo site (Firebase exige 6+ caracteres)

const auth = getAuth(), db = getFirestore()
let uid
try { uid = (await auth.getUserByEmail(email)).uid; await auth.updateUser(uid, { password: PW + senha }) }
catch { uid = (await auth.createUser({ email, password: PW + senha })).uid }
await db.doc(`users/${uid}`).set({ username: un, authEmail: email, nome, role: 'pcm', setor: null, admin: true, ativo: true }, { merge: true })
await db.doc(`logins/${un}`).set({ email })
console.log(`OK: administrador "${un}" pronto. Já pode entrar no site.`)
