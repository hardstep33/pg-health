import React, { useEffect, useState } from 'react';
import { getConnections, switchConnection } from '../../../api/postgresApi';
import { useConnectionContext } from '../../../hooks/useConnectionContext';

interface ConnectionItem {
    id: string;
    description: string;
    host: string;
    port: number;
    database: string;
}

const STORAGE_KEY = 'selected-connection-id';

function getStoredConnectionId(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

function storeConnectionId(id: string) {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {
        // ignore
    }
}

const ConnectionSelector: React.FC = () => {
    const { currentConnection, setCurrentConnection } = useConnectionContext();
    const [connections, setConnections] = useState<ConnectionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [switching, setSwitching] = useState(false);

    useEffect(() => {
        getConnections()
            .then((data: ConnectionItem[]) => {
                setConnections(data);
                if (data.length > 0 && !currentConnection) {
                    const storedId = getStoredConnectionId();
                    let target = data[0];
                    if (storedId) {
                        const found = data.find(c => c.id === storedId);
                        if (found) target = found;
                    }
                    setCurrentConnection({ id: target.id, description: target.description });
                    // Синхронизируем бэкенд с выбранным сервером
                    switchConnection(target.id).catch(console.error);
                }
            })
            .catch(err => console.error('Ошибка загрузки подключений:', err));
    }, []);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setLoading(true);
        setSwitching(true);
        try {
            const result = await switchConnection(id);
            storeConnectionId(id);
            setCurrentConnection({ id: result.id, description: result.description });
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (err) {
            console.error('Ошибка переключения:', err);
            setSwitching(false);
            setLoading(false);
        }
    };

    if (connections.length === 0) {
        return (
            <div className="connection-selector">
                <span className="connection-label">Подключение:</span>
                <span style={{ color: 'var(--error-red)', fontWeight: 500 }}>Нет доступных БД</span>
            </div>
        );
    }

    return (
        <div className="connection-selector">
            <span className="connection-label">Подключение:</span>
            <select
                className="connection-select"
                value={currentConnection?.id || connections[0]?.id || ''}
                onChange={handleChange}
                disabled={loading}
            >
                {connections.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.description} ({c.host}:{c.port})
                    </option>
                ))}
            </select>
            {switching && <span className="connection-loading">⏳...</span>}
        </div>
    );
};

export default ConnectionSelector;