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
    user?: string;
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

const btnBase: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: '4px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    lineHeight: '20px',
};

const ConnectionSelector: React.FC = () => {
    const { currentConnection, setCurrentConnection } = useConnectionContext();
    const [connections, setConnections] = useState<ConnectionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [showManager, setShowManager] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // Режим выбора подключения вместо текущего соединения (для переключения на неактивное)
    const [picking, setPicking] = useState(false);
    const [pickId, setPickId] = useState<string>('');

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

    const doSwitch = async (id: string) => {
        const selected = connections.find(c => c.id === id);
        if (!selected) {
            alert('Не найдены данные подключения');
            return;
        }
        try {
            const res: any = await switchConnection(id);
            if (res && res.error) {
                // Пул недоступен, но сервер разрешил переключение — предупреждаем, но продолжаем
                console.warn('Переключение с предупреждением:', res.error);
            }
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
        } catch (err) {
            console.error('Ошибка переключения:', err);
            alert('Не удалось переключить подключение');
            setSwitching(false);
            setLoading(false);
            setPicking(false);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setLoading(true);
        setSwitching(true);
        await doSwitch(id);
    };

    const handleConfirmPick = async () => {
        if (!pickId) return;
        setLoading(true);
        setSwitching(true);
        await doSwitch(pickId);
    };

    const handleConnectionSaved = () => {
        loadConnections();
        // Если редактировали текущее подключение — обновим заголовок после перезагрузки данных
    };

    const handleOpenAdd = () => {
        setEditId(null);
        setShowManager(true);
    };

    // Редактирование: доступно как для текущего, так и для любого выбранного из списка подключения
    const handleOpenEdit = (id?: string) => {
        const targetId = id || pickId || currentConnection?.id || connections[0]?.id;
        if (!targetId) return;
        setEditId(targetId);
        setShowManager(true);
    };

    const handleCloseManager = () => {
        setShowManager(false);
        setEditId(null);
    };

    const handleDeleteConnection = async (id?: string, event?: React.MouseEvent) => {
        event?.stopPropagation();
        const targetId = id || currentConnection?.id || connections[0]?.id;
        if (!targetId) return;
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Вы уверены, что хотите удалить это подключение?')) return;

        setDeletingId(targetId);
        try {
            await deleteConnectionApi(targetId);
            loadConnections();
        } catch (err) {
            console.error('Ошибка удаления подключения:', err);
            alert('Ошибка удаления подключения');
        } finally {
            setDeletingId(null);
        }
    };

    const openPicker = () => {
        setPickId(currentConnection?.id || '');
        setPicking(true);
    };

    const closePicker = () => {
        setPicking(false);
        setPickId('');
    };

    // Вертикальный столбец кнопок управления (боковая панель статична по ширине)
    const actionButtons = (opts: { showEditTarget?: string | null }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px', marginLeft: '8px' }}>
            <button
                onClick={handleOpenAdd}
                style={{ ...btnBase, backgroundColor: '#28a745' }}
                title="Добавить подключение"
            >
                +
            </button>
            <button
                onClick={() => handleOpenEdit(opts.showEditTarget || undefined)}
                disabled={connections.length === 0}
                style={{
                    ...btnBase,
                    backgroundColor: connections.length === 0 ? '#ccc' : '#ffc107',
                    color: '#333',
                    cursor: connections.length === 0 ? 'not-allowed' : 'pointer',
                }}
                title="Редактировать подключение"
            >
                ✎
            </button>
            <button
                onClick={(e) => handleDeleteConnection(opts.showEditTarget || undefined, e)}
                disabled={deletingId !== null || connections.length === 0}
                style={{
                    ...btnBase,
                    backgroundColor: deletingId !== null || connections.length === 0 ? '#ccc' : '#dc3545',
                    cursor: deletingId !== null ? 'not-allowed' : 'pointer',
                }}
                title="Удалить подключение"
            >
                {deletingId !== null ? '⏳' : '−'}
            </button>
        </div>
    );

    if (connections.length === 0) {
        return (
            <div className="connection-selector" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span className="connection-label">Подключение:</span>
                <span style={{ color: 'var(--error-red)', fontWeight: 500 }}>Нет доступных БД</span>
                <button
                    onClick={handleOpenAdd}
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
                {showManager && (
                    <ConnectionManager
                        editId={editId}
                        onConnectionSaved={handleConnectionSaved}
                        onClose={handleCloseManager}
                    />
                )}
            </div>
        );
    }

    // Режим выбора подключения из полного списка (можно выбрать даже недоступное —
    // чтобы отредактировать его параметры)
    if (picking) {
        return (
            <>
                <div className="connection-selector" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <span className="connection-label">Выберите подключение:</span>
                    <select
                        className="connection-select"
                        value={pickId}
                        onChange={e => setPickId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">— не выбрано —</option>
                        {connections.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.description} ({c.host}:{c.port}){c.id === currentConnection?.id ? ' • активное' : ''}
                            </option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '4px', marginLeft: '8px' }}>
                        <button
                            onClick={handleConfirmPick}
                            disabled={!pickId || switching}
                            style={{
                                ...btnBase,
                                backgroundColor: !pickId || switching ? '#ccc' : '#007bff',
                                cursor: !pickId || switching ? 'not-allowed' : 'pointer',
                            }}
                            title="Выбрать это подключение"
                        >
                            {switching ? '⏳ Переключение...' : '✓ Выбрать'}
                        </button>
                        <button
                            onClick={() => handleOpenEdit(pickId)}
                            disabled={!pickId}
                            style={{
                                ...btnBase,
                                backgroundColor: !pickId ? '#ccc' : '#ffc107',
                                color: '#333',
                                cursor: !pickId ? 'not-allowed' : 'pointer',
                            }}
                            title="Редактировать выбранное подключение (без переключения)"
                        >
                            ✎ Редактировать
                        </button>
                        <button
                            onClick={closePicker}
                            style={{ ...btnBase, backgroundColor: '#6c757d' }}
                            title="Отмена"
                        >
                            ✕ Отмена
                        </button>
                    </div>
                </div>
                {showManager && (
                    <ConnectionManager
                        editId={editId}
                        onConnectionSaved={handleConnectionSaved}
                        onClose={handleCloseManager}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="connection-selector" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span className="connection-label">Подключение:</span>
                <select
                    className="connection-select"
                    value={currentConnection?.id || connections[0]?.id || ''}
                    onChange={handleChange}
                    disabled={loading}
                    title="Быстрое переключение на активные подключения"
                >
                    {connections.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.description} ({c.host}:{c.port})
                        </option>
                    ))}
                </select>
                {switching && <span className="connection-loading">⏳...</span>}
                <button
                    onClick={openPicker}
                    style={{ ...btnBase, backgroundColor: '#007bff', marginLeft: '8px' }}
                    title="Выбрать подключение из списка (доступно даже для неактивных)"
                >
                    ⚙
                </button>
                {actionButtons({ showEditTarget: currentConnection?.id || connections[0]?.id })}
            </div>
            {showManager && (
                <ConnectionManager
                    editId={editId}
                    onConnectionSaved={handleConnectionSaved}
                    onClose={handleCloseManager}
                />
            )}
        </>
    );
};

export default ConnectionSelector;
