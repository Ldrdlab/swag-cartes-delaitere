/**
 * Composant racine : routeur d'écrans.
 *
 * Rôle : afficher l'écran correspondant à l'état de la machine à états et lui relayer les événements.
 * Expose : le composant `App`.
 * Dépend de : app/useFlow, hooks/useViewportHeight, screens/*.
 */
import { useViewportHeight } from '../hooks/useViewportHeight';
import { BoosterConfirmScreen } from '../screens/BoosterConfirm';
import { BoosterOpeningScreen } from '../screens/BoosterOpening';
import { BoosterSelectScreen } from '../screens/BoosterSelect';
import { CardRevealScreen } from '../screens/CardReveal';
import { ProfileScreen } from '../screens/Profile';
import { WelcomeScreen } from '../screens/Welcome';
import { useFlow } from './useFlow';

/** Composant racine de l'application. */
export function App() {
  useViewportHeight();
  const { state, send } = useFlow();

  switch (state.screen) {
    case 'WELCOME':
      return <WelcomeScreen onStart={() => send({ type: 'START' })} />;
    case 'PROFILE':
      return <ProfileScreen onDone={() => send({ type: 'PROFILE_DONE' })} />;
    case 'BOOSTER_SELECT':
      return (
        <BoosterSelectScreen
          initialIndex={state.selectedBoosterIndex}
          onChoose={(boosterIndex) => send({ type: 'BOOSTER_CHOSEN', boosterIndex })}
        />
      );
    case 'BOOSTER_CONFIRM':
      return (
        <BoosterConfirmScreen
          onOpen={() => send({ type: 'OPEN_CONFIRMED' })}
          onBack={() => send({ type: 'BACK' })}
        />
      );
    case 'BOOSTER_OPENING':
      return <BoosterOpeningScreen onDone={(cards) => send({ type: 'OPENING_DONE', cards })} />;
    case 'CARD_REVEAL':
      return (
        <CardRevealScreen
          cards={state.drawnCards}
          onOpenAnother={() => send({ type: 'OPEN_ANOTHER' })}
          onHome={() => send({ type: 'GO_HOME' })}
        />
      );
  }
}
