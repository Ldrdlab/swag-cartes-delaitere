# Journal des modifications

Les nouveautés de chaque version de SWAG, en français simple. Ce fichier sert de notes de mise à jour :
ses points s'affichent aux joueurs quand une nouvelle version est disponible.

**Comment le tenir à jour :** à chaque modification qui change quelque chose pour les joueurs, ajoute un
point (une ligne qui commence par `- `) sous « Non publié ». La commande `npm run publier` range ensuite
ces points sous le numéro de la nouvelle version.

## Non publié

- Les cartes brillent maintenant selon leur rareté : un reflet doux pour les Peu communes, un effet holographique pour les Rares, des couleurs qui changent avec l'angle pour les Super rares, un arc-en-ciel pour les Légendaires, des flammes pour les Mythiques Feu, du métal pour les Mythiques Bronze et les Secrètes Argent et Or.
- Quand tu ouvres une carte en grand, ou quand elle se retourne à l'ouverture d'un booster, l'effet suit ta souris, l'inclinaison de ton téléphone ou ton doigt.
- Un petit éclat de lumière accompagne la révélation des cartes Légendaires et au-dessus.
- Dans la collection, les cartes restent calmes (sans animation) pour que l'appli reste fluide.
- Nouvelle case « Effets réduits » dans le profil : cartes plus simples et sans animation, utile si ton téléphone chauffe ou rame.
- Espace administrateur : onglet « Effets » pour choisir l'effet de chaque rareté, effet au choix pour une carte précise, et filtre « Effet » dans la liste des cartes.

## [0.1.0] - 2026-11-08

### Nouveautés

- Connexion avec un compte (les amis sont invités par l'administrateur) et choix d'un pseudo et d'un avatar.
- Ouverture de boosters : 3 par jour, remis à zéro chaque jour à minuit (heure de Paris).
- Révélation des cartes une par une, avec le badge « Nouvelle ! » sur les cartes jamais obtenues.
- Collection : toutes les cartes du jeu, emplacements vides grisés, quantités, progression et filtre par rareté.
- Onglet « Jouer » (bientôt disponible) et page « Installer l'appli » pour Android, iPhone et ordinateur.
- Espace administrateur : ajout de cartes, réglage des boosters, liste des joueurs, version minimum requise.
- L'appli s'installe sur le téléphone ou l'ordinateur et propose les mises à jour.
- Un ami invité par e-mail choisit son mot de passe en arrivant ; « Mot de passe oublié ? » envoie un lien pour en choisir un nouveau.
