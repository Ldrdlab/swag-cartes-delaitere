/**
 * Nouvelle version disponible (bandeau).
 *
 * Rôle : lire l'état de la mémoire app/miseAJour (une nouvelle version est-elle prête ? le joueur a-t-il
 * reporté ?) et, quand le bandeau s'affiche, aller chercher les nouveautés dans `version.json` (publié avec
 * la nouvelle version, donc connu même de l'ancienne appli). Sans réseau ou sans fichier : pas de notes.
 * Expose : useMiseAJour().
 * Dépend de : react, app/miseAJour, config/miseAJour, domain/changelog.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { storeMiseAJour } from '../app/miseAJour';
import { MISE_AJOUR } from '../config/miseAJour';
import { lireInfosVersion, type InfosVersionPubliee } from '../domain/changelog';

/** Suit les mises à jour. */
export function useMiseAJour() {
  const etat = useSyncExternalStore(storeMiseAJour.abonner, storeMiseAJour.lire);
  const [infos, setInfos] = useState<InfosVersionPubliee | null>(null);
  const visible = etat.disponible && !etat.reportee;

  // Lit les nouveautés de la version en ligne au moment où le bandeau apparaît.
  useEffect(() => {
    if (!etat.disponible) return;
    let annule = false;
    fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
      .then((reponse) => (reponse.ok ? reponse.json() : null))
      .then((json: unknown) => {
        if (!annule) setInfos(lireInfosVersion(json));
      })
      .catch(() => undefined);
    return () => {
      annule = true;
    };
  }, [etat.disponible]);

  return {
    visible,
    version: infos?.version ?? null,
    notes: (infos?.notes ?? []).slice(0, MISE_AJOUR.notesMax),
    reporter: storeMiseAJour.reporter,
  };
}
