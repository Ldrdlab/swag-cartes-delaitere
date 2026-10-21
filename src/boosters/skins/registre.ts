/**
 * Registre des skins : associe le NOM d'une skin à son composant.
 *
 * Rôle : BoosterVisuel lit le nom de skin d'un booster (dans le catalogue) et retrouve ici le composant
 * qui sait le dessiner.
 * Pour ajouter une skin : créer son dossier dans `skins/`, ajouter son nom dans `NomSkin`
 * (skins/types.ts), puis ajouter une ligne ci-dessous.
 * Expose : SKINS.
 * Dépend de : react (type), boosters/skins/* .
 */
import type { ComponentType } from 'react';
import { SkinExempleUltra } from './exemple-ultra';
import { SkinImage } from './image';
import { SkinStandard } from './standard';
import type { NomSkin, PropsSkin } from './types';

export const SKINS: Record<NomSkin, ComponentType<PropsSkin>> = {
  standard: SkinStandard,
  image: SkinImage,
  'exemple-ultra': SkinExempleUltra,
};
