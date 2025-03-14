import { Typography } from '@mui/material';
import { useSocket } from '../../Contexts/SocketConnection/SocketConnection';
import cls from './Winnder.module.scss';

export const Winner = () => {
    const { data } = useSocket();

    return (
        <div className={cls.wrapper}>
            <div className={cls.textWrapper}>
                <Typography variant="h1" className={cls.title}>
                    {data.myQueueId === data.gameState.winner ? 'WINNER' : `Player-${data.gameState.winner! + 1} WON`}
                <div className={cls.cursor}></div>
                </Typography>
            </div>
        </div>
    );
};
