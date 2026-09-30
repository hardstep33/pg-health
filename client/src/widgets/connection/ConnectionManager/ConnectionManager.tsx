import React, { useState, useEffect } from 'react';
import {
    addConnection,
    updateConnection,
    testConnection as testConnectionApi,
    getConnectionById,
} from '../../../api/postgresApi';

interface ConnectionFormData {
    description: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

interface ConnectionManagerProps {
    /** Если передан id — форма работает в режиме редактирования этого подключения */
    editId?: string | null;
    onConnectionSaved?: () => void;
    onClose: () => void;
}

const initialFormState: ConnectionFormData = {
    description: '',
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: '',
};

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ editId, onConnectionSaved, onClose }) => {
    const isEdit = Boolean(editId);
    const [formData, setFormData] = useState<ConnectionFormData>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // В режиме редактирования подгружаем текущие данные подключения
    useEffect(() => {
        if (!editId) return;
        setFetching(true);
        getConnectionById(editId)
            .then((cfg: ConnectionFormData) => {
                setFormData({
                    description: cfg.description || '',
                    host: cfg.host || '',
                    port: Number(cfg.port) || 5432,
                    database: cfg.database || '',
                    user: cfg.user || '',
                    password: cfg.password || '',
                });
            })
            .catch(err => {
                setError(err instanceof Error ? err.message : 'Не удалось загрузить подключение');
            })
            .finally(() => setFetching(false));
    }, [editId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTestResult(null);
        setFormData(prev => ({
            ...prev,
            [name]: name === 'port' ? Number(value) : value,
        }));
    };

    const handleTestConnection = async () => {
        if (!formData.host || !formData.port || !formData.database || !formData.user || !formData.password) {
            setTestResult({ success: false, message: 'Заполните все поля для проверки соединения' });
            return;
        }
        setTesting(true);
        setTestResult(null);
        setError(null);
        try {
            const result = await testConnectionApi(formData);
            setTestResult(result);
        } catch (err) {
            setTestResult({ success: false, message: err instanceof Error ? err.message : 'Ошибка проверки соединения' });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEdit && editId) {
                await updateConnection(editId, formData);
            } else {
                await addConnection(formData);
            }
            onConnectionSaved?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : (isEdit ? 'Ошибка обновления подключения' : 'Ошибка добавления подключения'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', padding: '24px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>
                    {isEdit ? 'Редактировать подключение к БД' : 'Добавить подключение к БД'}
                </h2>

                {fetching ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Загрузка подключения...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Описание</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Например: Production DB"
                            />
                        </div>

                        <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Хост</label>
                                <input
                                    type="text"
                                    name="host"
                                    value={formData.host}
                                    onChange={handleChange}
                                    required
                                    placeholder="localhost"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Порт</label>
                                <input
                                    type="number"
                                    name="port"
                                    value={formData.port}
                                    onChange={handleChange}
                                    required
                                    placeholder="5432"
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>База данных</label>
                            <input
                                type="text"
                                name="database"
                                value={formData.database}
                                onChange={handleChange}
                                required
                                placeholder="postgres"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Пользователь</label>
                            <input
                                type="text"
                                name="user"
                                value={formData.user}
                                onChange={handleChange}
                                required
                                placeholder="postgres"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        {testResult && (
                            <div
                                className={`test-result ${testResult.success ? 'success' : 'error'}`}
                                style={{
                                    padding: '12px',
                                    borderRadius: '4px',
                                    marginBottom: '16px',
                                    backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
                                    color: testResult.success ? '#155724' : '#721c24',
                                }}
                            >
                                {testResult.message}
                            </div>
                        )}

                        {error && (
                            <div
                                className="error-message"
                                style={{
                                    padding: '12px',
                                    borderRadius: '4px',
                                    marginBottom: '16px',
                                    backgroundColor: '#f8d7da',
                                    color: '#721c24',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={testing}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: testing ? '#ccc' : '#6c757d',
                                    color: 'white',
                                    cursor: testing ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {testing ? 'Проверка...' : 'Проверить соединение'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: '#f8f9fa',
                                    color: '#333',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    backgroundColor: loading ? '#ccc' : '#007bff',
                                    color: 'white',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? (isEdit ? 'Сохранение...' : 'Добавление...') : (isEdit ? 'Сохранить' : 'Добавить')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ConnectionManager;
