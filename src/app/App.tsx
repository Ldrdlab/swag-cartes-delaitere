/**
 * Composant racine : routeur d'écrans.
 *
 * Rôle : afficher l'écran correspondant à l'état de la machine à états et lui relayer les événements.
 * Expose : le composant `App`.
 * Dépend de : app/useFlow, boosters/catalogue, config/game, data/cards, domain/drawCards,
 * hooks/useViewportHeight, screens/*.
 */
import { getBoosterAt, versBoosterTirage } from '../boosters/catalogue';
import { CARDS_PER_BOOSTER, RARITY_WEIGHTS } from '../config/game';
import { CARDS } from '../data/cards';
import { drawCards } from '../domain/drawCards';
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
          booster={getBoosterAt(state.selectedBoosterIndex)}
          onOpen={() => send({ type: 'OPEN_CONFIRMED' })}
          onBack={() => send({ type: 'BACK' })}
        />
      );
    case 'BOOSTER_OPENING': {
      const booster = getBoosterAt(state.selectedBoosterIndex);
      return (
        <BoosterOpeningScreen
          booster={booster}
          // Le tirage a lieu au moment où le booster est réellement ouvert.
          onOpened={() =>
            send({
              type: 'OPENING_DONE',
              cards: drawCards(
                versBoosterTirage(booster),
                CARDS,
                CARDS_PER_BOOSTER,
                RARITY_WEIGHTS,
              ),
            })
          }
        />
      );
    }
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
