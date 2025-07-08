"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, type Product } from "@/lib/supabase"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

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

  function handlePurchase() {
    if (product) {
      router.push(`/paiement?produit=${product.id}&quantite=${quantity}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => router.back()} className="mb-6 text-blue-600 hover:text-blue-800 flex items-center">
        ← Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
          {/* <Image
            src={product.image_url || "/placeholder.svg?height=500&width=500"}
            alt={product.nom}
            fill
            className="object-cover"
          /> */}
          <img src={product.image_url || "/placeholder.svg?height=300&width=300"} alt={product.nom} />

        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.nom}</h1>
            <p className="text-4xl font-bold text-blue-600 mb-6">{product.prix} XAF</p>
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-orange-400 p-3 mb-3 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-orange-800">
                    OFFRE SPÉCIALE !
                  </p>
                  <p className="text-xs text-orange-700">
                    Achetez-en 1, recevez le 2ème GRATUIT
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>


          <div className="space-y-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePurchase}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Passer à l&apos;achat - {(product.prix * quantity).toFixed(2)} XAF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
