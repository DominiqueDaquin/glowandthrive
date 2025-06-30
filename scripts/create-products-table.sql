-- Création de la table produits pour BoutiqueSimple
CREATE TABLE IF NOT EXISTS produits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom TEXT NOT NULL,
  description TEXT NOT NULL,
  prix DECIMAL(10,2) NOT NULL CHECK (prix >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activation de Row Level Security (optionnel pour une boutique publique)
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des produits
CREATE POLICY "Lecture publique des produits" ON produits
  FOR SELECT USING (true);

-- Politique pour permettre toutes les opérations (pour l'admin)
-- En production, vous devriez implémenter une authentification plus robuste
CREATE POLICY "Admin peut tout faire" ON produits
  FOR ALL USING (true);

-- Insertion de quelques produits d'exemple
INSERT INTO produits (nom, description, prix, image_url) VALUES
  (
    'T-shirt Premium',
    'T-shirt en coton bio de haute qualité, confortable et durable. Parfait pour un usage quotidien avec un style décontracté et élégant.',
    29.99,
    '/placeholder.svg?height=300&width=300'
  ),
  (
    'Jean Slim Fit',
    'Jean moderne coupe slim, fabriqué dans un denim de qualité supérieure. Alliant confort et style pour toutes les occasions.',
    79.99,
    '/placeholder.svg?height=300&width=300'
  ),
  (
    'Sneakers Urbaines',
    'Chaussures de sport urbaines au design moderne et épuré. Semelle confortable et matériaux respirants pour un confort optimal.',
    119.99,
    '/placeholder.svg?height=300&width=300'
  ),
  (
    'Veste en Cuir',
    'Veste en cuir véritable, finition soignée et coupe ajustée. Un classique intemporel qui apporte une touche d''élégance à votre garde-robe.',
    199.99,
    '/placeholder.svg?height=300&width=300'
  );
