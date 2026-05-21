/* Кнопка экспорта в PDF */
import React from 'react';
import { MdPictureAsPdf } from 'react-icons/md';

const PdfIcon = MdPictureAsPdf as React.FC;

interface ExportButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onClick, disabled }) => (
    <button
        className="export-pdf-btn"
        onClick={onClick}
        disabled={disabled}
        title="Сохранить отчёт в PDF"
    >
        <span className="export-pdf-btn-icon"><PdfIcon /></span>
        Экспорт PDF
    </button>
);

export default ExportButton;
