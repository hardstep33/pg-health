import React from 'react';
import { MdStorage, MdSpeed, MdTune, MdLock, MdBarChart, MdSync } from 'react-icons/md';
import ThemeSwitcher from '../components/ThemeSwitcher/ThemeSwitcher';
import ConnectionSelector from '../widgets/connection/ConnectionSelector/ConnectionSelector';
import ExportButton from '../components/ExportButton/ExportButton';
import './layout.css';

const StorageIcon = MdStorage as React.FC;
const SpeedIcon   = MdSpeed   as React.FC;
const TuneIcon    = MdTune    as React.FC;
const LockIcon    = MdLock    as React.FC;
const ChartIcon   = MdBarChart as React.FC;
const SyncIcon    = MdSync    as React.FC;

export type PageName = 'db-state' | 'postgres-params' | 'locks-transactions' | 'indexes' | 'replication';

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
    { id: 'replication',         label: 'Репликация',    Icon: SyncIcon  },
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
        </div>
    </aside>
);

export default Sidebar;