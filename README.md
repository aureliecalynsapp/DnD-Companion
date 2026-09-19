# 🎲 D&D Companion PWA

**D&D Companion PWA** est une application web progressive (PWA) ultra-réactive, tactile et hors-ligne, conçue pour gérer les fiches de personnages D&D 5E en direct autour de la table de jeu.

Elle remplace les fiches papier et les interfaces chargées par une UI sombre *mobile-first*, optimisée pour la manipulation rapide au pouce (points de vie, emplacements de sorts, modificateurs et dés) sans aucun temps de latence ni dépendance serveur.

---

## ✨ Fonctionnalités Principales

- ⚡ **Zero-Latency & Offline-First** : Fonctionnement 100 % local avec mise en cache des assets via Service Workers (PWA). Aucune connexion requise en cours de partie.
- 📱 **Ergonomie Mobile-First & Live Table** :
  - **Onglet Combat** : Gestion dynamique en temps réel (PV actuels/temporaires, modificateurs, dés, suivi des sorts et ressources).
  - **Onglet Fiche** : Consultation synthétique des statistiques, compétences et caractéristiques (`STR (Force)`, `DEX (Dextérité)`, etc.).
  - **Onglet Sorts** : Gestion dynamique en temps réel des sorts préparés et gestion du grimoire de sorts.
  - **Onglet Sac** : Gestion dynamique en temps réel des objets et échange P2P (QRCode).
  - **Onglet Perso** : Gestion des caractéristiques du personnage et partage du personnage entre différents appareils (QRCode).
- 🎛️ **Composants Tactiles Dédiés** : Steppers sur-mesure (`-` / `+`), pavé numérique adapté, sélection automatique de texte au focus et zones de clic généreuses (40x40px min).
- 🧠 **Calculs Automatiques** : Déduction directe des modificateurs de caractéristiques, de la perception passive et des bonus de maîtrise.
- 💾 **Gestion des Données Local-First** :
  - Persistance automatique dans le `localStorage`.
  - Exportation & Importation de fiches sous format **JSON** pour le transfert entre appareils.

---

## 🌐 Données et Référentiel des Sorts

Le référentiel des sorts intègre une base de données ouverte issue d'une API de référence libre de droits (Open Game License / SRD D&D 5E), initialement en anglais, qui a été entièrement structurée, enrichie et traduite en français (`spells_fr.json`) pour garantir une utilisation fluide et totalement autonome hors-ligne au sein de l'application.

---

## 🛠️ Tech Stack

- **Framework Front-End** : [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **State Management & Persistance** : [Zustand](https://zustand-demo.pmnd.rs/) + Middleware `persist` (`localStorage`)
- **PWA & Offline** : [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) (Mode sombre natif `slate-950`)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Architecture du Projet

```text
dnd-companion-pwa/
├── public/
│   └── _redirects              # Configuration des redirections SPA pour Render
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── NumberInput.tsx      # Stepper tactile réutilisable avec contrôles +/-
│   │   ├── BagTab.tsx               # Vue Sac à dos (Pièces et objets)
│   │   ├── CharacterManager.tsx     # Gestion des multi perso
│   │   ├── CombatTab.tsx            # Vue principale de jeu (PV, sorts, actions)
│   │   ├── EditCharacterModal.tsx   # Modale d'édition complète du personnage
│   │   ├── InstallPrompt.tsx        # Installation sur smartphone à la première utilisation
│   │   ├── SettingsTab.tsx          # Vue des paramétrages du perso
│   │   ├── ShareCharacterModal.tsx  # Modale de partage de perso
│   │   ├── SheetTab.tsx             # Vue de consultation (Caractéristiques, JdS, compétences)
│   │   ├── SpellsTab.tsx            # Vue des sorts
│   │   └── TradeModal.tsx           # Modale d'échange P2P
│   ├── constants/
│   │   └── abilities.ts             # Dictionnaire des caractéristiques (Codes, FR, descriptions)
│   ├── data/
│   │   ├── spells_en.json           # Dictionnaire des sorts (anglais)
│   │   └── spells_fr.json           # Dictionnaire des sorts (français)
│   ├── hooks/
│   │   └── useWakeLock.ts           # Empeche l'ecran d'un smartphone de s'éteindre en pleine partie
│   ├── store/
│   │   └── useCharacterStore.ts     # Store Zustand principal (État, calculs, persistance)
│   ├── types/
│   │   └── character.ts             # Interfaces TypeScript de la fiche de personnage
│   ├── utils/
│   │   ├── characterPayload.ts      # Fonctions de partage de perso
│   │   ├── dnd.ts                   # Fonctions pures (calculs de modificateurs)
│   │   └── tradePayload.ts          # Fonctions d'échande P2P
│   ├── App.css                      # Styles globaux & directives Tailwind
│   ├── App.tsx                      # Layout principal et navigation par onglets
│   └── main.tsx                     # Point d'entrée React avec enregistrement PWA
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🚀 Installation & Démarrage Local

Prérequis
- Node.js >= 18.0.0
- npm ou yarn / pnpm

Procédure
- Cloner le dépôt :
git clone [https://github.com/votre-user/dnd-companion-pwa.git](https://github.com/votre-user/dnd-companion-pwa.git)
cd dnd-companion-pwa
- Installer les dépendances :
npm install
- Lancer le serveur de développement :
npm run dev
- L'application sera accessible sur http://localhost:5173.
- Générer le build de production :
npm run build

## 🌐 Déploiement

Le projet est préconfiguré pour un déploiement direct en Static Site sur Render.com.

Build Command = npm run build
Publish Directory = dist
Le fichier public/_redirects gère automatiquement la redirection du routing SPA (/* /index.html 200).

## 📲 Installation en PWA (Mobile & Desktop)
L'application respecte le manifeste PWA :
- Sur iOS (Safari) : Appuyer sur le bouton Partager -> Sur l'écran d'accueil.
- Sur Android (Chrome) : Appuyer sur le menu ⋮ -> Installer l'application.

## 📄 Licence
Ce projet est sous licence MIT.
