import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { provincias, ciudadesPorProvincia } from '../lib/argentina'
import Navbar from '../components/client/Navbar'
import toast from 'react-hot-toast'
import { FiTrash2, FiPlus, FiMinus, FiCopy, FiCheckCircle, FiMessageCircle } from 'react-icons/fi'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '3624750548'
const ALIAS = process.env.NEXT_PUBLIC_ALIAS_PAGO || 'REYNOSO.76.UALA.'
const CBU = process.env.NEXT_PUBLIC_CBU_PAGO || '3840200500000008806815'

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const { user, userData } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [delivery, setDelivery] = useState('')
  const [provincia, setProvincia] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [cp, setCp] = useState('')
  const [direccion, setDireccion] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [comentario, setComentario] = useState('')
  const [uploading, setUploading] = useState(false)

  const formatPrice = (p) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copiado') }

  const handleDeliveryNext = () => {
    if (!delivery) return toast.error('Selecciona tipo de entrega')
    if (delivery === 'envio' && (!provincia || !ciudad || !cp || !direccion)) return toast.error('Completa todos los datos')
    setStep(2)
  }

  const handleConfirmar = async () => {
    if (!metodoPago) return toast.error('Selecciona metodo de pago')
    if (metodoPago === 'transferencia' && !comprobante) return toast.error('Subi el comprobante')
    if (!user) return router.push('/login')
    setUploading(true)
    try {
      const orderData = {
        userId: user.uid,
        userNombre: userData?.nombre || user.displayName,
        userEmail: user.email,
        userWhatsapp: userData?.whatsapp || '',
        productos: items.map((i) => ({ id: i.id, nombre: i.nombre, precio: i.precio, qty: i.qty })),
        total,
        tipoEntrega: delivery,
        provincia: delivery === 'envio' ? provincia : '',
        ciudad: delivery === 'envio' ? ciudad : '',
        codigoPostal: delivery === 'envio' ? cp : '',
        direccion: delivery === 'envio' ? direccion : '',
        metodoPago,
        comentario,
        estado: metodoPago === 'efectivo' ? 'pendiente_pago' : 'comprobante_enviado',
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'orders'), orderData)
      clearCart()
      setStep(3)
    } catch (e) {
      toast.error('Error al enviar. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const whatsappMsg = encodeURIComponent('Hola, acabo de hacer un pedido en Petite Sorciere Lenceria. Quedo atenta a la confirmacion.')

  if (!user) return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ marginBottom: 16, color: '#9e9e9e' }}>Inicia sesion para ver tu carrito.</p>
        <button className="btn btn-primary" onClick={() => router.push('/login?redirect=/carrito')}>Iniciar sesion</button>
      </div>
    </div>
  )

  return (
    <div>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 0 80px', background: '#fafafa' }}>
        <div className="container">

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
            {['Carrito','Envio','Pago','Listo'].map((s,i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: i <= step ? 1 : 0.35 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e06aa3', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{i < step ? '✓' : i+1}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#616161' }}>{s}</span>
                {i < 3 && <span style={{ color: '#e0e0e0', margin: '0 4px' }}>—</span>}
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto', background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: 'Georgia', fontSize: 24, marginBottom: 24 }}>Tu carrito</h2>
                {items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ color: '#9e9e9e', marginBottom: 16 }}>Tu carrito esta vacio.</p>
                    <button className="btn btn-outline" onClick={() => router.push('/')}>Ver productos</button>
                  </div>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, border: '1px solid #f0f0f0', borderRadius: 8, marginBottom: 12 }}>
                        {item.imagen && <img src={item.imagen} alt={item.nombre} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.nombre}</div>
                          <div style={{ fontSize: 13, color: '#9e9e9e' }}>{formatPrice(item.precio)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e0e0e0', borderRadius: 100, padding: '4px 12px' }}>
                          <button onClick={() => updateQty(item.id, item.qty-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#616161' }}><FiMinus size={14}/></button>
                          <span style={{ fontSize: 14, fontWeight: 500 }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty+1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#616161' }}><FiPlus size={14}/></button>
                        </div>
                        <div style={{ fontWeight: 600, color: '#e06aa3', minWidth: 80, textAlign: 'right' }}>{formatPrice(item.precio * item.qty)}</div>
                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9e9e' }}><FiTrash2 size={15}/></button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 16, color: '#616161' }}>Total: <strong style={{ color: '#e06aa3', fontSize: 20 }}>{formatPrice(total)}</strong></div>
                      <button className="btn btn-primary" onClick={() => setStep(1)}>Continuar</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: 'Georgia', fontSize: 24, marginBottom: 24 }}>Tipo de entrega</h2>
                {[{value:'retiro',label:'Retiro en local',desc:'Te avisamos cuando esta listo'},{value:'envio',label:'Envio a domicilio',desc:'Coordinamos por WhatsApp'}].map((opt) => (
                  <div key={opt.value} onClick={() => setDelivery(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', border: `1.5px solid ${delivery===opt.value?'#e06aa3':'#e0e0e0'}`, borderRadius: 8, cursor: 'pointer', marginBottom: 12, background: delivery===opt.value?'#fdf0f7':'white' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e06aa3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {delivery===opt.value && <div style={{ width: 10, height: 10, background: '#e06aa3', borderRadius: '50%' }}/>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{opt.label}</div>
                      <div style={{ fontSize: 13, color: '#9e9e9e' }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
                {delivery === 'envio' && (
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px dashed #e0e0e0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div><label className="input-label">Provincia</label>
                        <select className="input" value={provincia} onChange={(e) => { setProvincia(e.target.value); setCiudad('') }}>
                          <option value="">Selecciona provincia</option>
                          {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div><label className="input-label">Ciudad</label>
                        <select className="input" value={ciudad} onChange={(e) => setCiudad(e.target.value)} disabled={!provincia}>
                          <option value="">Selecciona ciudad</option>
                          {(ciudadesPorProvincia[provincia]||[]).map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}><label className="input-label">Codigo postal</label><input className="input" placeholder="Ej: 3500" value={cp} onChange={(e) => setCp(e.target.value)}/></div>
                    <div><label className="input-label">Direccion completa</label><input className="input" placeholder="Calle, numero, piso/depto" value={direccion} onChange={(e) => setDireccion(e.target.value)}/></div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>Volver</button>
                  <button className="btn btn-primary" onClick={handleDeliveryNext}>Continuar</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: 'Georgia', fontSize: 24, marginBottom: 8 }}>Metodo de pago</h2>
                <p style={{ color: '#9e9e9e', fontSize: 14, marginBottom: 24 }}>Total a pagar: <strong style={{ color: '#e06aa3' }}>{formatPrice(total)}</strong></p>
                {[{value:'transferencia',label:'Transferencia bancaria',desc:'Alias o CBU'},{value:'efectivo',label:'Efectivo en local',desc:'Paga al retirar'}].map((opt) => (
                  <div key={opt.value} onClick={() => setMetodoPago(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', border: `1.5px solid ${metodoPago===opt.value?'#e06aa3':'#e0e0e0'}`, borderRadius: 8, cursor: 'pointer', marginBottom: 12, background: metodoPago===opt.value?'#fdf0f7':'white' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e06aa3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {metodoPago===opt.value && <div style={{ width: 10, height: 10, background: '#e06aa3', borderRadius: '50%' }}/>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{opt.label}</div>
                      <div style={{ fontSize: 13, color: '#9e9e9e' }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
                {metodoPago === 'transferencia' && (
                  <div style={{ background: '#fdf0f7', borderRadius: 12, padding: 24, marginTop: 16, border: '1px solid #f5b8d8' }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#9e9e9e', fontWeight: 600, marginBottom: 8 }}>Alias</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <code style={{ fontSize: 15, fontWeight: 600, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid #e0e0e0' }}>{ALIAS}</code>
                        <button onClick={() => copy(ALIAS)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#e06aa3', color: 'white', border: 'none', borderRadius: 100, fontSize: 12, cursor: 'pointer' }}><FiCopy size={14}/> Copiar</button>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#9e9e9e', fontWeight: 600, marginBottom: 8 }}>CBU</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <code style={{ fontSize: 15, fontWeight: 600, background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid #e0e0e0' }}>{CBU}</code>
                        <button onClick={() => copy(CBU)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#e06aa3', color: 'white', border: 'none', borderRadius: 100, fontSize: 12, cursor: 'pointer' }}><FiCopy size={14}/> Copiar</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 20 }}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#616161', marginBottom: 8 }}>Subir comprobante *</label>
                      <label style={{ display: 'block', border: '2px dashed #f5b8d8', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: comprobante ? 'white' : '#fdf0f7' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setComprobante(e.target.files[0])}/>
                        {comprobante ? <div><img src={URL.createObjectURL(comprobante)} alt="" style={{ maxHeight: 100, borderRadius: 8 }}/><div style={{ fontSize: 13, marginTop: 8 }}>{comprobante.name}</div></div> : <div style={{ color: '#9e9e9e', fontSize: 14 }}>Toca para subir imagen</div>}
                      </label>
                    </div>
                  </div>
                )}
                {metodoPago === 'efectivo' && (
                  <div style={{ background: '#fff8e1', borderRadius: 12, padding: 20, marginTop: 16, border: '1px solid #ffe082' }}>
                    <p style={{ fontSize: 14, color: '#f57f17' }}>💵 Pagas en efectivo cuando retires o cuando pase el delivery. Te confirmamos por WhatsApp.</p>
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#616161', marginBottom: 8 }}>Comentario (opcional)</label>
                  <textarea className="input" rows={3} placeholder="Alguna aclaracion adicional..." value={comentario} onChange={(e) => setComentario(e.target.value)}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>Volver</button>
                  <button className="btn btn-primary" onClick={handleConfirmar} disabled={uploading}>{uploading ? 'Enviando...' : 'Confirmar pedido'}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#e06aa3', marginBottom: 20 }}><FiCheckCircle size={56}/></div>
                <h2 style={{ fontFamily: 'Georgia', fontSize: 28, marginBottom: 12 }}>Pedido recibido!</h2>
                <p style={{ color: '#9e9e9e', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                  {metodoPago === 'efectivo' ? 'Tu pedido fue registrado. Te contactamos por WhatsApp para coordinar.' : 'Tu comprobante fue enviado. En breve te contactamos por WhatsApp.'}
                </p>
                <a href={"https://wa.me/54"+WHATSAPP_NUMBER+"?text="+whatsappMsg} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg" style={{ display: 'inline-flex', marginBottom: 12 }}>
                  <FiMessageCircle size={18}/> Contactar por WhatsApp
                </a>
                <br/>
                <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => router.push('/')}>Seguir comprando</button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
