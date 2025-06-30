import Link from "next/link"
import type { Product } from "@/lib/supabase"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      {/* Badge promo */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          🎁 1 ACHETÉ = 1 OFFERT
        </div>
      </div>
      
      <div className="aspect-square relative">
        <img src={product.image_url || "/placeholder.svg?height=300&width=300"} alt={product.nom}/>
      </div>
      
      <div className="p-4">
        {/* Section promo principale */}
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

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nom}</h3>
        
        {/* Prix avec économies */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-2xl font-bold text-blue-600">{product.prix} Xaf</p>
            <span className="text-sm text-gray-500 line-through">{product.prix * 2} Xaf</span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            💰 Économisez {product.prix} Xaf avec cette offre !
          </p>
        </div>

        <Link
          href={`/produit/${product.id}`}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-block text-center font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          🛒 Profiter de l&apos;offre
        </Link>
      </div>
    </div>
  )
}