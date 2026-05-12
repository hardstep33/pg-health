import React, { useRef, useLayoutEffect, useEffect, useCallback, useState } from 'react';

interface CardProps {
    id: string;
    title: string;
    tooltip?: string;
    children: React.ReactNode;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, id: string) => void;
    onDragEnter?: () => void;
    onDragLeave?: () => void;
    onResize: (id: string, width: number, height: number) => void;
    onReload?: () => void;
    isLoading?: boolean;
    initialSize?: { width: number; height: number };
    isDragOver?: boolean;
    fullWidth?: boolean;
}

const Card: React.FC<CardProps> = ({
                                       id,
                                       title,
                                       tooltip,
                                       children,
                                       onDragStart,
                                       onDragOver,
                                       onDrop,
                                       onDragEnter,
                                       onDragLeave,
                                       onResize,
                                       onReload,
                                       isLoading = false,
                                       initialSize,
                                       isDragOver = false,
                                       fullWidth = false,
                                   }) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    // Флаг, запрещающий отправлять изменения при первичной отрисовке
    const skipResizeRef = useRef(false);
    // Последний сохранённый размер, чтобы не слать дубли
    const lastSizeRef = useRef<{ width: number; height: number } | null>(null);

    // Применяем сохранённые размеры один раз при монтировании
    useLayoutEffect(() => {
        const el = widgetRef.current;
        if (!el) return;

        if (initialSize) {
            el.style.width = `${initialSize.width}px`;
            el.style.height = `${initialSize.height}px`;
            lastSizeRef.current = { ...initialSize };
        }

        // Запрещаем ResizeObserver реагировать на это изменение
        skipResizeRef.current = true;
        const timeout = setTimeout(() => {
            skipResizeRef.current = false;
        }, 200);

        return () => clearTimeout(timeout);
    }, []); // только при монтировании

    // ResizeObserver для сохранения размеров, изменённых пользователем
    useEffect(() => {
        const el = widgetRef.current;
        if (!el) return;

        let timer: ReturnType<typeof setTimeout> | null = null;

        const observer = new ResizeObserver(entries => {
            if (skipResizeRef.current) return;

            const { width, height } = entries[0].contentRect;
            const roundedWidth = Math.round(width);
            const roundedHeight = Math.round(height);

            // Игнорируем, если размер совпадает с последним применённым
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

    // Остальные методы без изменений
    const handleHeaderDragStart = useCallback(
        (e: React.DragEvent) => {
            e.dataTransfer.setData('text/plain', id);
            onDragStart(e, id);
        },
        [id, onDragStart]
    );

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

    return (
        <div
            ref={widgetRef}
            className={`widget ${isDragOver ? 'drag-over' : ''} ${fullWidth ? 'widget-full-width' : ''}`}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, id)}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
        >
            <div
                className="widget-header"
                draggable
                onDragStart={handleHeaderDragStart}
            >
                <button
                    className="widget-reload-btn"
                    onClick={handleReload}
                    title="Обновить данные"
                    disabled={isLoading}
                >
                    {isLoading ? '⏳' : '↻'}
                </button>
                <span
                    className="title"
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
          {title}
        </span>
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