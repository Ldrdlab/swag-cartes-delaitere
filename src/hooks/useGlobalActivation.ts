/**
 * Activation « n'importe où » : touches du clavier (et éventuellement clic/tap sur toute la fenêtre).
 *
 * Rôle : offrir l'alternative clavier d'un geste, sans exiger que le bon bouton ait le focus.
 * Les événements antérieurs au montage du composant sont ignorés : sinon le clic ou la touche qui
 * vient de faire arriver sur l'écran (ex. clic sur « Accueil ») le déclencherait aussitôt.
 * Expose : useGlobalActivation().
 * Dépend de : react.
 */
import { useEffect } from 'react';

interface GlobalActivationOptions {
  /** Appelé à chaque activation. Peut être appelé deux fois de suite (clic + touche) : à rendre idempotent. */
  onActivate: () => void;
  /** Valeurs de `KeyboardEvent.key` qui activent (ex. `['Enter']`). Définir la liste hors du composant. */
  keys: readonly string[];
  /** Si vrai, un clic/tap n'importe où dans la fenêtre active aussi. */
  includeClicks?: boolean;
}

/** Écoute le clavier (et les clics si demandé) tant que le composant est monté. */
export function useGlobalActivation({
  onActivate,
  keys,
  includeClicks = false,
}: GlobalActivationOptions): void {
  useEffect(() => {
    const mountedAt = performance.now();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.timeStamp < mountedAt || !keys.includes(event.key)) return;
      event.preventDefault();
      onActivate();
    };
    const handleClick = (event: MouseEvent) => {
      if (event.timeStamp >= mountedAt) onActivate();
    };

    window.addEventListener('keydown', handleKeyDown);
    if (includeClicks) window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [onActivate, keys, includeClicks]);
}
