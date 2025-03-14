import React, { useEffect } from 'react';
import { Button, Container, Typography, Box, IconButton, List, ListItem } from '@mui/material';
import { styled } from '@mui/system';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { GameStateInterface, useSocket } from '../../shared/Contexts/SocketConnection/SocketConnection';
import { useNavigate } from 'react-router';

const DarkBox = styled(Box)({
    backgroundColor: '#121212',
    color: '#fff',
    borderRadius: '12px',
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    maxWidth: '400px',
    margin: 'auto',
    textAlign: 'center',
});

const ButtonStyled = styled(Button)({
    backgroundColor: '#0077cc',
    color: '#fff',
    marginTop: '20px',
    padding: '16px 32px',
    fontSize: '16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    '&:hover': {
        backgroundColor: '#005fa3',
        transform: 'translateY(-2px)',
    },
    '&:active': {
        transform: 'translateY(0)',
    },
    width: '100%',
});

const RoomIdWrapper = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
    color: '#ccc',
});

const RoomIdText = styled(Typography)({
    marginRight: '10px',
    fontSize: '16px',
});

export const Room: React.FC = () => {
    const { socket, data, dispatch } = useSocket();

    const navigate = useNavigate();

    const handleStartGame = () => {
        if (data.roomUsers.length < 2) return;

        const roomData = { [data.roomId]: data.roomUsers };
        socket.emit('startGame', roomData);
    };

    const handleLeaveRoom = () => {
        socket.emit('leaveRoom', data.roomId);
        dispatch({ type: 'leaveRoom' });
        navigate('/');
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(data.roomId).then(() => {});
    };

    useEffect(() => {
        const handleGameStarted = () => {
            navigate('/game');
            dispatch({type: 'gameStarted', payload: socket.id })
        };
        const handleUserLeft = (roomData: Record<string, string[]>) => {
            dispatch({ type: 'userLeft', payload: roomData });
        };
        const handleTableUpdate = (newGameTable: GameStateInterface) => {
            dispatch({ type: 'tableUpdate', payload: newGameTable });
        };

        socket.on('tableUpdate', handleTableUpdate);
        socket.on('userLeft', handleUserLeft);
        socket.on('gameStarted', handleGameStarted);
    }, [socket, dispatch, navigate]);

    return (
        <Container sx={{ position: 'relative' }}>
            <DarkBox>
                <Typography variant="h4" gutterBottom>
                    Room Menu
                </Typography>
                <Typography variant="h6">Choose an action to proceed:</Typography>
                <ButtonStyled onClick={handleStartGame}>Start Game</ButtonStyled>
                <ButtonStyled onClick={handleLeaveRoom}>Leave Room</ButtonStyled>

                <RoomIdWrapper>
                    <RoomIdText>room_id: {data.roomId}</RoomIdText>
                    <IconButton onClick={handleCopyRoomId} color="primary">
                        <ContentCopyIcon />
                    </IconButton>
                </RoomIdWrapper>
            </DarkBox>

            <List>
                {data.roomUsers.map((user) => (
                    <ListItem key={user}>{user}</ListItem>
                ))}
            </List>
        </Container>
    );
};
