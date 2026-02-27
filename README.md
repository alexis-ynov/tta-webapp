# TimeTravel Agency — Webapp Interactive

Webapp immersive pour une agence de voyage temporel fictive de luxe.

**Équipe Projet :**
- CHENEVAS-PAULE Alexis
- LABATE Julien
- RANDO Damien
- RANDO Lucas

## 🌐 URL de déploiement

**https://dal.symoni.fr**

## 🛠️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 15 (export statique) |
| Styling | Tailwind CSS + CSS custom (dark mode) |
| Fonts | Cormorant Garamond, Inter (Google Fonts) |
| Serveur web | Apache 2.4 (Debian) |
| Backend IA | Python 3 CGI (proxy Mistral API) |
| IA Chatbot | Mistral AI — `mistral-small-latest` |

## ✨ Features Implémentées

### Phase 1 — Structure & Design
- **Hero section** : vidéo plein écran (`paris.mp4`), animations d'entrée progressives, CTA vers destinations
- **Section Destinations** : 6 cards interactives avec images, prix, ratings — images et titres cliquables
- **Section Expérience** : présentation des services de l'agence (Chronoshield, guides, itinéraires)
- **Section Quiz** : 4 questions pour recommander la destination idéale (alimenté par Mistral IA)
- **Section Contact** : CTA email + téléphone pour réservation
- **Footer** : navigation complète, destinations, contact

### Phase 2 — Assets & Visuels
- 6 images de destinations IA-générées (Midjourney) dans les cards
- 6 vidéos immersives en background sur les pages de destination
- Lazy loading automatique (Next.js Image optimization)
- Pages détaillées par destination avec vidéo muted plein écran

### Phase 3 — Intelligence Artificielle
- **Chatbot Concierge Temporel** : widget flottant bas-droite, design dark/doré
  - Connecté à l'API Mistral via proxy CGI sécurisé
  - Conversation avec historique, indicateur de frappe animé
  - Personnalité définie : Concierge Temporel expert en histoire
- **Quiz de recommandation** (Ex. 3.2) :
  - 4 questions sur les préférences du voyageur
  - Recommandation personnalisée générée par Mistral IA
  - Résultat avec description contextuelle et lien vers la destination

### Phase 4 — Déploiement
- Déployé sur serveur Apache Debian derrière HAProxy (OPNsense)
- Accessible publiquement sur `https://dal.symoni.fr`
- Clé API Mistral stockée côté serveur (jamais exposée au client)

## 🤖 IA Utilisées

| Usage | Outil/Modèle |
|-------|-------------|
| Génération du code base | Antigravity (Google Deepmind) |
| Chatbot conversationnel | Mistral Small (`mistral-small-latest`) |
| Quiz de recommandation | Mistral Small (`mistral-small-latest`) |
| Visuels destinations | Midjourney + Runway (Projet 1) |

## 📁 Structure du Projet

```
/var/www/html/
├── index.html                  # Landing page (Next.js static export)
├── destinations-links.js       # Injection JS : liens cards + chatbot Mistral
├── destinations/
│   ├── dest.css                # CSS partagé des pages destinations
│   ├── paris.html              # Page immersive Paris 1889
│   ├── cretace.html            # Page immersive Crétacé
│   ├── florence.html           # Page immersive Florence 1504
│   ├── bagdad.html             # Page immersive Bagdad 800
│   ├── japon.html              # Page immersive Japon féodal
│   └── viking.html             # Page immersive Ère Viking
├── images/                     # Visuels IA-générés (Midjourney)
│   └── paris.png, cretace.png, florence.png, bagdad.png, japon.png, vikings.png
└── videos/                     # Vidéos d'ambiance (Runway)
    └── paris.mp4, cretace.mp4, ...

/var/www/cgi-bin/
└── chat.py                     # Proxy Python → API Mistral (clé sécurisée)
```

## 🔐 Architecture Sécurité IA

La clé API Mistral est stockée **uniquement** dans `/var/www/cgi-bin/chat.py`, côté serveur.  
Le frontend appelle `/api/chat` (ScriptAlias Apache → CGI Python), sans jamais exposer la clé.

## 📄 Licence

Projet pédagogique — M1/M2 Digital & IA  
Toutes les destinations et voyages décrits sont fictifs.
