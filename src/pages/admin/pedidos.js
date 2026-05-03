// src/pages/admin/pedidos.js
import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { FiMessageCircle, FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import styles from '../../styles/AdminOrders.module.css'

const ESTADOS = [
  { value: 'pendiente_pago', label: 'Pendiente pago', cls: 'badge-yellow' },
  { value: 'comprobante_enviado', label: 'Comprobante enviado', cls: 'badge-blue' },
  { value: 'pago_verificado', label: 'Pago verificado', cls: 'badge-green' },
  { value: 'contactado', label: 'Contactado', cls: 'badge-pink' },
  { value: 'en_preparacion', label: 'En preparación', cls: 'badge-pink' },
  { value: 'entregado', label: 'Entregado', cls: 'badge-gray' },
]

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

const WHATSAPP_MSG = encodeURIComponent(
  'Hola, soy de Petite Sorciere Lencería. Recibimos tu pedido y comprobante. Estamos coordinando tu envío o retiro. En breve te confirmamos los detalles.'
)

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filterEstado, setFilterEstado] = useState('todos')

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const updateEstado = async (id, estado) => {
    try {
      await updateDoc(doc(db, 'orders', id), { estado })
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const filtered = filterEstado === 'todos'
    ? orders
    : orders.filter((o) => o.estado === filterEstado)

  return (
    <AdminLayout>
      <div>
        <h1 className={styles.title}>Pedidos</h1>

        {/* Filters */}
        <div className={styles.filters}>
          {['todos', ...ESTADOS.map((e) => e.value)].map((v) => (
            <button
              key={v}
              className={`${styles.filterBtn} ${filterEstado === v ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterEstado(v)}
            >
              {v === 'todos' ? 'Todos' : ESTADOS.find((e) => e.value === v)?.label}
              {v !== 'todos' && (
                <span className={styles.filterCount}>
                  {orders.filter((o) => o.estado === v).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div className={styles.list}>
            {filtered.map((order) => {
              const badge = ESTADOS.find((e) => e.value === order.estado) || { label: order.estado, cls: 'badge-gray' }
              const isOpen = expanded === order.id

              return (
                <div key={order.id} className={`${styles.orderCard} ${isOpen ? styles.orderCardOpen : ''}`}>
                  {/* Header */}
                  <div className={styles.orderHeader} onClick={() => setExpanded(isOpen ? null : order.id)}>
                    <div className={styles.orderMeta}>
                      <div className={styles.orderClient}>{order.userNombre}</div>
                      <div className={styles.orderEmail}>{order.userEmail}</div>
                    </div>
                    <div className={styles.orderTotal}>{formatPrice(order.total)}</div>
                    <div><span className={`badge ${badge.cls}`}>{badge.label}</span></div>
                    <div className={styles.orderDate}>
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString('es-AR')
                        : '—'}
                    </div>
                    {isOpen ? <FiChevronUp size={18} color="var(--gray-400)" /> : <FiChevronDown size={18} color="var(--gray-400)" />}
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className={styles.orderBody}>
                      <div className={styles.orderGrid}>
                        {/* Left column */}
                        <div>
                          <div className={styles.infoSection}>
                            <h4 className={styles.infoTitle}>Datos del cliente</h4>
                            <div className={styles.infoRow}>
                              <span>Nombre:</span> <span>{order.userNombre}</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span>Email:</span> <span>{order.userEmail}</span>
                            </div>
                            <div className={styles.infoRow}>
                              <span>WhatsApp:</span>
                              <a
                                href={`https://wa.me/54${order.userWhatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.waLink}
                              >
                                {order.userWhatsapp} <FiExternalLink size={12} />
                              </a>
                            </div>
                          </div>

                          <div className={styles.infoSection}>
                            <h4 className={styles.infoTitle}>Entrega</h4>
                            <div className={styles.infoRow}>
                              <span>Tipo:</span>
                              <span>{order.tipoEntrega === 'envio' ? '📦 Envío' : '🏪 Retiro'}</span>
                            </div>
                            {order.tipoEntrega === 'envio' && (
                              <>
                                <div className={styles.infoRow}><span>Provincia:</span> <span>{order.provincia}</span></div>
                                <div className={styles.infoRow}><span>Ciudad:</span> <span>{order.ciudad}</span></div>
                                <div className={styles.infoRow}><span>CP:</span> <span>{order.codigoPostal}</span></div>
                                <div className={styles.infoRow}><span>Dirección:</span> <span>{order.direccion}</span></div>
                              </>
                            )}
                          </div>

                          <div className={styles.infoSection}>
                            <h4 className={styles.infoTitle}>Cambiar estado</h4>
                            <select
                              className="input"
                              value={order.estado}
                              onChange={(e) => updateEstado(order.id, e.target.value)}
                            >
                              {ESTADOS.map((e) => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Right column */}
                        <div>
                          <div className={styles.infoSection}>
                            <h4 className={styles.infoTitle}>Productos</h4>
                            {(order.productos || []).map((p, i) => (
                              <div key={i} className={styles.productRow}>
                                <span>{p.nombre} x{p.qty}</span>
                                <span>{formatPrice(p.precio * p.qty)}</span>
                              </div>
                            ))}
                            <div className={styles.productRowTotal}>
                              <span>Total</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          {order.comprobanteUrl && (
                            <div className={styles.infoSection}>
                              <h4 className={styles.infoTitle}>Comprobante</h4>
                              <a href={order.comprobanteUrl} target="_blank" rel="noopener noreferrer">
                                <img src={order.comprobanteUrl} alt="Comprobante" className={styles.comprobanteImg} />
                              </a>
                            </div>
                          )}

                          {order.comentario && (
                            <div className={styles.infoSection}>
                              <h4 className={styles.infoTitle}>Comentario</h4>
                              <p className={styles.comentario}>{order.comentario}</p>
                            </div>
                          )}

                          <a
                            href={`https://wa.me/54${order.userWhatsapp}?text=${WHATSAPP_MSG}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp"
                            style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                          >
                            <FiMessageCircle size={16} />
                            Contactar por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
