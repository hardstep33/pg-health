import React, { useEffect, useState } from 'react';
import { getConnections, switchConnection, deleteConnection as deleteConnectionApi } from '../../../api/postgresApi';
import { useConnectionContext } from '../../../hooks/useConnectionContext';
import ConnectionManager from '../ConnectionManager/ConnectionManager';

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
    const [showManager, setShowManager] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadConnections = () => {
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
                    // Сохраняем полный объект в контекст
                    setCurrentConnection({
                        id: target.id,
                        description: target.description || 'Без описания',
                        host: target.host || 'неизвестный хост',
                        port: target.port || 0,
                        database: target.database || '',
                    });
                    switchConnection(target.id).catch(console.error);
                }
            })
            .catch(err => console.error('Ошибка загрузки подключений:', err));
    };

    useEffect(() => {
        loadConnections();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setLoading(true);
        setSwitching(true);
        try {
            await switchConnection(id);
            const selected = connections.find(c => c.id === id);
            if (selected) {
                setCurrentConnection({
                    id: selected.id,
                    description: selected.description || 'Без описания',
                    host: selected.host || 'неизвестный хост',
                    port: selected.port || 0,
                    database: selected.database || '',
                });
                storeConnectionId(id);
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                throw new Error('Не найдены данные подключения');
            }
        } catch (err) {
            console.error('Ошибка переключения:', err);
            setSwitching(false);
            setLoading(false);
        }
    };

    const handleConnectionAdded = () => {
        loadConnections();
    };

    const handleDeleteConnection = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Вы уверены, что хотите удалить это подключение?')) return;
        
        setDeletingId(id);
        try {
            await deleteConnectionApi(id);
            loadConnections();
        } catch (err) {
            console.error('Ошибка удаления подключения:', err);
            alert('Ошибка удаления подключения');
        } finally {
            setDeletingId(null);
        }
    };

    if (connections.length === 0) {
        return (
            <div className="connection-selector">
                <span className="connection-label">Подключение:</span>
                <span style={{ color: 'var(--error-red)', fontWeight: 500 }}>Нет доступных БД</span>
                <button
                    onClick={() => setShowManager(true)}
                    style={{
                        marginLeft: '8px',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    Добавить
                </button>
            </div>
        );
    }

    return (
        <>
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
                <button
                    onClick={() => setShowManager(true)}
                    style={{
                        marginLeft: '8px',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#28a745',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                    title="Добавить подключение"
                >
                    +
                </button>
                <button
                    onClick={(e) => handleDeleteConnection(currentConnection?.id || connections[0]?.id, e)}
                    disabled={deletingId !== null || connections.length === 0}
                    style={{
                        marginLeft: '4px',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: deletingId !== null ? '#ccc' : '#dc3545',
                        color: 'white',
                        cursor: deletingId !== null ? 'not-allowed' : 'pointer',
                    }}
                    title="Удалить текущее подключение"
                >
                    {deletingId !== null ? '⏳' : '−'}
                </button>
            </div>
            {showManager && (
                <ConnectionManager
                    onConnectionAdded={handleConnectionAdded}
                    onClose={() => setShowManager(false)}
                />
            )}
        </>
    );
};

export default ConnectionSelector;