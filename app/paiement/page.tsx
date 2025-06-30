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

    // Simulation du paiement
    setTimeout(() => {
      alert("Paiement simulé avec succès ! Merci pour votre commande.")
      router.push("/")
    }, 2000)
    window.open(sendData(), "_blank")
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

  function sendData() {
    // Récupération et validation des données utilisateur
    const nomClient = formData.nom?.trim() || '';
    const phoneClient = formData.phone?.trim() || '';
    const emailClient = formData.email?.trim() || '';
    const adresseClient = formData.adresse?.trim() || '';
  
    console.log('Informations client:', {
      nom: nomClient,
      phone: phoneClient,
      email: emailClient,
      adresse: adresseClient
    });
  
    // Sauvegarde des données via API route
    saveToCSV({
      nom: nomClient,
      phone: phoneClient,
      email: emailClient,
      adresse: adresseClient,
      produit: product?.nom || '',
      quantite: quantity || 0,
      prixUnitaire: product?.prix || 0,
      total: total || 0
    });
  
    // Construction du message WhatsApp avec informations citées
    const message = `Salut, je souhaite passer une commande pour le produit suivant:
  
  📦 *DÉTAILS DE LA COMMANDE*
  - *Nom du produit*: "${product?.nom}"
  - *Quantité*: ${quantity}
  - *Prix unitaire*: ${product?.prix} Fcfa
  - *Total*: ${total} Fcfa
  
  👤 *=== MES INFORMATIONS ===*
  - *Nom*: "${nomClient}"
  - *Téléphone*: "${phoneClient}"
  - *Email*: "${emailClient}"
  - *Adresse*: "${adresseClient}"
  
 *Date de commande*:${new Date().toLocaleDateString('fr-FR')}`;
  
    const messageToSend = encodeURIComponent(message);
    const link = `https://wa.me/237677519251?text=${messageToSend}`;
  
    return link;
  }
  
  // Fonction pour envoyer les données à l'API route
  async function saveToCSV(data: unknown)
   {
    try {
      const response = await fetch('/api/save-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        console.log('Données sauvegardées avec succès dans contacts.csv');
      } else {
        console.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde CSV:', error);
    }
  }
  
  // Fonction pour télécharger le fichier CSV
  // function downloadCSV(csvContent, filename) {
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const link = document.createElement('a');
    
  //   if (link.download !== undefined) {
  //     const url = URL.createObjectURL(blob);
  //     link.setAttribute('href', url);
  //     link.setAttribute('download', filename);
  //     link.style.visibility = 'hidden';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // }
  
  

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser votre commande</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Récapitulatif de commande</h2>
        <div className="flex justify-between items-center py-2">
          <span>
            {product.nom} x {quantity}
          </span>
          <span className="font-semibold">{total.toFixed(2)} Xaf</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)} Xaf</span>
          </div>
        </div>
      </div>

      <form onSubmit={handlePayment} className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
              Telephone *
            </label>
            <input
              type="number"
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
              Nom *
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
          {processing ? "Traitement en cours..." : `Payer ${total.toFixed(2)} Xaf`}
        </button>
      </form>
    </div>
  )


}
