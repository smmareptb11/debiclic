# Fonctionnalité de seuils

Cette fonctionnalité permet :
1. D'afficher des lignes de référence (seuils) sur les graphiques temporels.
2. De colorer dynamiquement les stations sur la carte selon la valeur observée et un mode de logique (`thresholdType`).

Elle est totalement optionnelle : si vous ne fournissez ni `thresholdType` ni `thresholds`, le comportement reste identique à la version sans seuils.

### Détail de la structure `thresholds`

Pour chaque code station, fournissez un tableau d'objets seuils :

```js
thresholds: {
  "F001000101": [
    { label: 'Vigilance', value: 50, color: 'yellow', style: 'dotted', default: true },
    { label: 'Alerte', value: 25, color: 'orange', style: 'dashed', default: true },
    { label: 'Crise', value: 10, color: 'red', style: 'solid', default: true }
  ]
}
```

Champs disponibles pour un seuil :

| Champ     | Type                                        | Obligatoire | Rôle                                                                                   |
|-----------|---------------------------------------------|-------------|----------------------------------------------------------------------------------------|
| `label`   | `string`                                    | Oui         | Nom lisible affiché dans la légende                                                    |
| `value`   | `number`                                    | Oui         | Valeur numérique du seuil (dans l'unité de la grandeur affichée)                       |
| `color`   | `string`                                    | Oui         | Couleur (CSS) de la ligne et potentiellement de la station selon `threshold`           |
| `style`   | `'solid'` \| `'dashed'` \| `'dotted'`       | Non (défaut: `solid`) | Style de ligne dans le graphique                                         |
| `default` | `boolean`                                   | Non (défaut: `true`)      | Affiché initialement (sinon caché jusqu'à clic dans la légende)          |

Les seuils peuvent être fournis dans n'importe quel ordre : la logique interne les trie si nécessaire. Évitez de dupliquer des valeurs identiques avec des couleurs différentes (ambiguïté visuelle).

### Modes de coloration (`thresholdType`)

Le paramètre global `thresholdType` active une coloration contextuelle des stations sur la carte en fonction de la dernière observation disponible :

| Mode        | Logique (valeur mesurée = V)                                                                                                         | Couleur appliquée                       |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|
| `none`      | Aucune logique : on utilise `colors.station`.                                                                                        | Couleur statique                        |
| `flood`     | Cherche le DERNIER seuil dépassé : plus grand seuil dont `value <= V`. Si aucun seuil n'est dépassé, couleur par défaut.             | Couleur du seuil atteint le plus élevé  |
| `low-water` | Cherche le PREMIER seuil encore au-dessus : plus petit seuil dont `value > V`. Si V >= plus haut seuil, couleur par défaut.          | Couleur du prochain seuil critique      |

Notes :
1. Sans entrée `thresholds` pour une station, la couleur reste `colors.station`.
2. Le calcul s'appuie sur la dernière observation (champ `resultat_obs`). Si elle est absente ou invalide, la couleur par défaut est utilisée.
3. Un changement de configuration (stations, grandeur, période) ou un rafraîchissement de données recalculera les couleurs.
4. En mode `low-water`, une valeur strictement supérieure au plus haut seuil conserve la couleur par défaut (même logique pour égalité au plus haut seuil dans l'implémentation actuelle).
5. En mode `flood`, une valeur inférieure au plus bas seuil conserve la couleur par défaut.

Cas limites traités :
* Observation manquante / `null` / NaN → couleur défaut.
* Tableau de seuils vide ou non tableau → couleur défaut.
* Mode inconnu → couleur défaut.

### Affichage des seuils dans le graphique

Chaque seuil est rendu sous forme de ligne horizontale :
* Style selon `style` (solid/dashed/dotted)
* Couleur = `color`
* Légende : `label (value unité)`
* Clic sur la légende : masque / affiche la ligne (élément semi-transparent quand masqué)
* Seuls les seuils avec `default !== false` sont visibles au chargement

### Validation & messages d'erreur

La fonction de validation interne :
* Rejette une valeur de `thresholdType` hors de `none | low-water | flood`.
* N'impose pas la présence de `thresholds` : vous pouvez activer un mode mais sans seuils pour certaines stations (elles resteront en couleur défaut).

Recommandations :
* Harmonisez l'unité implicite des valeurs de `value` avec la `grandeurHydro` choisie.
* Utilisez des couleurs suffisamment contrastées (accessibilité / daltonisme : privilégier aussi des styles de ligne différents).
* Limitez le nombre de seuils (3–5 max) pour éviter la surcharge visuelle.

### Bonnes pratiques de conception

| Objectif | Conseils |
|----------|----------|
| Lisibilité | Styles différents (`solid`, `dashed`, `dotted`) + ordre logique décroissant des valeurs dans la documentation utilisateur |
| Cohérence carte/graphique | Réutilisez la même palette pour lignes et points de station si le sens doit être mémorisable |
| Performance | Fournir seulement les seuils nécessaires : pas d'injection massive de séries inutilisées |
| Maintenance | Centraliser la définition des seuils dans un module si plusieurs widgets partagent la même logique |

### FAQ spécifique

Q: Peut-on mélanger des modes entre widgets ?
R: Oui, chaque appel à `debiclic.init()` peut avoir son propre `thresholdType`.

Q: Puis-je changer dynamiquement les seuils ?
R: Actuellement (version doc), la configuration est lue à l'initialisation. Recréez le widget pour appliquer une nouvelle table de seuils.

Q: Et si deux seuils ont la même valeur ?
R: Le dernier dans l'ordre trié qui correspondra (flood) ou le premier strictement supérieur (low-water) décidera. Évitez ce cas pour ne pas introduire de confusion.

Q: Quelle unité afficher dans la légende ?
R: L'unité provient de la grandeur sélectionnée (ex: m3/s ou m). Assurez-vous que vos `value` sont dans la même unité physique.

### Intégration rapide (récapitulatif minimal)

```html
<script src="https://unpkg.com/debiclic@latest/dist/embed/debiclic.min.js"></script>
<div id="debiclic-widget"></div>
<script>
debiclic.init({
  container: '#debiclic-widget',
  codeStations: ['F001000101'],
  thresholdType: 'flood',
  thresholds: {
    'F001000101': [
      { label: 'Alerte', value: 25, color: 'orange' },
      { label: 'Crise', value: 10, color: 'red' }
    ]
  }
});
</script>
```

### Exemple complet avec seuils

```html
<div id="debiclic-widget"></div>
<script src="https://unpkg.com/debiclic@latest/dist/embed/debiclic.min.js"></script>
<script>
  debiclic.init({
    container: '#debiclic-widget',
    codeStations: ['F001000101', 'F002000101'],
    grandeurHydro: 'QmnJ',
    days: 15,
    thresholdType: 'low-water', // 'none' | 'low-water' | 'flood'
    colors: { station: '#007BFF', graph: '#007BFF' },
    stationsLabels: {
      'F001000101': 'Ma station 1',
      'F002000101': 'Ma station 2'
    },
    thresholds: {
      'F001000101': [
        { label: 'Vigilance', value: 50, color: 'yellow', style: 'dotted', default: true },
        { label: 'Alerte', value: 25, color: 'orange', style: 'dashed', default: true },
        { label: 'Crise', value: 10, color: 'red', style: 'solid', default: true }
      ],
      'F002000101': [
        { label: 'Débit de crue', value: 150, color: 'purple', style: 'solid', default: true }
      ]
    }
  });
</script>
```
