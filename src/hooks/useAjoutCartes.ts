/**
 * État de l'ajout de plusieurs cartes à la fois.
 *
 * Rôle : pour chaque image choisie (bouton ou glisser-déposer) : vérifier le format, l'optimiser,
 * contrôler ses proportions, proposer un nom, laisser modifier les infos (nom, rareté, variante) puis
 * enregistrer le tout, une carte après l'autre.
 * Expose : Brouillon, ErreurFichier, useAjoutCartes().
 * Dépend de : react, config/cartes, domain/cartes, domain/id, hooks/useCollection (type),
 * services/imageOptimizer, services/erreurs.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EXTENSIONS_IMAGE_ACCEPTEES,
  NOM_CARTE_MAX,
  OPTIMISATION,
  RATIO_CARTE,
  TAILLE_MAX_SOURCE_OCTETS,
  TOLERANCE_RATIO,
  TYPES_IMAGE_ACCEPTES,
  VARIANTES_PAR_RARETE,
} from '../config/cartes';
import {
  fusionnerInfos,
  nomDepuisFichier,
  normaliserInfos,
  typeImageAccepte,
  validerInfos,
  verifierRatio,
  type ErreursInfos,
  type InfosCarte,
  type VerdictRatio,
} from '../domain/cartes';
import { generateId } from '../domain/id';
import { ErreurService, type CodeErreur } from '../services/erreurs';
import { optimiserImage, type ImageOptimisee } from '../services/imageOptimizer';
import type { ActionsAdmin } from './useCollection';

/** Pourquoi une image a été refusée avant même l'enregistrement. */
export type ErreurFichier = 'format' | 'taille' | 'illisible';

/** Une carte en cours d'ajout. */
export interface Brouillon {
  cle: string;
  nomFichier: string;
  /** optimisation → pret → envoi ; `refuse` = fichier inutilisable (à retirer). */
  etat: 'optimisation' | 'pret' | 'envoi' | 'refuse';
  infos: InfosCarte;
  optimisee?: ImageOptimisee;
  /** Adresse temporaire de la miniature, pour l'aperçu. */
  apercuUrl?: string;
  /** Proportions de l'image d'origine. */
  ratio?: VerdictRatio;
  erreurFichier?: ErreurFichier;
  /** Erreurs de saisie (affichées après un essai d'enregistrement). */
  erreurs: ErreursInfos;
  /** Échec de l'envoi au serveur. */
  erreurEnvoi?: CodeErreur;
}

/** Infos de départ d'une carte. */
function infosParDefaut(nomFichier: string): InfosCarte {
  return {
    nom: nomDepuisFichier(nomFichier, NOM_CARTE_MAX),
    rarete: 'commune',
    // Vide = automatique : l'effet de la rareté s'applique (le visuel de la carte reste sans effet).
    effet: '',
    active: true,
  };
}

/** Gère la liste des cartes en cours d'ajout. */
export function useAjoutCartes(admin: ActionsAdmin | null) {
  const [brouillons, setBrouillons] = useState<Brouillon[]>([]);
  const [enregistrement, setEnregistrement] = useState(false);
  const apercus = useRef(new Set<string>());
  const actif = useRef(true);

  // Libère les aperçus à la fermeture ; `actif` empêche de mettre à jour un composant démonté.
  useEffect(() => {
    actif.current = true;
    const urls = apercus.current;
    return () => {
      actif.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const modifier = useCallback((cle: string, changement: Partial<Brouillon>) => {
    setBrouillons((actuels) => actuels.map((b) => (b.cle === cle ? { ...b, ...changement } : b)));
  }, []);

  /** Optimise une image et complète son brouillon. */
  const traiter = useCallback(
    async (cle: string, fichier: File) => {
      try {
        const optimisee = await optimiserImage(fichier, OPTIMISATION);
        if (!actif.current) return;
        const apercuUrl = URL.createObjectURL(optimisee.miniature);
        apercus.current.add(apercuUrl);
        modifier(cle, {
          etat: 'pret',
          optimisee,
          apercuUrl,
          ratio: verifierRatio(
            optimisee.largeurOrigine,
            optimisee.hauteurOrigine,
            RATIO_CARTE,
            TOLERANCE_RATIO,
          ),
        });
      } catch {
        if (actif.current) modifier(cle, { etat: 'refuse', erreurFichier: 'illisible' });
      }
    },
    [modifier],
  );

  /** Ajoute des images choisies ou déposées. */
  const ajouterFichiers = useCallback(
    async (fichiers: readonly File[]) => {
      const nouveaux = fichiers.map((fichier): { brouillon: Brouillon; fichier: File } => {
        const refus: ErreurFichier | null = !typeImageAccepte(
          fichier.type,
          fichier.name,
          TYPES_IMAGE_ACCEPTES,
          EXTENSIONS_IMAGE_ACCEPTEES,
        )
          ? 'format'
          : fichier.size > TAILLE_MAX_SOURCE_OCTETS
            ? 'taille'
            : null;
        const brouillon: Brouillon = {
          cle: generateId(),
          nomFichier: fichier.name,
          etat: refus ? 'refuse' : 'optimisation',
          infos: infosParDefaut(fichier.name),
          erreurs: {},
          ...(refus ? { erreurFichier: refus } : {}),
        };
        return { brouillon, fichier };
      });
      setBrouillons((actuels) => [...actuels, ...nouveaux.map((n) => n.brouillon)]);
      // Une image à la fois : évite de saturer la mémoire d'un téléphone avec de grosses images.
      for (const { brouillon, fichier } of nouveaux) {
        if (brouillon.etat === 'optimisation') await traiter(brouillon.cle, fichier);
      }
    },
    [traiter],
  );

  /** Change le nom, la rareté ou la variante ; la variante suit les règles de la rareté. */
  const changerInfos = useCallback((cle: string, changement: Partial<InfosCarte>) => {
    setBrouillons((actuels) =>
      actuels.map((b) =>
        b.cle === cle
          ? { ...b, infos: fusionnerInfos(b.infos, changement, VARIANTES_PAR_RARETE), erreurs: {} }
          : b,
      ),
    );
  }, []);

  /** Retire une carte de la liste (sans rien enregistrer). */
  const retirer = useCallback((cle: string) => {
    setBrouillons((actuels) => {
      const cible = actuels.find((b) => b.cle === cle);
      if (cible?.apercuUrl) {
        URL.revokeObjectURL(cible.apercuUrl);
        apercus.current.delete(cible.apercuUrl);
      }
      return actuels.filter((b) => b.cle !== cle);
    });
  }, []);

  /**
   * Enregistre toutes les cartes prêtes, une par une. Une carte dont les infos sont incomplètes n'est
   * pas envoyée (ses erreurs s'affichent) ; une carte enregistrée quitte la liste.
   *
   * @returns Le nombre de cartes enregistrées.
   */
  const enregistrer = useCallback(async (): Promise<number> => {
    if (!admin) return 0;
    setEnregistrement(true);
    let reussies = 0;
    for (const brouillon of brouillons.filter((b) => b.etat === 'pret' && b.optimisee)) {
      const optimisee = brouillon.optimisee;
      if (!optimisee) continue;
      const erreurs = validerInfos(brouillon.infos, VARIANTES_PAR_RARETE, NOM_CARTE_MAX);
      if (Object.keys(erreurs).length > 0) {
        modifier(brouillon.cle, { erreurs });
        continue;
      }
      modifier(brouillon.cle, { etat: 'envoi', erreurEnvoi: undefined });
      try {
        await admin.ajouter({
          infos: normaliserInfos(brouillon.infos, VARIANTES_PAR_RARETE),
          largeur: optimisee.largeur,
          hauteur: optimisee.hauteur,
          image: optimisee.image,
          miniature: optimisee.miniature,
        });
        reussies += 1;
        if (actif.current) retirer(brouillon.cle);
      } catch (erreur) {
        const code = erreur instanceof ErreurService ? erreur.code : 'inconnue';
        if (actif.current) modifier(brouillon.cle, { etat: 'pret', erreurEnvoi: code });
        if (code === 'non_autorise' || code === 'non_connecte' || code === 'reseau') break; // inutile d'insister
      }
    }
    if (actif.current) setEnregistrement(false);
    return reussies;
  }, [admin, brouillons, modifier, retirer]);

  return { brouillons, enregistrement, ajouterFichiers, changerInfos, retirer, enregistrer };
}
