// src/pages/admin/productos.js
import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { uploadImage } from '../../lib/cloudinary'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage, FiPackage, FiTag, FiDollarSign } from 'react-icons/fi'
import styles from '../../styles/AdminProducts.module.css'

const EMPTY_PRODUCT = {
  nombre: '', precio: '', descripcion: '',
  categoria: '', estado: 'activo', imagen: '', stock: ''
}

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const openModal = (product = null) => {
    setEditing(product?.id || null)
    setForm(product ? { ...product, stock: product.stock ?? '' } : EMPTY_PRODUCT)
    setImageFile(null)
    setImagePreview(product?.imagen || null)
    setModal(true)
  }

  const closeModal = () => {
    setModal(false); setEditing(null)
    setForm(EMPTY_PRODUCT); setImageFile(null); setImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.nombre || !form.precio) return toast.error('Nombre y precio son obligatorios')
    setSaving(true)
    try {
      let imageUrl = form.imagen
      if (imageFile) imageUrl = await uploadImage(imageFile)
      const data = {
        nombre: form.nombre, precio: Number(form.precio),
        descripcion: form.descripcion, categoria: form.categoria,
        estado: form.estado, imagen: imageUrl,
        stock: form.stock !== '' ? Number(form.stock) : null
      }
      if (editing) {
        await updateDoc(doc(db, 'products', editing), data)
        toast.success('Producto actualizado ✨')
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
        toast.success('Producto creado 🌸')
      }
      closeModal()
    } catch (e) {
      console.error(e); toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteDoc(doc(db, 'products', id))
      toast.success('Producto eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  const stockLabel = (p) => {
    if (p.stock === null || p.stock === undefined) return null
    if (p.stock === 0) return { text: 'Sin stock', color: '#ef4444' }
    if (p.stock <= 3) return { text: `Stock: ${p.stock}`, color: '#f59e0b' }
    return { text: `Stock: ${p.stock}`, color: '#10b981' }
  }

  return (
    <AdminLayout>
      <div>
        <div className={styles.header}>
          <h1 className={styles.title}>Productos</h1>
          <button className="btn-primary" onClick={() => openModal()}>
            <FiPlus /> Nuevo producto
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>Cargando...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <FiImage size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Todavía no hay productos. ¡Creá el primero!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => {
              const sl = stockLabel(p)
              return (
                <div key={p.id} className={styles.productCard}>
                  <div className={styles.productImageWrap}>
                    {p.imagen
                      ? <img src={p.imagen} alt={p.nombre} className={styles.productImage} />
                      : <div className={styles.productImagePlaceholder}><FiImage size={32} /></div>
                    }
                    <div className={styles.productActions}>
                      <button className={styles.actionBtn} onClick={() => openModal(p)} title="Editar"><FiEdit2 size={14} /></button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(p.id)} title="Eliminar"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    {p.categoria && <span className={styles.productCategory}>{p.categoria}</span>}
                    <span className={styles.productName}>{p.nombre}</span>
                    <span className={styles.productPrice}>{formatPrice(p.precio)}</span>
                    {sl && <span style={{ fontSize: 11, fontWeight: 600, color: sl.color, marginTop: 2 }}>{sl.text}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {modal && (
          <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className={styles.modal}>

              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>{editing ? '✏️ Editar producto' : '🌸 Nuevo producto'}</h2>
                <button className={styles.closeBtn} onClick={closeModal}><FiX size={18} /></button>
              </div>

              <div className={styles.modalBody}>

                {/* Info básica */}
                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>Información básica</p>
                  <div className={styles.formRow} style={{ marginBottom: 14 }}>
                    <div>
                      <label className={styles.formLabel}>Nombre *</label>
                      <input className={styles.formInput} placeholder="Ej: Conjunto de encaje"
                        value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Categoría</label>
                      <input className={styles.formInput} placeholder="Ej: Conjuntos, Corpiños..."
                        value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={styles.formLabel}>Descripción</label>
                    <textarea className={styles.formInput} rows={3} placeholder="Descripción del producto..."
                      value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                      style={{ resize: 'vertical' }} />
                  </div>
                </div>

                {/* Precio, stock, estado */}
                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>Precio y disponibilidad</p>
                  <div className={styles.formRow}>
                    <div>
                      <label className={styles.formLabel}>Precio (ARS) *</label>
                      <input className={styles.formInput} type="number" placeholder="Ej: 15000"
                        value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Estado</label>
                      <select className={styles.formInput} value={form.estado}
                        onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                        <option value="activo">✅ Activo</option>
                        <option value="inactivo">⏸ Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label className={styles.formLabel}>Stock</label>
                    <div className={styles.stockInputWrap}>
                      <input className={styles.stockInput} type="number" min="0" placeholder="Ej: 10"
                        value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                      {form.stock !== '' && Number(form.stock) === 0 &&
                        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠️ Se ocultará del catálogo</span>}
                      {form.stock !== '' && Number(form.stock) > 0 && Number(form.stock) <= 3 &&
                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>⚡ Stock bajo</span>}
                      {form.stock === '' &&
                        <span style={{ fontSize: 12, color: '#aaa' }}>Dejá vacío = sin límite</span>}
                    </div>
                    <p className={styles.formHint}>Al llegar a 0, desaparece automáticamente del catálogo.</p>
                  </div>
                </div>

                {/* Imagen */}
                <div className={styles.formSection}>
                  <p className={styles.formSectionTitle}>Imagen del producto</p>
                  <label className={styles.uploadBtn} style={{ cursor: 'pointer' }}>
                    <FiUpload size={14} />
                    {imageFile ? imageFile.name : 'Seleccionar imagen'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  </label>
                  {imagePreview && (
                    <div style={{ marginTop: 12 }}>
                      <img src={imagePreview} alt="Preview" className={styles.currentImage} />
                    </div>
                  )}
                </div>

              </div>

              <div className={styles.modalFooter}>
                <button className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
