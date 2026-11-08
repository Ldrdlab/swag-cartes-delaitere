# Crédits des effets de cartes

Les effets visuels des cartes (`src/effects/`) sont adaptés de l'outil de création de cartes du même
auteur (« Visuel carte - V1 »). Ils sont **originaux** : dégradés CSS, modes de fusion, SVG générés et un
nuanceur WebGL écrits pour ce projet. **Aucune image ni texture externe** n'est reprise, et aucun code
de tiers n'est copié. Les sources ci-dessous n'ont fourni qu'un **principe**, réécrit.

| Effet (clé)                 | Source d'inspiration                                                                        | Licence        | Principe repris                                         |
| --------------------------- | ------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------- |
| Lustre (`lustre`)           | [codeweb-dev/holo-card](https://github.com/codeweb-dev/holo-card)                           | MIT            | Position du reflet écrite dans des variables CSS        |
| Holo (`holo`)               | Effet holographique classique (bandes arc-en-ciel + reflet), écrit pour l'outil de création | original       | —                                                       |
| Prisme (`prisme`)           | [21st.dev — Holo Card](https://21st.dev/@kedhareswer/components/holo-card)                  | MIT            | Teinte selon l'angle de vue (diffraction)               |
| Arc-en-ciel (`arc_en_ciel`) | [21st.dev — Iridescent Foil](https://21st.dev/@dqnamo/components/iridescent-foil.md)        | à vérifier     | Structure en couches (idée seulement, rien de copié)    |
| Feu (`feu`)                 | [neungkl/fire-simulation](https://github.com/neungkl/fire-simulation)                       | MIT            | Couleur de la flamme selon sa profondeur (idée)         |
| Bronze, Argent, Or          | [21st.dev — Liquid Chrome](https://21st.dev/@ham7a311/components/liquid-chrome.md)          | MIT            | Reflet d'un « studio » lumineux qui glisse avec l'angle |
| Argent, Or                  | [O'Brien Media — doré brossé en CSS](https://obrienmedia.co.uk/?p=212092)                   | article        | Doré en trois couches (idée)                            |
| Textures aléatoires         | mulberry32 (Tommy Ettinger)                                                                 | domaine public | Générateur pseudo-aléatoire à graine fixe               |

**Écarté** : `simeydotme/pokemon-cards-css` (GPL-3.0, textures de tiers) : rien n'en est copié.

Ce fichier est à compléter quand un effet est ajouté (voir l'en-tête de `src/effects/index.ts`).
