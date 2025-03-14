import {
    Box,
    Button as MUIButton,
    Container,
    styled,
    Typography,
    List,
    ListItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Card from '../../entities/Card/Card';
import {
    GameStateInterface,
    IConnectionData,
    useSocket,
} from '../../shared/Contexts/SocketConnection/SocketConnection';
import cls from './Game.module.scss';
import { Winner } from '../../shared/ui/Winner/Winner';

const Button = styled(MUIButton)(() => ({
    backgroundColor: '#111',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '30px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid transparent',

    '&:hover': {
        backgroundColor: '#333',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
        transform: 'translateY(-3px)',
        borderColor: '#fff',
    },

    '&:active': {
        backgroundColor: '#444',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(1px)',
    },

    '&:focus': {
        outline: 'none',
    },

    textTransform: 'none',
    letterSpacing: '0.5px',
}));

const getOpponentDeck = (myPlayerId: string, data: IConnectionData): number[] | null => {
    const defenderPlayerId = data.gameState.players[data.gameState.defenderPlayerId];
    const attackerPlayerId = data.gameState.players[data.gameState.currentPlayerId];

    if (defenderPlayerId === myPlayerId) {
        return data.gameState.playersCards.get(attackerPlayerId)!;
    }
    if (attackerPlayerId === myPlayerId) {
        return data.gameState.playersCards.get(defenderPlayerId)!;
    }

    return null;
};

const isMyTurn = (myQueueId: number, data: IConnectionData): boolean => {
    if (myQueueId === data.gameState.defenderPlayerId && data.gameState.mode === 'defend') {
        return true;
    }
    if (myQueueId === data.gameState.currentPlayerId && data.gameState.mode === 'attack') {
        return true;
    }
    return false;
};

const getPlayerTurn = (data: IConnectionData): number => {
    if (data.gameState.mode === 'attack') {
        return data.gameState.currentPlayerId;
    } else {
        return data.gameState.defenderPlayerId;
    }
};

export const Game = () => {
    const { socket, data, dispatch } = useSocket();
    const [selectedCards, setSelectedCards] = useState<Map<number, number>>(
        new Map<number, number>()
    );

    const ANGLEOFFSET = 360 / data.roomUsers.length;
    const RADIUS = 200;

    const MY_DECK = data.gameState.playersCards.get(socket.id || '');
    const OPPONENT_DECK = getOpponentDeck(socket.id || '', data);

    const handleSelectCard = (cardId: number) => {
        if (!isMyTurn(data.myQueueId, data)) return;
        if (!MY_DECK) return;

        if (selectedCards.has(cardId)) {
            setSelectedCards((prev) => {
                const newState = new Map(prev);
                newState.delete(cardId);
                return newState;
            });
        } else {
            if (data.gameState.mode === 'attack') {
                if (selectedCards.size > 2) return;
                if (3 - data.gameState.table.length - selectedCards.size < 1) return;
            }

            if (data.gameState.mode === 'defend') {
                if (selectedCards.size > 0) return;
            }

            const cardValue = MY_DECK[cardId];
            setSelectedCards((prev) => {
                const newState = new Map(prev);
                newState.set(cardId, cardValue);
                return newState;
            });
        }
    };

    const handleNextTurn = () => {
        socket.emit('nextTurn', data.gameState.id);
    };

    const handleTableClick = () => {
        if (!isMyTurn(data.myQueueId, data)) return;

        if (!selectedCards.size) return;

        // AttackMode
        if (data.gameState.mode === 'attack') {
            socket.emit('playCards', data.gameState.id, Array.from(selectedCards.entries()));
        }

        setSelectedCards(new Map());
    };

    const handleDefendCardClick = (stackId: number) => {
        if (!selectedCards.size) return;
        const selectedCardId = selectedCards.keys().next().value!;
        socket.emit('defendCard', data.gameState.id, selectedCardId, stackId);
    };

    useEffect(() => {
        const handleTableUpdate = (newGameTable: GameStateInterface) => {
            dispatch({ type: 'tableUpdate', payload: newGameTable });
        };

        socket.on('tableUpdate', handleTableUpdate);
    }, [socket, dispatch]);

    return (
        <Container className={cls.main}>
            {data.gameState.deck.length ? (
                <Box className={cls.deck}>
                    <p style={{ zIndex: 100, position: 'fixed' }}>{data.gameState.deck.length}</p>
                    <Card className={`${cls.deck__card} ${cls.deck__card_1}`} />
                    <Card className={`${cls.deck__card} ${cls.deck__card_2}`} />
                    <Card className={`${cls.deck__card} ${cls.deck__card_3}`} />
                </Box>
            ) : null}

            <Box className={cls.gameTable} onClick={handleTableClick}>
                <Box className={cls.turnDisplay}>
                    <Typography className={cls.turnDisplay__title}>
                        {isMyTurn(data.myQueueId, data)
                            ? 'YOUR TURN'
                            : `Player's ${getPlayerTurn(data) + 1} turn`}
                    </Typography>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    <div className={cls.turnDisplay__particle}></div>
                    {isMyTurn(data.myQueueId, data) && (
                        <Typography className={cls.turnDisplay__caption}>
                            {data.gameState.mode === 'attack' ? 'ATTACK' : 'DEFENSE'}
                        </Typography>
                    )}
                </Box>
                <Box
                    className={`${cls.gameTable__inner} ${
                        selectedCards.size && data.gameState.mode === 'attack'
                            ? cls.highlight
                            : null
                    }`}
                >
                    <List className={cls.gameTable__cardList}>
                        {data.gameState.table.map((stack, stackId) => (
                            <ListItem className={cls.gameTable__cardList__stack} key={stackId}>
                                {stack.map((value, id) =>
                                    id === 0 ? (
                                        <Card
                                            onClick={() => handleDefendCardClick(stackId)}
                                            className={`${cls.gameTable__cardList__card} ${
                                                data.gameState.mode === 'defend' &&
                                                stack.length == 1 &&
                                                selectedCards.size
                                                    ? cls.highlight
                                                    : ''
                                            }`}
                                            key={id}
                                            title={value.toString()}
                                        />
                                    ) : (
                                        <Card
                                            className={`${cls.gameTable__cardList__card} ${cls.top}`}
                                            key={id}
                                            title={value.toString()}
                                        />
                                    )
                                )}
                            </ListItem>
                        ))}
                    </List>

                    {data.roomUsers.map((user, id) => {
                        const ANGLE = id * ANGLEOFFSET;
                        const x = RADIUS * Math.cos((ANGLE * Math.PI) / 180);
                        const y = RADIUS * Math.sin((ANGLE * Math.PI) / 180);

                        return (
                            <div
                                key={user}
                                className={cls.user}
                                style={{
                                    left: `calc(50% + ${x}px)`,
                                    top: `calc(50% + ${y}px)`,
                                    transform: `rotate(${
                                        id * ANGLE
                                    }deg) translate(calc(0, -200px) rotate(${id * -ANGLE}deg)`,
                                }}
                            >
                                {socket.id === user ? 'You' : `player-${id + 1}`}
                            </div>
                        );
                    })}
                </Box>
                <Button
                    disabled={!isMyTurn(data.myQueueId, data)}
                    className={`${cls.next} ${!isMyTurn(data.myQueueId, data) ? cls.next__disabled : ''}`}
                    onClick={handleNextTurn}
                >
                    NEXT TURN
                </Button>
            </Box>

            <Box className={cls.opponentFov}>
                {OPPONENT_DECK?.map((value, id) => (
                    <Card title={value.toString()} key={id} />
                ))}
            </Box>

            <Box className={cls.fov}>
                {MY_DECK?.map((value, id) => (
                    <Card
                        className={`${selectedCards.has(id) ? cls.selected : null}`}
                        onClick={() => handleSelectCard(id)}
                        title={value.toString()}
                        key={id}
                    />
                ))}
            </Box>

            {data.gameState.winner !== null ? <Winner /> : null}
        </Container>
    );
};
