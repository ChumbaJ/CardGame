export interface GameStateInterface {
    id: string;
    deck: number[];
    discardedPile: number[];
    playersCards: Map<string, number[]>;
    winner: null | number;
    players: string[];
    table: Array<number[]>;
    currentPlayerId: number;
    defenderPlayerId: number;
    mode: 'attack' | 'defend';
}

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function fillDeck(): DeckType[] {
    const values: DeckType[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14];
    return values.flatMap((value) => Array(3).fill(value));
}

type DeckType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12 | 13 | 14;

export interface IGameMaster {
    id: string;
    players: string[];
    roomId: string;
    deck: number[];
    discardedPile: number[];
    table: Array<number[]>;
    playersCards: Map<string, number[]>;
    currentPlayerId: number;
    defenderPlayerId: number;
    mode: 'attack' | 'defend';
    winner: null | number;

    giveCards(players: string[], amount: number): void;
    evaluateTurn(): void;
    nextTurn(): void;
    updateTable(): GameStateInterface;
    playCards(playerId: string, cards: Map<number, number>): void;
    defendCard(playerId: string, selectedCardId: number, stackId: number): void;
}

export class GameMaster implements IGameMaster {
    id = crypto.randomUUID();
    players: string[] = [];
    roomId: string = '';
    deck: number[] = [];
    discardedPile: number[] = [];
    table: Array<number[]> = [];
    playersCards: Map<string, number[]> = new Map();
    currentPlayerId: number = 0;
    defenderPlayerId: number = 1;
    mode: 'attack' | 'defend' = 'attack';
    winner: number | null = null;

    constructor(roomId: string, players: string[]) {
        this.players = players;
        this.roomId = roomId;
        this.deck = shuffleArray(fillDeck());
        for (const player of players) {
            this.playersCards.set(player, []);
        }
    }

    giveCards(players: string[], amount: number): void {
        if (!this.deck.length) return;

        for (const player of players) {
            const playerHands = this.playersCards.get(player);

            if (!playerHands)
                throw new Error('Cannot find player, invalid player_id or doesnt exist');

            for (let i = 0; i < amount; i++) {
                const card = this.deck.pop();
                if (!card) break;

                playerHands.push(card);
                this.discardedPile.push(card);
            }
        }
    }

    evaluateTurn(): boolean {
        for (const [playerId, playerCards] of this.playersCards) {
            if (playerCards.length >= 4) continue;

            const lack = 4 - playerCards.length;

            this.giveCards([playerId], lack);
        }

        const unbeatenCardsCount = this.table.reduce((sum, stack) => {
            if (stack.length === 1) sum++;
            return sum;
        }, 0);

        this.giveCards([this.players[this.defenderPlayerId]], unbeatenCardsCount);

        const attacker = this.players[this.currentPlayerId];
        const defender = this.players[this.defenderPlayerId];

        if (this.deck.length === 0) {
            if (this.playersCards.get(attacker)!.length === 0) {
                this.winner = this.currentPlayerId;
            }

            if (this.playersCards.get(defender)!.length === 0) {
                this.winner = this.defenderPlayerId;
            }
        }

        for (const [playerId, playerHand] of this.playersCards) {
            const cardCounts = playerHand.reduce((acc, card) => {
                acc[card] = (acc[card] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const hasThree = Object.values(cardCounts).some((cards) => cards >= 3);

            if (hasThree) {

                const currentPlayerId = this.players.findIndex((id) => id === playerId);
                this.currentPlayerId = currentPlayerId;

                this.defenderPlayerId = (currentPlayerId + 1) % this.players.length;

                if (this.defenderPlayerId === 0 && this.currentPlayerId !== 0) {
                    this.defenderPlayerId = 0;
                }

                this.mode = 'attack';
                this.table = [];

                return true;
            }
        }
        return false;
    }

    nextTurn(): void {
        const playersLength = this.players.length - 1;

        if (this.mode === 'attack') {
            this.mode = 'defend';
            return;
        }

        const isBonusTurn = this.evaluateTurn();

        if (isBonusTurn) return;

        if (this.currentPlayerId % playersLength === 0 && this.currentPlayerId !== 0) {
            this.currentPlayerId = 0;
        } else {
            this.currentPlayerId++;
        }

        if (this.defenderPlayerId % playersLength === 0 && this.currentPlayerId !== 0) {
            this.defenderPlayerId = 0;
        } else {
            this.defenderPlayerId++;
        }

        this.mode = 'attack';
        this.table = [];
    }

    updateTable(): GameStateInterface {
        return {
            ...this,
            playersCards: Array.from(this.playersCards),
            table: Array.from(this.table),
        };
    }

    playCards(playerId: string, cards: Map<number, number>): void {
        this.table = [...this.table, ...Array.from(cards.values()).map((cardValue) => [cardValue])];

        const playerHand = this.playersCards.get(playerId)!;

        const tableCardIds = Array.from(cards.keys());

        const filteredHand = playerHand.filter((_, id) => !tableCardIds.includes(id));

        this.playersCards.set(playerId, filteredHand);
    }

    defendCard(playerId: string, selectedCardId: number, stackId: number): void {
        if (this.table[stackId].length > 1) return;

        const playerHands = this.playersCards.get(playerId)!;
        const cardToPut = playerHands[selectedCardId];

        if (cardToPut >= this.table[stackId][0]) return;

        this.table[stackId].push(cardToPut);

        const filteredHand = playerHands.filter((_, id) => id !== selectedCardId);
        this.playersCards.set(playerId, filteredHand);
    }
}
