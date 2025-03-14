import SocketProvider from './SocketConnection/SocketConnection';

const Provider = ({ children }: { children: React.ReactNode }) => {
    return <SocketProvider>{children}</SocketProvider>;
};

export default Provider;