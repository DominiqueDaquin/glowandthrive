import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const csvFileName = 'contacts.csv';
    const csvPath = path.join(process.cwd(), csvFileName);
    
    // En-têtes du CSV
    const headers = [
      'Date',
      'Nom',
      'Téléphone',
      'Email',
      'Adresse',
      'Produit',
      'Quantité',
      'Prix Unitaire',
      'Total'
    ];

    // Ligne de données
    const row = [
      new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR'),
      `"${data.nom}"`,
      `"${data.phone}"`,
      `"${data.email}"`,
      `"${data.adresse}"`,
      `"${data.produit}"`,
      data.quantite,
      data.prixUnitaire,
      data.total
    ];

    // Vérifier si le fichier existe
    if (!fs.existsSync(csvPath)) {
      // Créer le fichier avec les en-têtes
      fs.writeFileSync(csvPath, headers.join(',') + '\n');
      console.log('Fichier contacts.csv créé avec succès');
    }
    
    // Ajouter la nouvelle ligne au fichier existant
    fs.appendFileSync(csvPath, row.join(',') + '\n');
    
    return NextResponse.json({ success: true, message: 'Données sauvegardées avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde CSV:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}