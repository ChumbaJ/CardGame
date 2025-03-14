import { Theme } from '@emotion/react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import { styled, SxProps } from '@mui/system';
import cls from './Card.module.scss';

const GameCard = styled(MuiCard)({
    backgroundColor: '#1E1E1E', // Темный фон
    color: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
    maxWidth: '260px', // Компактный размер
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    width: '50px',
    height: '100px',
    '&:hover': {
        transform: 'scale(1.05)', // Легкое увеличение при наведении
    },
});

const CardTitle = styled(Typography)({
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
});

interface ICard {
    title?: string;
    sx?: SxProps<Theme>;
    className?: string;
    onClick?: (val?: any) => void;
}

export default function Card({ title, sx, className, onClick: handleClick }: ICard) {
    return (
        <GameCard onClick={handleClick} className={className} sx={{ transition: '0.1s ease-out' }}>
            <CardContent className={cls.cardContent} sx={{ textAlign: 'center' }}>
                <CardTitle className={cls.cardTitle}>{title}</CardTitle>
            </CardContent>
        </GameCard>
    );
}
