import React, { useEffect } from 'react';
import { Button, Container, Typography, Box, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { useSocket } from '../../shared/Contexts/SocketConnection/SocketConnection';
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

const StyledTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        backgroundColor: '#1d1d1d',
        borderRadius: '8px',
        color: '#fff',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#0077cc',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#005fa3',
    },
    '& .MuiInputBase-input': {
        color: '#fff',
        fontSize: '16px',
    },
    '& .MuiFormLabel-root': {
        color: '#667',
    },
    marginTop: '20px',
});

export const MainMenu: React.FC = () => {
    const { socket, dispatch } = useSocket();

    const navigate = useNavigate();

    const handleCreateRoom = () => socket.emit('createRoom');

    const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const roomId = formData.get('roomId') as string;
        if (!roomId) return;
        socket.emit('joinRoom', roomId);
    };

    useEffect(() => {
        const handleRoomCreated = (roomData: Record<string, string[]>) => {
            dispatch({ type: 'roomCreated', payload: roomData });
            navigate('/room');
        };

        const handleRoomJoined = (roomData: Record<string, string[]>) => {;
            dispatch({ type: 'userJoined', payload: roomData });
            navigate('/room');
        };

        socket.on('roomCreated', handleRoomCreated);
        socket.on('roomJoined', handleRoomJoined);
    }, [socket, dispatch, navigate]);

    return (
        <Container>
            <DarkBox>
                <Typography variant="h3" gutterBottom>
                    Welcome to the Game
                </Typography>
                <Typography variant="h6">Choose an action to proceed:</Typography>
                <ButtonStyled onClick={handleCreateRoom}>Create Room</ButtonStyled>
                <form onSubmit={handleJoinRoom}>
                    <StyledTextField fullWidth label="Room ID" name="roomId" variant="outlined" />
                    <ButtonStyled type="submit">Join Room</ButtonStyled>
                </form>
            </DarkBox>
        </Container>
    );
};
