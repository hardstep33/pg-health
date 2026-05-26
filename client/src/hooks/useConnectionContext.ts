import { createContext, useContext } from 'react';

export interface ConnectionInfo {
    id: string;
    description: string;
    host: string;
    port: number;
    database: string;
}

interface ConnectionContextType {
    currentConnection: ConnectionInfo | null;
    setCurrentConnection: (conn: ConnectionInfo) => void;
}

export const ConnectionContext = createContext<ConnectionContextType>({
    currentConnection: null,
    setCurrentConnection: () => {},
});

export const useConnectionContext = () => useContext(ConnectionContext);