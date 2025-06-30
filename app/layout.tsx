import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Link from "next/link"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

export const metadata: Metadata = {
  title: "Glow & Thrive - Produits Santé & Bien-être Naturels | Boutique en Ligne",
  description: "✨ Découvrez notre sélection de produits santé et bien-être naturels : compléments alimentaires, soins bio, vitamines, huiles essentielles. Livraison rapide au Cameroun. Prenez soin de votre corps naturellement avec Glow & Thrive.",
  keywords: "produits santé naturels, bien-être, compléments alimentaires, soins bio, vitamines, huiles essentielles, santé naturelle, boutique santé Cameroun, produits bio, wellness, nutrition, beauté naturelle",
  openGraph: {
    title: "Glow & Thrive - Votre Boutique Santé & Bien-être Naturel",
    description: "Produits santé et bien-être naturels de qualité. Compléments alimentaires, soins bio, vitamines. Livraison au Cameroun.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glow & Thrive - Produits Santé & Bien-être Naturels",
    description: "Découvrez notre gamme de produits santé et bien-être naturels. Qualité garantie, livraison rapide au Cameroun.",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={poppins.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-yellow-600">
                  Glow & thrive
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-gray-700 hover:text-gray-900">
                  Accueil
                </Link>
                {/* <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                  Admin
                </Link> */}
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  )
}