// src/pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FiPhone } from 'react-icons/fi'
import styles from '../styles/Login.module.css'

export default function Login() {
  const { user, loginWithGoogle, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState('login') // login | whatsapp
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (!loading && user) {
      checkWhatsapp(user)
    }
  }, [user, loading])

  const checkWhatsapp = async (firebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(userRef)
    if (snap.exists() && snap.data().whatsapp) {
      router.push(router.query.redirect || '/')
    } else {
      setCurrentUser(firebaseUser)
      setStep('whatsapp')
    }
  }

  const handleGoogle = async () => {
    try {
      await loginWithGoogle()
    } catch (e) {
      toast.error('Error al iniciar sesión. Intentá de nuevo.')
    }
  }

  const handleWhatsapp = async () => {
    if (!whatsapp.match(/^\d{10,15}$/)) {
      toast.error('Ingresá un número de WhatsApp válido (solo números, sin +)')
      return
    }
    setSaving(true)
    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await setDoc(userRef, { whatsapp }, { merge: true })
      toast.success('¡Bienvenida!')
      router.push(router.query.redirect || '/')
    } catch {
      toast.error('Error guardando. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Petite Sorciere</span>
          <span className={styles.brandSub}>Lencería</span>
        </div>

        {step === 'login' ? (
          <>
            <h2 className={styles.title}>Bienvenida</h2>
            <p className={styles.sub}>Iniciá sesión para ver tu carrito y tus pedidos.</p>
            <button className={styles.googleBtn} onClick={handleGoogle}>
              <FcGoogle size={20} />
              Continuar con Google
            </button>
            <p className={styles.legal}>
              Al ingresar, aceptás que guardemos tu nombre y email para gestionar tus pedidos.
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Un último paso</h2>
            <p className={styles.sub}>
              Necesitamos tu número de WhatsApp para coordinar tu pedido.
            </p>
            <div className="input-group">
              <label className="input-label">
                <FiPhone size={13} style={{ marginRight: 4 }} />
                Número de WhatsApp
              </label>
              <input
                type="tel"
                className="input"
                placeholder="Ej: 3624750000 (sin espacios ni +)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                maxLength={15}
              />
              <small style={{ color: 'var(--gray-400)', fontSize: 12, marginTop: 4, display: 'block' }}>
                Solo números, sin +54 ni espacios. Ej: 1155551234
              </small>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleWhatsapp}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Continuar'}
            </button>
          </>
        )}
      </div>

      <div className={styles.deco} />
    </div>
  )
}
