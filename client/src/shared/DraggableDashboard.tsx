import React, { useState } from 'react';
import Card from './Card';
import { useDashboardLayout, WidgetInfo } from '../hooks/useDashboardLayout';

interface DraggableDashboardProps {
    storageKey: string;
    widgets: WidgetInfo[];
}

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({ storageKey, widgets }) => {
    const { order, sizes, moveWidget, updateWidgetSize } = useDashboardLayout(storageKey, widgets);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId !== targetId) {
            moveWidget(draggedId, targetId);
        }
        setDragOverId(null);
    };

    const handleDragEnter = (id: string) => {
        setDragOverId(id);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const widgetMap = Object.fromEntries(widgets.map(w => [w.id, w]));

    return (
        <div className="dashboard">
            {order.map(id => {
                const widget = widgetMap[id];
                if (!widget) return null;
                const isFullWidth = widget.fullWidth && !sizes[id];
                return (
                    <Card
                        key={id}
                        id={id}
                        title={widget.title}
                        tooltip={widget.tooltip}
                        initialSize={sizes[id]}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnter={() => handleDragEnter(id)}
                        onDragLeave={handleDragLeave}
                        onResize={updateWidgetSize}
                        onReload={widget.onReload}
                        isLoading={widget.isLoading}
                        isDragOver={dragOverId === id}
                        fullWidth={isFullWidth}
                    >
                        {widget.component}
                    </Card>
                );
            })}
        </div>
    );
};

export default DraggableDashboard;