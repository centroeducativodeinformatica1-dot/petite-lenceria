// src/pages/admin/login.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import styles from '../../styles/Login.module.css'

export default function AdminLogin() {
  const { loginAdmin } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginAdmin(email, password)
      router.push('/admin')
    } catch {
      toast.error('Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Petite Sorciere</span>
          <span className={styles.brandSub}>Panel Vendedora</span>
        </div>
        <h2 className={styles.title}>Acceso admin</h2>
        <p className={styles.sub}>Ingresá con tu cuenta de administradora.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@ejemplo.com" />
          </div>
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
      <div className={styles.deco} />
    </div>
  )
}
