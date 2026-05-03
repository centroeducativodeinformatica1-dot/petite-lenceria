// src/pages/admin/clientes.js
import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/admin/AdminLayout'
import { FiDownload, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import styles from '../../styles/AdminClients.module.css'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchClients = async () => {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchClients()
  }, [])

  const exportCSV = () => {
    const rows = [
      ['Nombre', 'Email', 'WhatsApp', 'Registro'],
      ...clients.map((c) => [c.nombre, c.email, c.whatsapp, c.createdAt]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clientes_petite_sorciere.csv'
    a.click()
    toast.success('CSV exportado')
  }

  const filtered = clients.filter((c) =>
    !search ||
    c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div>
        <div className={styles.header}>
          <h1 className={styles.title}>Clientes</h1>
          <button className="btn btn-outline" onClick={exportCSV}>
            <FiDownload size={16} /> Exportar CSV
          </button>
        </div>

        <div className={styles.searchWrap}>
          <input
            type="text"
            className="input"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Cliente</span>
              <span>Email</span>
              <span>WhatsApp</span>
              <span>Acciones</span>
            </div>
            {filtered.map((c) => (
              <div key={c.id} className={styles.tableRow}>
                <div className={styles.clientInfo}>
                  {c.photoURL && <img src={c.photoURL} alt="" className={styles.avatar} />}
                  <span>{c.nombre || '—'}</span>
                </div>
                <div className={styles.clientEmail}>{c.email}</div>
                <div>{c.whatsapp || '—'}</div>
                <div>
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/54${c.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp btn-sm"
                    >
                      <FiMessageCircle size={13} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
