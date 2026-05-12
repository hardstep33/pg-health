import React from 'react';
import { PageName } from './Sidebar';

const pageTitles: Record<PageName, string> = {
    'db-state':            'Состояние базы данных',
    'postgres-params':     'Параметры PostgreSQL',
    'locks-transactions':  'Блокировки и транзакции',
    'indexes':             'Анализ индексов',
};

interface HeaderProps {
    activePage: PageName;
}

const Header: React.FC<HeaderProps> = ({ activePage }) => (
    <header className="app-header">
        <span className="app-header-title">{pageTitles[activePage]}</span>
    </header>
);

export default Header;
