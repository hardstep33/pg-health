import React from 'react';
import { MdStorage, MdSpeed, MdTune, MdLock, MdBarChart, MdRefresh } from 'react-icons/md';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';
import ConnectionSelector from '../widgets/connection/ConnectionSelector/ConnectionSelector';
import ExportButton from '../components/ExportButton/ExportButton';
import './layout.css';

const StorageIcon = MdStorage  as React.FC;
const SpeedIcon   = MdSpeed    as React.FC;
const TuneIcon    = MdTune     as React.FC;
const LockIcon    = MdLock     as React.FC;
const ChartIcon   = MdBarChart as React.FC;
const RefreshIcon = MdRefresh  as React.FC;

export type PageName = 'db-state' | 'postgres-params' | 'locks-transactions' | 'indexes';

interface NavItem {
    id: PageName;
    label: string;
    Icon: React.FC;
}

const navItems: NavItem[] = [
    { id: 'db-state',            label: 'Состояние БД',  Icon: SpeedIcon },
    { id: 'postgres-params',     label: 'Параметры PG',  Icon: TuneIcon  },
    { id: 'locks-transactions',  label: 'Блокировки',    Icon: LockIcon  },
    { id: 'indexes',             label: 'Индексы',       Icon: ChartIcon },
];

interface SidebarProps {
    activePage: PageName;
    onNavigate: (page: PageName) => void;
    onExportPdf: () => void;
    isExporting: boolean;
    onResetLayout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onExportPdf, isExporting, onResetLayout }) => (
    <aside className="sidebar">
        <div className="sidebar-logo">
            <span className="sidebar-logo-icon"><StorageIcon /></span>
            <div>
                <div className="sidebar-logo-text">PG Health</div>
                <div className="sidebar-logo-sub">Мониторинг PostgreSQL</div>
            </div>
        </div>

        <div className="sidebar-section">
            <span className="sidebar-section-label">Навигация</span>
            {navItems.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`sidebar-nav-item ${activePage === id ? 'active' : ''}`}
                    onClick={() => onNavigate(id)}
                >
                    <span className="sidebar-nav-icon"><Icon /></span>
                    {label}
                </button>
            ))}
        </div>

        <div className="sidebar-tools">
            <ConnectionSelector />
            <ThemeSwitcher />
            <ExportButton onClick={onExportPdf} disabled={isExporting} />
            <button
                className="reset-layout-btn"
                onClick={onResetLayout}
                title="Сбросить расположение виджетов на странице"
            >
                <span className="reset-layout-btn-icon"><RefreshIcon /></span>
                Сбросить layout
            </button>
        </div>
    </aside>
);

export default Sidebar;
