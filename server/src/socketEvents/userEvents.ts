import { Socket } from 'socket.io';
import gameManager from '../models/gameManager';
import { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types/events';
import { io } from '../../server';

const roomUsers: Map<string, string[]> = new Map<string, string[]>();

const getRoomData = (roomId: string): Record<string, string[]> => {
    return {
        [roomId]: roomUsers.get(roomId) || [],
    };
};

export const userEvents = (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    socket.on('createRoom', () => {
        const roomId = `room-${Date.now()}`;
        socket.rooms.forEach((roomId) => socket.leave(roomId));

        if (!roomUsers.has(roomId)) {
            roomUsers.set(roomId, []);
        }

        roomUsers.get(roomId)!.push(socket.id);

        socket.join(roomId);
        socket.emit('roomCreated', getRoomData(roomId));
    });

    socket.on('joinRoom', (roomId) => {
        if (!roomUsers.has(roomId)) {
            return;
        }
        const users = roomUsers.get(roomId) || [];

        if (users.find((user) => user === socket.id)) return;

        socket.join(roomId);
        users.push(socket.id);

        const roomData = getRoomData(roomId);

        io.in(roomId).emit('roomJoined', roomData);
    });

    socket.on('leaveRoom', (roomId) => {
        if (!roomUsers.has(roomId)) return;
        const users = (roomUsers.get(roomId) || []).filter((userId) => userId !== socket.id);

        if (users.length > 0) {
            roomUsers.set(roomId, users);
        } else {
            roomUsers.delete(roomId);
        }

        socket.leave(roomId);
        socket.to(roomId).emit('userLeft', getRoomData(roomId));
    });

    socket.on('startGame', (roomData) => {
        const roomId = Object.keys(roomData)[0];
        const players = roomData[roomId];

        const gameMaster = gameManager.createGame(roomId, players);

        gameMaster.giveCards(players, 4);
        const newGameTable = gameMaster.updateTable();

        io.in(roomId).emit('tableUpdate', newGameTable);
        io.in(roomId).emit('gameStarted');
    });

    socket.on('nextTurn', (gameMasterId) => {
        const gameMaster = gameManager.findGame(gameMasterId);
        if (!gameMaster) throw new Error('invalid gameMaster id or gameMaster does not exist');

        gameMaster.nextTurn();

        const newGameTable = gameMaster.updateTable();

        io.in(gameMaster.roomId).emit('tableUpdate', newGameTable);
    });

    socket.on('playCards', (gameMasterId, cards) => {
        const gameMaster = gameManager.findGame(gameMasterId);
        if (!gameMaster) throw new Error('invalid gameMaster id or gameMaster does not exist');

        const cardsMap = new Map(cards);
        gameMaster.playCards(socket.id, cardsMap);

        const newGameTable = gameMaster.updateTable();
        io.in(gameMaster.roomId).emit('tableUpdate', newGameTable);
    });

    socket.on('defendCard', (gameMasterId, selectedCardId, stackId) => {
        const gameMaster = gameManager.findGame(gameMasterId);
        if (!gameMaster) throw new Error('invalid gameMaster id or gameMaster does not exist');

        gameMaster.defendCard(socket.id, selectedCardId, stackId);

        const newGameTable = gameMaster.updateTable();
        io.in(gameMaster.roomId).emit('tableUpdate', newGameTable);
    });

    // socket.on('cheat', (gameMasterId, playerId) => {
    //     const gameMaster = gameManager.findGame(gameMasterId);
    //     if (!gameMaster) throw new Error('invalid gameMaster id or gameMaster does not exist');

    //     const playerHands = [...gameMaster.playersCards.get(playerId)!];
    //     playerHands.push(3);
    //     playerHands.push(3);
    //     playerHands.push(3);

    //     gameMaster.playersCards.set(playerId, playerHands);

    //     const newGameTable = gameMaster.updateTable();

    //     io.in(gameMaster.roomId).emit('tableUpdate', newGameTable);
    // });
};
