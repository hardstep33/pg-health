import React from 'react';
import { PageName } from './Sidebar';
import { useConnectionContext } from '../hooks/useConnectionContext';

const pageTitles: Record<PageName, string> = {
    'db-state':            'Состояние базы данных',
    'postgres-params':     'Параметры PostgreSQL',
    'locks-transactions':  'Блокировки и транзакции',
    'indexes':             'Анализ индексов',
    'replication':         'Репликация',
};

interface HeaderProps {
    activePage: PageName;
}

const Header: React.FC<HeaderProps> = ({ activePage }) => {
    const { currentConnection } = useConnectionContext();
    let connectionString = '—';
    if (currentConnection) {
        const desc = currentConnection.description || '?';
        const host = currentConnection.host || '?';
        const port = currentConnection.port ?? '?';
        connectionString = `${desc} (${host}:${port})`;
    }

    return (
        <header className="app-header">
            <span className="app-header-title">
                {pageTitles[activePage]}
                <span className="app-header-connection"> ({connectionString})</span>
            </span>
        </header>
    );
};

export default Header;