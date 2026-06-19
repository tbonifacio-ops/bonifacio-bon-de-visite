# Bons de Visite - Bonifacio & Fils Immobilier

Progressive Web App (PWA) pour générer des certificats de visite signés lors de visites clients.

## 🎯 Caractéristiques

✅ **Progressive Web App (PWA)** - Installable sur mobile et desktop
✅ **Mode hors ligne** - Fonctionne sans connexion internet
✅ **Géolocalisation GPS** - Enregistre les coordonnées précises
✅ **Signature tactile** - Pad de signature intégré
✅ **Génération PDF** - Documents signés et certifiés
✅ **Stockage local** - Historique sauvegardé sur le téléphone
✅ **Conformité GDPR/CNIL** - Consentement et rétention 24 mois
✅ **Design premium** - Branding Bonifacio & Fils avec Cormorant Garamond

## 📋 Stack Technique

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **PDFs**: jsPDF 2.5.1
- **Service Worker**: Cache-first + Network fallback
- **Storage**: LocalStorage (24 mois de rétention)
- **Hosting**: Vercel (Static PWA)
- **Security**: CSP, HSTS, X-Frame-Options, HTTPS obligatoire

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte GitHub, GitLab ou Bitbucket
- Compte Vercel gratuit (https://vercel.com)

### Étapes

#### 1️⃣ Préparer le dépôt Git

```bash
# Clone ou crée un nouveau dépôt
git init
git add .
git commit -m "Initial commit: Bons de Visite PWA for Vercel"
git remote add origin https://github.com/votre-org/bonifacio-bons-de-visite.git
git push -u origin main
```

#### 2️⃣ Importer dans Vercel

1. Accède à https://vercel.com
2. Clique sur "New Project"
3. Sélectionne ton dépôt Git (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Project Name**: `bonifacio-bons-de-visite`
   - **Framework**: `Other` (Static PWA)
   - **Root Directory**: `.`
   - **Build Command**: `echo 'Static PWA - no build needed'`
   - **Output Directory**: `.`
5. Clique "Deploy"

#### 3️⃣ Configuration Vercel

Vercel lira automatiquement `vercel.json` pour:
- ✅ Headers de sécurité (CSP, HSTS)
- ✅ Redirects PWA (tout → index.html)
- ✅ Variables d'environnement

#### 4️⃣ Test du déploiement

```bash
# Après le déploiement, teste:
curl -I https://ton-domaine.vercel.app
# Vérifie les headers de sécurité

# Test offline
# 1. Ouvre l'app en navigateur
# 2. Coupe la connexion internet (DevTools → Network → Offline)
# 3. Rafraîchis la page → doit marcher sans connexion
```

#### 5️⃣ Domaine personnalisé

1. Dans Vercel Dashboard → Settings → Domains
2. Ajoute `bonifaciofils.com` (ou ton domaine)
3. Configure ton DNS (CNAME ou A record)

### Variables d'environnement (optionnel)

Dans `vercel.json`, ajoute si besoin:

```json
{
  "env": {
    "NEXT_PUBLIC_AGENCY_NAME": "Bonifacio & Fils Immobilier",
    "NEXT_PUBLIC_AGENCY_SIREN": "904719879"
  }
}
```

## 🏃 Démarrage local

### Option 1: Python (recommandée)
```bash
python3 -m http.server 3000
# Accède à http://localhost:3000
```

### Option 2: Node.js
```bash
npx http-server -p 3000 -c-1
```

### Option 3: Live Server (VS Code)
1. Install extension "Live Server" dans VS Code
2. Clic droit → "Open with Live Server"

## 📱 Installation sur mobile

### iOS (iPhone/iPad)
1. Ouvre l'app dans Safari
2. Clic menu (en bas à droite) → "Ajouter à l'écran d'accueil"
3. Valide le nom et ajoute
4. L'app est installée! 🎉

### Android (Chrome)
1. Ouvre l'app dans Chrome
2. Menu (3 points) → "Installer l'app"
3. Valide l'installation
4. L'app est installée! 🎉

## 🔐 Sécurité

### Headers activés
- ✅ **Content-Security-Policy** - Prévient XSS
- ✅ **Strict-Transport-Security (HSTS)** - Force HTTPS (1 an)
- ✅ **X-Frame-Options: DENY** - Bloque les frames
- ✅ **X-Content-Type-Options: nosniff** - Prévient MIME-sniffing
- ✅ **Referrer-Policy** - Strict
- ✅ **Permissions-Policy** - Géoloc seulement

### RGPD/CNIL
- ✅ Écran de consentement au premier lancement
- ✅ Signature requiert consentement GDPR
- ✅ Base légale: Article 6.1.b (exécution contrat)
- ✅ Purge automatique après 24 mois
- ✅ Données locales = aucune transmission
- ✅ Mention GDPR sur chaque PDF

## 📄 Fichiers

```
.
├── index.html           # Page principale HTML
├── app.js              # Logique complète de l'app
├── sw.js               # Service Worker (offline)
├── manifest.json       # Config PWA
├── vercel.json         # Config Vercel (headers, redirects)
├── robots.txt          # Bloque indexation
├── package.json        # Dépendances
└── README.md          # Ce fichier
```

## 🎨 Design & Branding

- **Font**: Cormorant Garamond (serif premium)
- **Couleur primaire**: Ivoire/Crème `#F8F5F0`
- **Couleur accent**: Or `#A8895B`
- **Couleur secondaire**: Or clair `#D4AF9E`

## 🐛 Troubleshooting

### "Service Worker doesn't register"
- Vérifier que l'app est servie en HTTPS
- Vérifier que `sw.js` est accessible

### "jsPDF not loading"
- Vérifier la connexion internet (pour CDN)
- Vérifier que `https://cdn.jsdelivr.net` n'est pas bloqué

### "GPS ne fonctionne pas"
- Vérifier les permissions du navigateur
- Vérifier la connexion HTTPS
- Essayer d'actualiser la page

### "Signature ne s'enregistre pas"
- Vérifier que le consentement GDPR est accepté
- Vérifier que le canvas n'est pas disabled

## 📞 Support

**SIREN**: 904 719 879  
**RCS Créteil**: B 904 719 879  
**CPI**: 9401 2022 000 000 038  
**RCP**: Verspieren Immobilier  
**TVA**: FR30904719879

## 📝 Licence

PROPRIETARY - Réservé à Bonifacio & Fils Immobilier

---

**Développé avec ❤️ pour l'immobilier premium**
