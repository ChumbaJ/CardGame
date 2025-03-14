import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ClientToServerEvents, ServerToClientEvents } from '../../../../../shared/types/events';
import { io, Socket } from 'socket.io-client';

export interface GameStateInterface {
    id: string;
    deck: number[];
    discardedPile: number[];
    table: Array<number[]>
    playersCards: Map<string, number[]>;
    players: string[];
    currentPlayerId: number;
    defenderPlayerId: number;
    winner: number | null;
    mode: 'attack' | 'defend';
}

export interface IConnectionData {
    roomId: string;
    roomUsers: string[];
    myQueueId: number;
    gameState: GameStateInterface;
}

interface SocketContextType {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    data: IConnectionData;
    dispatch: React.Dispatch<Action>;
}

class ConnectionData implements IConnectionData {
    private _roomId: string = '';
    private _roomUsers: string[] = [];
    myQueueId: number = 0;
    private _gameMasterId: string = '';
    private _gameState: GameStateInterface = {} as GameStateInterface;

    set roomId(val: string) {
        this._roomId = val;
    }

    set roomUsers(val: string[]) {
        this._roomUsers = val;
    }

    set gameMasterId(val: string) {
        this._gameMasterId = val;
    }

    set gameState(val: GameStateInterface) {
        this._gameState = val;
    }

    get gameState() {
        return this._gameState;
    }

    get roomUsers() {
        return this._roomUsers;
    }

    get roomId() {
        return this._roomId;
    }

    get gameMasterId() {
        return this._gameMasterId;
    }
}

type Action =
    | { type: 'userJoined'; payload: Record<string, string[]> }
    | { type: 'roomCreated'; payload: Record<string, string[]> }
    | { type: 'userLeft'; payload: Record<string, string[]> }
    | { type: 'leaveRoom' }
    | { type: 'gameStarted'; payload?: string }
    | { type: 'tableUpdate'; payload: GameStateInterface };

function socketConnectionReducer(state: IConnectionData, action: Action): IConnectionData {
    switch (action.type) {
        case 'leaveRoom': {
            return new ConnectionData();
        }
        case 'userJoined':
        case 'roomCreated':
        case 'userLeft': {
            const roomData = action.payload;
            const roomId = Object.keys(roomData)[0];
            const roomUsers = roomData[roomId];
            return { ...state, roomId, roomUsers };
        }
        case 'gameStarted': {
            const socketId = action.payload;
            if (!socketId) return state;
            const myQueueId = state.roomUsers.findIndex((userId) => userId === socketId);

            return {
                ...state,
                myQueueId,
            };
        }
        case 'tableUpdate': {
            const gameState = action.payload;
            gameState.playersCards = new Map(gameState.playersCards);

            return { ...state, gameState };
        }
        default:
            return state;
    }
}

const SocketContext = createContext<SocketContextType | null>(null);
const initialState: IConnectionData = {
    roomId: '',
    roomUsers: [],
    myQueueId: 0,
    gameState: {
        id: '',
        deck: [],
        winner: null,
        discardedPile: [],
        players: [],
        table: [],
        playersCards: new Map<string, number[]>(),
        currentPlayerId: 0,
        defenderPlayerId: 1,
        mode: 'attack',
    },
};

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const socket = useMemo(() => io('http://localhost:3000', { autoConnect: true }), []);
    const [connectionData, dispatch] = useReducer(socketConnectionReducer, initialState);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Client connected to server');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, data: connectionData, dispatch }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    if (!context.socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;
};
