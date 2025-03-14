import { GameMaster, IGameMaster } from "./gameMaster";

interface IGameManager {
    games: Map<string, IGameMaster>;

    createGame(roomId: string, players: string[]): IGameMaster;
    findGame(gameMasterId: string): IGameMaster | null;
}

class GameManager implements IGameManager {
    games = new Map<string, IGameMaster>();

    createGame(roomId: string, players: string[]): IGameMaster {
        const gameMaster = new GameMaster(roomId, players);
        this.games.set(gameMaster.id, gameMaster);

        return gameMaster;
    }

    findGame(gameMasterId: string): IGameMaster | null {
        if (this.games.has(gameMasterId)) {
            return this.games.get(gameMasterId)!
        } else {
            return null;
        }
    }
}

export default new GameManager();