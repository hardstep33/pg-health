import React, { useState, useCallback } from 'react';
import Card from '../Card/Card';
import { useDashboardLayout, WidgetInfo } from '../../hooks/useDashboardLayout';
import './draggable-dashboard.css';

interface DraggableDashboardProps {
    storageKey: string;
    widgets: WidgetInfo[];
}

type DropTarget = { id: string; position: 'before' | 'after' } | null;

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({ storageKey, widgets }) => {
    const { order, sizes, moveWidget, moveUp, moveDown, updateWidgetSize } = useDashboardLayout(storageKey, widgets);
    const [dropTarget, setDropTarget] = useState<DropTarget>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        requestAnimationFrame(() => setDraggingId(id));
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingId(null);
        setDropTarget(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position: 'before' | 'after' = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
        setDropTarget(prev => prev?.id === id && prev?.position === position ? prev : { id, position });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== targetId) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const position: 'before' | 'after' = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
            moveWidget(draggedId, targetId, position);
        }
        setDropTarget(null);
        setDraggingId(null);
    }, [moveWidget]);

    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    const widgetMap = Object.fromEntries(widgets.map(w => [w.id, w]));

    return (
        <div className="dashboard">
            {order.map(id => {
                const widget = widgetMap[id];
                if (!widget) return null;
                const isFullWidth = !!widget.fullWidth;
                const posInOrder = order.indexOf(id);
                return (
                    <Card
                        key={id}
                        id={id}
                        title={widget.title}
                        tooltip={widget.tooltip}
                        initialSize={sizes[id]}
                        onDragStart={handleDragStart}
                        onDragOver={(e) => handleDragOver(e, id)}
                        onDrop={handleDrop}
                        onDragLeave={handleDragLeave}
                        onDragEnd={handleDragEnd}
                        onResize={updateWidgetSize}
                        onReload={widget.onReload}
                        isLoading={widget.isLoading}
                        isDropBefore={dropTarget?.id === id && dropTarget?.position === 'before' && draggingId !== id}
                        isDropAfter={dropTarget?.id === id && dropTarget?.position === 'after' && draggingId !== id}
                        isDragging={draggingId === id}
                        fullWidth={isFullWidth}
                        canMoveUp={posInOrder > 0}
                        canMoveDown={posInOrder < order.length - 1}
                        onMoveUp={() => moveUp(id)}
                        onMoveDown={() => moveDown(id)}
                    >
                        {widget.component}
                    </Card>
                );
            })}
        </div>
    );
};

export default DraggableDashboard;
