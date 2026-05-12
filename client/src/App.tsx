import React, { useState, useCallback } from 'react';
import { ConnectionContext, ConnectionInfo } from './hooks/useConnectionContext';
import AppLayout from './layout/AppLayout';

const App: React.FC = () => {
    const [currentConnection, setCurrentConnection] = useState<ConnectionInfo | null>(null);

    const handleSetConnection = useCallback((conn: ConnectionInfo) => {
        setCurrentConnection(conn);
    }, []);

    return (
        <ConnectionContext.Provider value={{ currentConnection, setCurrentConnection: handleSetConnection }}>
            <AppLayout />
        </ConnectionContext.Provider>
    );
};

export default App;
