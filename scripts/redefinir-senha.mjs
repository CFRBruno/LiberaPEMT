// Redefine a senha de um membro (não altera tipo nem permissões).
// Uso: node scripts/redefinir-senha.mjs <usuario> <nova-senha> [chave.json]
import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const [usuario, senha, chave = 'chave-servico.json'] = process.argv.slice(2)
if (!usuario || !senha) { console.error('Uso: node scripts/redefinir-senha.mjs <usuario> <nova-senha> [chave.json]'); process.exit(1) }

initializeApp({ credential: cert(JSON.parse(readFileSync(chave, 'utf8'))) })
const un = usuario.trim().toLowerCase()
const db = getFirestore()
const login = await db.doc(`logins/${un}`).get()
const email = login.exists ? login.data().email : `${un}@liberapemt.app`
try {
  const u = await getAuth().getUserByEmail(email)
  await getAuth().updateUser(u.uid, { password: 'liberapemt:' + senha }) // mesmo prefixo do site
  console.log(`OK: senha de "${un}" redefinida.`)
} catch (e) { console.error(`Não encontrei o usuário "${un}":`, e.message); process.exit(1) }
