import { createContext, useContext, useEffect, useState } from 'react'
const hasFb = !!import.meta.env.VITE_FIREBASE_API_KEY
export const loadStore = () => (hasFb ? import('./firebaseStore.js') : import('./localStore.js'))
export const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)
export function useCol(name) {
  const s = useStore()
  const [rows, setRows] = useState([])
  useEffect(() => s.subscribe(name, setRows), [s, name])
  return rows
}
