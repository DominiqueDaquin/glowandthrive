"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase, type Product } from "@/lib/supabase"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    phone: "",
    nom: "",
    email: "",
    adresse: "",
  })

  useEffect(() => {
    const productId = searchParams.get("produit")
    const qty = searchParams.get("quantite")

    if (productId) {
      setQuantity(qty ? Number(qty) : 1)
      fetchProduct(productId)
    } else {
      router.push("/")
    }
  }, [searchParams, router])

  async function fetchProduct(id: string) {
    try {
      const { data, error } = await supabase.from("produits").select("*").eq("id", id).single()
      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.phone || !formData.nom || !formData.email || !formData.adresse) {
      alert("Veuillez remplir tous les champs")
      return
    }

    setProcessing(true)
    const whatsappLink = await sendData()
    window.open(whatsappLink, "_blank")

    // Simulation du paiement
    setTimeout(() => {

      router.push("/")
    }, 2000)
  }

  async function sendData(): Promise<string> {
    const nomClient = formData.nom?.trim() || ''
    const phoneClient = formData.phone?.trim() || ''
    const emailClient = formData.email?.trim() || ''
    const adresseClient = formData.adresse?.trim() || ''
    const total = product ? product.prix * quantity : 0

    console.log('Informations client:', {
      nom: nomClient,
      phone: phoneClient,
      email: emailClient,
      adresse: adresseClient
    })

    // Construction du message WhatsApp avec emojis et formatage
    const message = `🛒 *NOUVELLE COMMANDE* 🛒\n

📋 *Détails de la commande:*\n
➖ *Produit:* ${product?.nom || 'Non spécifié'}\n
➖ *Quantité:* ${quantity}\n
➖ *Prix unitaire:* ${product?.prix || 0} XAF\n
➖ *Total:* ${total} XAF\n

👤 *Informations client:*\n
➖ *Nom:* ${nomClient}\n
➖ *Téléphone:* ${phoneClient}\n
➖ *Email:* ${emailClient}\n
➖ *Adresse:* ${adresseClient}\n

📅 *Date de commande:* ${new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

Merci pour votre confiance ! 💙`

    const messageToSend = encodeURIComponent(message)
    const whatsappLink = `https://wa.me/237677519251?text=${messageToSend}`

    // Envoi direct à Facebook Conversions API
    try {
      // Hachage des données pour Facebook CAPI
      const [hashedEmail, hashedPhone, hashedFirstName, hashedLastName] = await Promise.all([
        hashSHA256(emailClient),
        hashSHA256(phoneClient),
        hashSHA256(nomClient.split(' ')[0]),
        hashSHA256(nomClient.split(' ')[1] || '')
      ])

      // Configuration Facebook API
      const FACEBOOK_PIXEL_ID = "1428443261691540"
      const FACEBOOK_ACCESS_TOKEN = "EAAYFqusjE9UBPCBx8VJ6NblZBhJ0fNDTkbwBM2ZAzzFrmDKZBUT4MBsbgTMZAkGyJb6OwUqDkdpaCHCKCYh7S7cab1IDBOXBPZA9aZAsaNjoWOjVduLMZAPd1fcDu08XmZA1ZCgIzUA8Mey0Bfq54lNZCbnh64uTtePH4uOVidJbOvW8B7BZCLCR4UZBI7MRgZCtPOfQu3wZDZD"

      const eventId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
     //for meta pixel
      fbq('track', 'Purchase', {
        value: total,
        currency: 'USD',
        contents: [{ id: product?.id, quantity: quantity, item_price: product?.prix }],
        content_ids: [product?.id.toString()],
        content_type: 'product'
      }, { eventID: eventId });

      const eventData = {
        data: [{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          user_data: {
            em: [hashedEmail],
            ph: [hashedPhone],
            fn: [hashedFirstName],
            ln: [hashedLastName],
            client_ip_address: "", // À remplir côté serveur si possible
            client_user_agent: navigator.userAgent,
            external_id: [`customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`],
          },
          custom_data: {
            currency: "XAF",
            value: total,
            contents: [{
              id: product?.id.toString() || "N/A",
              quantity: quantity,
              item_price: product?.prix || 0
            }]
          }
        }]
      }

      // Envoi direct à Facebook Conversions API
      const facebookResponse = await fetch(`https://graph.facebook.com/v23.0/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      if (!facebookResponse.ok) {
        const errorText = await facebookResponse.text()
        console.error('Erreur lors de l\'envoi à Facebook CAPI:', errorText)
      } else {
        const result = await facebookResponse.json()
        console.log('Données envoyées avec succès à Facebook CAPI:', result)
      }

      // Optionnel : Envoi parallèle au webhook Make (si vous voulez conserver les deux)
      /*
      const makeResponse = await fetch('https://hook.eu2.make.com/wz56i7bq5w3y1fdqswxomha4mrrtt8go', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData.data[0])
      })
  
      if (!makeResponse.ok) {
        console.error('Erreur lors de l\'envoi à Make:', await makeResponse.text())
      } else {
        console.log('Données envoyées avec succès à Make')
      }
      */

    } catch (error) {
      console.error('Erreur lors de l\'envoi des données:', error)
    }

    return whatsappLink
  }

  async function hashSHA256(data: string): Promise<string> {
    if (!data) return ""
    try {
      const encoder = new TextEncoder()
      const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
      return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (error) {
      console.error('Erreur lors du hachage:', error)
      return ""
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  const total = product.prix * quantity

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Récapitulatif de commande</h2>
        <div className="flex justify-between items-center py-2">
          <span>
            {product.nom} x {quantity}
          </span>
          <span className="font-semibold">{total.toFixed(2)} XAF</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)} XAF</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePayment} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse complète *
          </label>
          <textarea
            id="adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Traitement en cours..." : `Payer ${total.toFixed(2)} XAF`}
        </button>
      </form>
    </div>
  )
}