import React, { useRef, useLayoutEffect, useEffect, useCallback, useState } from 'react';
import { MdDragIndicator, MdRefresh, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import './card.css';

const DragIcon    = MdDragIndicator    as React.FC;
const RefreshIcon = MdRefresh          as React.FC;
const ArrowUpIcon = MdKeyboardArrowUp  as React.FC;
const ArrowDownIcon = MdKeyboardArrowDown as React.FC;

interface CardProps {
    id: string;
    title: string;
    tooltip?: string;
    children: React.ReactNode;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, id: string) => void;
    onDragLeave?: () => void;
    onDragEnd?: () => void;
    onResize: (id: string, width: number, height: number) => void;
    onReload?: () => void;
    isLoading?: boolean;
    initialSize?: { width: number; height: number };
    isDropBefore?: boolean;
    isDropAfter?: boolean;
    isDragging?: boolean;
    fullWidth?: boolean;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

const Card: React.FC<CardProps> = ({
    id,
    title,
    tooltip,
    children,
    onDragStart,
    onDragOver,
    onDrop,
    onDragLeave,
    onDragEnd,
    onResize,
    onReload,
    isLoading = false,
    initialSize,
    isDropBefore = false,
    isDropAfter = false,
    isDragging = false,
    fullWidth = false,
    canMoveUp = false,
    canMoveDown = false,
    onMoveUp,
    onMoveDown,
}) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const skipResizeRef = useRef(false);
    const lastSizeRef = useRef<{ width: number; height: number } | null>(null);

    useLayoutEffect(() => {
        const el = widgetRef.current;
        if (!el) return;

        if (initialSize) {
            if (!fullWidth) {
                el.style.width = `${initialSize.width}px`;
            }
            el.style.height = `${initialSize.height}px`;
            lastSizeRef.current = { ...initialSize };
        }

        skipResizeRef.current = true;
        const timeout = setTimeout(() => {
            skipResizeRef.current = false;
        }, 200);

        return () => clearTimeout(timeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = widgetRef.current;
        if (!el) return;

        let timer: ReturnType<typeof setTimeout> | null = null;

        const observer = new ResizeObserver(entries => {
            if (skipResizeRef.current) return;

            const { width, height } = entries[0].contentRect;
            const roundedWidth = Math.round(width);
            const roundedHeight = Math.round(height);

            if (
                lastSizeRef.current &&
                Math.abs(roundedWidth - lastSizeRef.current.width) <= 1 &&
                Math.abs(roundedHeight - lastSizeRef.current.height) <= 1
            ) {
                return;
            }

            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                onResize(id, roundedWidth, roundedHeight);
                lastSizeRef.current = { width: roundedWidth, height: roundedHeight };
            }, 300);
        });

        observer.observe(el);
        return () => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
        };
    }, [id, onResize]);

    const handleHeaderDragStart = useCallback(
        (e: React.DragEvent) => {
            e.dataTransfer.setData('text/plain', id);
            onDragStart(e, id);
        },
        [id, onDragStart]
    );

    // Only fire onDragLeave when truly leaving the widget (not just moving to a child element)
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            onDragLeave?.();
        }
    }, [onDragLeave]);

    const handleReload = (e: React.MouseEvent) => {
        e.stopPropagation();
        onReload?.();
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (!tooltip) return;
        setShowTooltip(true);
        updateTooltipPosition(e);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!tooltip || !showTooltip) return;
        updateTooltipPosition(e);
    };
    const handleMouseLeave = () => {
        setShowTooltip(false);
        setTooltipPos(null);
    };
    const updateTooltipPosition = (e: React.MouseEvent) => {
        setTooltipPos({ x: e.clientX + 15, y: e.clientY - 10 });
    };

    const classes = [
        'widget',
        isDragging   ? 'is-dragging'       : '',
        isDropBefore ? 'drop-before'       : '',
        isDropAfter  ? 'drop-after'        : '',
        fullWidth    ? 'widget-full-width' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={widgetRef}
            className={classes}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, id)}
            onDragLeave={handleDragLeave}
        >
            <div className="widget-header">
                <span
                    className="widget-drag-handle"
                    draggable
                    onDragStart={handleHeaderDragStart}
                    onDragEnd={onDragEnd}
                    title="Перетащить"
                >
                    <DragIcon />
                </span>
                <span
                    className="title"
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    {title}
                </span>
                <div className="widget-order-btns">
                    <button
                        className="widget-order-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
                        title="Переместить вверх"
                        disabled={!canMoveUp}
                    >
                        <ArrowUpIcon />
                    </button>
                    <button
                        className="widget-order-btn"
                        onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
                        title="Переместить вниз"
                        disabled={!canMoveDown}
                    >
                        <ArrowDownIcon />
                    </button>
                </div>
                {onReload && (
                    <button
                        className="widget-reload-btn"
                        onClick={handleReload}
                        title="Обновить данные"
                        disabled={isLoading}
                    >
                        <RefreshIcon />
                    </button>
                )}
            </div>
            <div className="widget-body">
                {children}
                {isLoading && (
                    <div className="widget-loading-overlay">
                        <div className="widget-spinner"></div>
                    </div>
                )}
            </div>
            {showTooltip && tooltip && tooltipPos && (
                <div
                    className="custom-tooltip"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    dangerouslySetInnerHTML={{ __html: tooltip }}
                />
            )}
        </div>
    );
};

export default Card;
