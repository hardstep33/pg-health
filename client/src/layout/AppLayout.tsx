import React, { useState, useRef, useCallback } from 'react';
import Sidebar, { PageName } from './Sidebar';
import Header from './Header';
import { exportToPdf } from '../utils/pdfExport';
import DatabaseStatePage from '../pages/DatabaseStatePage';
import PostgresParamsPage from '../pages/PostgresParamsPage';
import LocksTransactionsPage from '../pages/LocksTransactionsPage';
import IndexesPage from '../pages/IndexesPage';

const DASHBOARD_KEYS = [
    'dashboard-db-state',
    'dashboard-postgres-params',
    'dashboard-locks-transactions',
    'dashboard-indexes',
];

const AppLayout: React.FC = () => {
    const [activePage, setActivePage] = useState<PageName>('db-state');
    const [isExporting, setIsExporting] = useState(false);

    const handleResetLayout = useCallback(() => {
        DASHBOARD_KEYS.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    }, []);

    const dbStateRef = useRef<HTMLDivElement>(null);
    const paramsRef = useRef<HTMLDivElement>(null);
    const locksRef = useRef<HTMLDivElement>(null);
    const indexesRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = useCallback(async () => {
        const refMap: Record<PageName, React.RefObject<HTMLDivElement | null>> = {
            'db-state':           dbStateRef,
            'postgres-params':    paramsRef,
            'locks-transactions': locksRef,
            'indexes':            indexesRef,
        };
        const currentRef = refMap[activePage];
        if (!currentRef?.current) return;
        setIsExporting(true);
        try {
            await exportToPdf(currentRef.current, `report-${activePage}.pdf`);
        } finally {
            setIsExporting(false);
        }
    }, [activePage]);

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
                <main className="app-content">
                    {activePage === 'db-state' && (
                        <div ref={dbStateRef}><DatabaseStatePage /></div>
                    )}
                    {activePage === 'postgres-params' && (
                        <div ref={paramsRef}><PostgresParamsPage /></div>
                    )}
                    {activePage === 'locks-transactions' && (
                        <div ref={locksRef}><LocksTransactionsPage /></div>
                    )}
                    {activePage === 'indexes' && (
                        <div ref={indexesRef}><IndexesPage /></div>
                    )}
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
