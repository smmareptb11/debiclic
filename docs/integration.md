# Guide d'intégration Débi'Clic

Ce guide vous explique pas à pas comment intégrer le widget Débi'Clic dans votre site web à l'aide du script `debiclic.min.js` et de l'initialisation via `debiclic.init()`.

---

## 📦 Prérequis

- Un site HTML où intégrer le widget (aucune dépendance requise)
- Un ou plusieurs identifiants de stations compatibles avec l’API Hub’Eau

---

## 🧩 Étape 1 – Ajouter un conteneur HTML

Créez un élément dans lequel le widget sera injecté :

```html
<div id="debiclic-widget"></div>
```

Vous pouvez ajouter autant de conteneurs que nécessaire pour afficher plusieurs widgets sur une même page.

---

## 🔧 Étape 2 – Charger le script Débi'Clic

Ajoutez le script CDN à la fin de votre `<body>` :

```html
<script src="https://unpkg.com/debiclic@latest/dist/embed/debiclic.min.js"></script>
```

Cela exposera la fonction globale `debiclic.init()`.

---

## ⚙️ Étape 3 – Initialiser un widget

Appelez `debiclic.init()` avec vos paramètres personnalisés :

```html
<script>
  debiclic.init({
    container: "#debiclic-widget",
    codeStations: ["F001000101"],
    stationsLabels: {
      F001000101: "Station personnalisée"
    },
    colors: {
      station: "#cccccc",
      graph: "#007BFF"
    },
    grandeurHydro: "Q",
    days: 15,
    sort: "asc",
    width: "100%",
    height: 600,
    showMap: true
  });
</script>
```


---

## 📚 Paramètres disponibles (avec valeurs par défaut)

| Paramètre         | Type                        | Description                                                                                                                                 | Valeur par défaut |
|-------------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| `container`       | `string` \| `HTMLElement`                          | Sélecteur CSS ou élément DOM cible                                                                                   | *(obligatoire)*   |
| `width`           | `string` \| `number`                               | Largeur de l’iframe intégrée                                                                                         | `100%`            |
| `height`          | `string` \| `number`                               | Hauteur de l’iframe intégrée                                                                                         | `100%`            |
| `codeStations`    | `string[]`                                         | Liste des codes stations à afficher                                                                                  | *(obligatoire)*   |
| `stationsLabels`  | `Record<string, string>`                           | Libellés personnalisés par code station                                                                              | `{}`              |
| `colors`          | `Record<string, string>`                           | Couleurs : `station`, `graph`                                                                                        | `{station: '#007BFF', graph: '#007BFF'}` |
| `grandeurHydro`   | `'QmnJ'` \|`'Q'` \| `'H'`                          | Type de mesure à afficher (`QmnJ` pour débit moyen journalier, `Q` pour débit, `H` pour hauteur)                     | `'Q'`             |
| `days`            | `number` (1–30)                                    | Nombre de jours à visible dans le graphique                                                                          | `30`              |
| `sort`            | `'asc'` \| `'desc'` \| `'default'` *(optionnel)*  | Ordre de tri des stations dans la liste                                                                               | `'default'`       |
| `showMap`         | `boolean`                                          | Affiche ou masque la carte                                                                                           | `true`            |
| `mapWidth`        | `string` *(optionnel)*                             | Largeur de la carte en pourcentage ou pixels                                                                         | `50%`             |
| `src`             | `string` *(optionnel)*                             | URL personnalisée vers `index.html` si besoin                                                                        | automatique       |

---

## 🧪 Exemples

- 📄 [Exemple basique](https://smmareptb11.github.io/debiclic/basic.html)
- 📄 [Exemple multi-instance](https://smmareptb11.github.io/debiclic/multi-instance.html)
- 📄 [Exemple configurateur](https://smmareptb11.github.io/debiclic/custom-config.html)
- 📄 [Exemple sans carte](https://smmareptb11.github.io/debiclic/no-map.html)
- 📄 [Exemple avec plusieurs stations](https://smmareptb11.github.io/debiclic/stations.html)
- 📄 [Exemple de chargement dynamique](https://smmareptb11.github.io/debiclic/dynamic-loading.html)

---

## ❓ Questions fréquentes

### Peut-on intégrer plusieurs widgets sur une même page ?
Oui, chaque appel à `debiclic.init()` instancie un widget indépendant.

### Où trouver les codes stations ?
Sur [Hub’Eau](https://hubeau.eaufrance.fr/page/api-hydrometrie#/) ou via l'API `/hydrometrie/referentiel/stations`

---

Bonne intégration !
