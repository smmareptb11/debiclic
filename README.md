# Débi'Clic

**Débi’Clic** est une bibliothèque JavaScript légère et configurable permettant de visualiser les hauteurs d’eau et les débits des cours d’eau en France. Elle s’appuie sur l’API hydrométrie [Hub’Eau](https://hubeau.eaufrance.fr/) pour offrir une interface interactive intégrable dans toute page web grâce à une simple balise `<script>`.

Développé pour le [SMMAR](https://www.smmar.fr/), cet outil est conçu pour être simple à déployer, performant, responsive, et personnalisable.

---

## 🎯 Objectif

Permettre aux collectivités, acteurs publics ou tout autre site tiers d’intégrer un composant cartographique affichant les données de suivi hydrométrique (hauteurs, débits) en lien avec les mesures de restriction, les seuils de vigilance et l’état des ressources en eau.

---

## 🚀 Fonctionnalités

- 🌍 **Carte interactive** des stations de mesure (Leaflet)
- 📋 **Liste synchronisée** des stations avec survols et clics
- 📈 **Graphiques dynamiques** des 30 derniers jours (uPlot)
- 🧩 **Configuration simple** via `debiclic.init()`
- 🎨 **Personnalisation de l’affichage** : couleurs, unités, noms, tri
- 🖼️ **Support multi-instances** sur une même page
- 📱 **Interface responsive** adaptée aux mobiles et tablettes
- 📤 **Export des graphiques** en PNG
- 🛠️ **Licence open-source AGPL 3.0`

---

## 🔧 Intégration

### 1. Ajouter un conteneur dans la page

```html
<div id="debiclic-widget"></div>
```

### 2. Initialiser le widget avec une configuration JavaScript

```html
<script>
  debiclic.init({
    container: "#debiclic-widget",
    codeStations: ["F001000101", "F002000101"],
    stationsLabels: {
      "F001000101": "Ma station 1",
      "F002000101": "Ma station 2"
    },
    colors: {
      station: "#007BFF",
      selectedStation: "#FF0000",
      Q: "#007BFF",
      H: "#AA336A"
    },
    grandeur: "Q",
    days: 15,
    order: "asc"
  });
</script>
```

### 3. Ajouter le script debiclic.min.js

```html
<script src="https://unpkg.com/debiclic@latest/embed/debiclic.min.js"></script>
```

Ce script injecte dynamiquement une iframe contenant l'application Débi'Clic, puis lui transmet automatiquement la configuration via `postMessage`.

---

## 📘 Documentation complète

- 📄 [Guide d’intégration pas à pas](./docs/integration.md)
- 🧪 [Exemples de configuration](./examples)
- 🧱 [Structure du code source](./src)
- 📚 [Licence AGPL-3.0](./LICENSE)

---

## 🛠️ Développement

```bash
git clone https://github.com/smmar/debiclic.git
cd debiclic
yarn install

# Démarrer l'application en mode développement
yarn dev

# Lancer un build optimisé (iframe + script)
yarn build

# Prévisualiser le build (http://localhost:4173)
yarn preview

# Vérifier le code avec ESLint
yarn lint

# Corriger automatiquement les erreurs ESLint
yarn lint:fix
```

---

![SMMAR](./assets/smmar-logo.png)
