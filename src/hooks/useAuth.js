import { createContext, useContext, useEffect, useState } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const adminEmail = 'loanareynoso2@gmail.com'
        const admin = firebaseUser.email === adminEmail
        setIsAdmin(admin)
        console.log('EMAIL:', firebaseUser.email, 'ES ADMIN:', admin)
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserData(userSnap.data())
        }
      } else {
        setUser(null)
        setUserData(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        nombre: firebaseUser.displayName,
        email: firebaseUser.email,
        whatsapp: '',
        photoURL: firebaseUser.photoURL,
        createdAt: new Date().toISOString(),
      })
    }
    return result
  }

  const loginAdmin = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => signOut(auth)

  const updateUserWhatsapp = async (whatsapp) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, { whatsapp }, { merge: true })
    setUserData((prev) => ({ ...prev, whatsapp }))
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, loginWithGoogle, loginAdmin, logout, updateUserWhatsapp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)