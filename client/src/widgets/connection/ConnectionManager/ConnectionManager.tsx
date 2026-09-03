import React, { useState } from 'react';
import { addConnection, testConnection as testConnectionApi, getConnections } from '../../../api/postgresApi';

interface ConnectionFormData {
    description: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

interface ConnectionManagerProps {
    onConnectionAdded?: () => void;
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

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ onConnectionAdded, onClose }) => {
    const [formData, setFormData] = useState<ConnectionFormData>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
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
            await addConnection(formData);
            // Обновляем список коннектов
            await getConnections();
            onConnectionAdded?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка добавления подключения');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '24px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Добавить подключение к БД</h2>
                
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
                            {loading ? 'Добавление...' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConnectionManager;
