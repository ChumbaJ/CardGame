import { GameStateInterface } from "../../server/src/models/gameMaster";

export interface ServerToClientEvents {
    roomCreated: (roomData: Record<string, string[]>) => void;
    roomJoined: (roomData: Record<string, string[]>) => void;
    userLeft: (roomData: Record<string, string[]>) => void;
    gameStarted: () => void;
    tableUpdate: (gameState: GameStateInterface) => void;
}

export interface ClientToServerEvents {
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    startGame: (roomData: Record<string, string[]>) => void;
    nextTurn: (gameMasterId: string) => void;
    playCards: (gameMasterId: string, cards: Array<[number, number]>) => void;
    defendCard: (gameMasterId: string, selectedCard: number, stackId: number) => void;
    cheat: (gameMasterId: string, playerId: string) => void;
}