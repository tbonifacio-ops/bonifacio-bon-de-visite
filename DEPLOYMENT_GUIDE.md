# 🚀 Guide de Déploiement sur Vercel

> Remplacer Netlify par Vercel pour "Bons de Visite"

## Pourquoi Vercel?

- ✅ Gratuit pour PWA statiques
- ✅ Déploiement simple depuis Git
- ✅ CDN global ultra-rapide
- ✅ HTTPS automatique
- ✅ Environnements (preview, production)
- ✅ Analytics intégrés
- ✅ Domaines personnalisés faciles

---

## 📋 Checklist pré-déploiement

- [ ] Tous les fichiers sont prêts (index.html, app.js, sw.js, etc.)
- [ ] `vercel.json` contient la config correcte
- [ ] HTTPS forcé dans vercel.json
- [ ] Service Worker en cache-first
- [ ] GDPR consent implémenté
- [ ] jsPDF chargé via CDN

---

## 🎯 Déploiement en 5 étapes

### Étape 1: Créer un dépôt Git

```bash
# Crée un nouveau dossier
mkdir bonifacio-bons-de-visite
cd bonifacio-bons-de-visite

# Initialise Git
git init

# Ajoute tous les fichiers
git add .

# Premier commit
git commit -m "feat: Initial PWA deployment - Vercel version"

# Crée le dépôt sur GitHub/GitLab/Bitbucket
# (instructions spécifiques à ta plateforme)

# Pousse vers le serveur
git remote add origin https://github.com/TON-USERNAME/bonifacio-bons-de-visite.git
git branch -M main
git push -u origin main
```

### Étape 2: S'inscrire à Vercel

1. Va sur https://vercel.com
2. Clique "Sign Up"
3. Authentifie-toi avec GitHub/GitLab/Bitbucket
4. Autorise Vercel à accéder à tes dépôts

### Étape 3: Importer le projet

1. Dans le dashboard Vercel, clique **"New Project"**
2. Sélectionne **"Import Git Repository"**
3. Recherche et sélectionne `bonifacio-bons-de-visite`
4. Valide

### Étape 4: Configurer le projet

**Nom du projet**:
```
bonifacio-bons-de-visite
```

**Framework Preset**: 
```
→ Sélectionne "Other" (c'est une PWA statique)
```

**Root Directory**:
```
. (racine)
```

**Build Command**:
```
echo 'Static PWA - no build needed'
```

**Output Directory**:
```
. (racine)
```

**Environment Variables**: (optionnel)
```
NEXT_PUBLIC_AGENCY_NAME = Bonifacio & Fils Immobilier
NEXT_PUBLIC_AGENCY_SIREN = 904719879
```

Clique **"Deploy"** ✅

### Étape 5: Teste le déploiement

```bash
# Récupère l'URL générée (ex: bonifacio-bons-de-visite.vercel.app)
# Ouvre dans le navigateur et teste:

✅ Page charge
✅ GDPR screen visible
✅ Signature pad fonctionne
✅ GPS se demande (permission)
✅ PDF génère
✅ Service Worker installe (DevTools → Application → Service Workers)
✅ Mode offline fonctionne (DevTools → Network → Offline)
```

---

## 🌐 Configurer le domaine personnalisé

### Option A: Domaine Vercel gratuit

1. Dashboard Vercel → Ton projet → **Settings** → **Domains**
2. Ajoute: `bons-de-visite.vercel.app`
3. C'est fait! 🎉

### Option B: Ton domaine (bonifaciofils.com)

1. Dashboard Vercel → **Settings** → **Domains**
2. Clique **"Add Custom Domain"**
3. Entre: `bonifaciofils.com` (ou `bons-de-visite.bonifaciofils.com`)
4. Vercel te propose:
   - **Nameserver** (plus facile)
   - **CNAME** (si tu gères le DNS toi-même)

#### Si tu utilises Nameservers:
1. Copie les 4 nameservers Vercel
2. Va chez ton registrar (OVH, Hostinger, etc.)
3. Change les nameservers vers les Vercel
4. Attends 24-48h (propagation DNS)
5. C'est bon! 🎉

#### Si tu utilises CNAME:
1. Va chez ton registrar
2. Crée un enregistrement CNAME:
   - **Name**: `bons-de-visite`
   - **Value**: `cname.vercel.app` (fourni par Vercel)
3. Attends propagation
4. C'est bon! 🎉

---

## 🔄 Mises à jour & Redéploiement

Après chaque changement:

```bash
git add .
git commit -m "feat: [description]"
git push origin main
```

**Vercel redéploie automatiquement!** ⚡

---

## 📊 Monitoring & Analytics

### Dans Vercel Dashboard

1. **Analytics** → Voir le trafic en temps réel
2. **Deployments** → Historique des déploiements
3. **Logs** → Erreurs et warnings
4. **Performance** → Vitesse de chargement

---

## 🆘 Dépannage

### Problème: "Error: Deployment Failed"

**Solution**:
- Vérifie que tous les fichiers sont commitées (`git status`)
- Vérifie que `index.html` est à la racine
- Regarde les logs Vercel (Dashboard → Deployments → Click deploy)

### Problème: "Service Worker ne s'enregistre pas"

**Solution**:
- Vérifie que le site est en HTTPS (Vercel le fait auto)
- Vérifie que `sw.js` est accessible (teste dans DevTools)
- Vide le cache: `cmd+shift+delete` (Chrome)

### Problème: "jsPDF not defined"

**Solution**:
- Vérifie que https://cdn.jsdelivr.net n'est pas bloqué
- Teste la connexion internet
- Rafraîchis la page (F5)

### Problème: "Domaine personnalisé ne marche pas"

**Solution**:
- Attends 24-48h pour la propagation DNS
- Utilise https://dnschecker.org pour vérifier
- Vérife que le domaine dans Vercel pointe vers le bon projet

---

## 📈 Optimisations futures

```javascript
// Dans app.js, tu peux ajouter:

// Analytics
if (window.gtag) {
    window.gtag('event', 'pdf_generated', {
        property: address,
        visitor: visitorName
    });
}

// Monitoring d'erreurs
if (window.Sentry) {
    Sentry.captureException(error);
}
```

---

## ✅ Checklist de validation finale

- [ ] App accessible sur vercel.app
- [ ] Domaine personnalisé configuré
- [ ] HTTPS forcé
- [ ] Service Worker actif
- [ ] Mode offline marche
- [ ] PDF génère correctement
- [ ] GDPR consent visible
- [ ] Signature pad fonctionne
- [ ] GPS fonctionne
- [ ] Historique sauvegarde
- [ ] Logo visible et centré
- [ ] Design premium intact
- [ ] Performance OK (< 2s chargement)

---

## 🚨 Support

Si problème:
1. Consulte https://vercel.com/docs
2. Regarde les logs Vercel Dashboard
3. Teste en DevTools (F12)
4. Contacte support Vercel (vercel.com/support)

---

**Bonne chance! 🎉**

Ton app sera en production en moins de 5 minutes! ⚡
