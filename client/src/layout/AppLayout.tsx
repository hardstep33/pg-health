import React, { useState, useRef, useCallback } from 'react';
import Sidebar, { PageName } from './Sidebar';
import Header from './Header';
import { exportToPdf } from '../utils/pdfExport';
import DatabaseStatePage from '../pages/DatabaseStatePage';
import PostgresParamsPage from '../pages/PostgresParamsPage';
import LocksTransactionsPage from '../pages/LocksTransactionsPage';
import IndexesPage from '../pages/IndexesPage';
import ReplicationPage from '../pages/ReplicationPage';
import DashboardSummary from '../components/DashboardSummary/DashboardSummary';

const DASHBOARD_KEYS = [
    'dashboard-db-state',
    'dashboard-postgres-params',
    'dashboard-locks-transactions',
    'dashboard-indexes',
    'dashboard-replication',
];

const AppLayout: React.FC = () => {
    const [activePage, setActivePage] = useState<PageName>('db-state');
    const [isExporting, setIsExporting] = useState(false);

    const handleResetLayout = useCallback(() => {
        DASHBOARD_KEYS.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    }, []);

    const contentRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = useCallback(async () => {
        if (!contentRef.current) return;
        setIsExporting(true);
        try {
            await exportToPdf(contentRef.current, `report-${activePage}.pdf`);
        } finally {
            setIsExporting(false);
        }
    }, [activePage]);

    const handleNavigate = useCallback((page: string) => {
        setActivePage(page as PageName);
    }, []);

    const renderPage = () => {
        switch (activePage) {
            case 'db-state': return <DatabaseStatePage />;
            case 'postgres-params': return <PostgresParamsPage />;
            case 'locks-transactions': return <LocksTransactionsPage />;
            case 'indexes': return <IndexesPage />;
            case 'replication': return <ReplicationPage />;
            default: return null;
        }
    };

    return (
        <div className="app-layout">
            <Sidebar
                activePage={activePage}
                onNavigate={setActivePage}
                onExportPdf={handleExportPdf}
                isExporting={isExporting}
                onResetLayout={handleResetLayout}
            />
            <div className="app-main">
                <Header activePage={activePage} />
                <main className="app-content" ref={contentRef}>
                    <div style={{ padding: 'var(--content-padding, 20px)' }}>
                        <DashboardSummary onNavigate={handleNavigate} />
                    </div>
                    {renderPage()}
                </main>
            </div>
            {isExporting && (
                <div className="export-overlay">
                    <div className="export-overlay-content">
                        <div className="widget-spinner"></div>
                        <span>Идёт экспорт PDF...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;