import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SavedElement {
    el: HTMLElement;
    styles: Record<string, string>;
}

function prepareContainer(container: HTMLElement): () => void {
    const saved: SavedElement[] = [];

    const widgets = container.querySelectorAll<HTMLElement>('.widget');
    const bodies = container.querySelectorAll<HTMLElement>('.widget-body');
    const wrappers = container.querySelectorAll<HTMLElement>('.table-wrapper');

    widgets.forEach(el => {
        const styles: Record<string, string> = {
            height: el.style.height,
            width: el.style.width,
            overflow: el.style.overflow,
        };
        saved.push({ el, styles });
        el.style.height = 'auto';
        el.style.width = 'auto';
        el.style.overflow = 'visible';
    });

    bodies.forEach(el => {
        const styles: Record<string, string> = {
            overflow: el.style.overflow,
            maxHeight: el.style.maxHeight,
        };
        saved.push({ el, styles });
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
    });

    wrappers.forEach(el => {
        const styles: Record<string, string> = {
            overflow: el.style.overflow,
            maxHeight: el.style.maxHeight,
        };
        saved.push({ el, styles });
        el.style.overflow = 'visible';
        el.style.maxHeight = 'none';
    });

    return () => {
        saved.forEach(({ el, styles }) => {
            Object.entries(styles).forEach(([prop, value]) => {
                if (value) {
                    el.style.setProperty(prop, value);
                } else {
                    el.style.removeProperty(prop);
                }
            });
        });
    };
}

export async function exportToPdf(container: HTMLElement, filename: string = 'report.pdf') {
    const restore = prepareContainer(container);

    // Даём браузеру перерисовать макет
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // 1. Рендерим canvas. Уменьшаем scale до 1.5 для снижения размера.
        const canvas = await html2canvas(container, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#EEEEF2',
            windowHeight: container.scrollHeight,
            windowWidth: container.scrollWidth,
        });

        // 2. Создаём PDF альбомной ориентации A4
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // 3. Если изображение шире страницы, масштабируем по ширине
        let scaleFactor = pageWidth / imgWidth;
        const scaledHeight = imgHeight * scaleFactor;

        // 4. Если после масштабирования по ширине изображение всё ещё выше страницы,
        //    будем нарезать его на полосы и добавлять новые страницы
        if (scaledHeight <= pageHeight) {
            // Всё помещается на одной странице
            const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG со сжатием
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, scaledHeight);
        } else {
            // Нужно несколько страниц: разрезаем исходное изображение по высоте
            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            let remainingHeight = imgHeight;
            let srcY = 0;

            while (remainingHeight > 0) {
                // Высота куска canvas, который поместится на одну страницу
                const sliceHeight = Math.min(remainingHeight, pageHeight / scaleFactor);

                // Создаём временный canvas для фрагмента
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = imgWidth;
                sliceCanvas.height = sliceHeight;
                const ctx = sliceCanvas.getContext('2d')!;
                ctx.drawImage(canvas, 0, srcY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);

                const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.85);
                pdf.addImage(sliceData, 'JPEG', 0, 0, pageWidth, sliceHeight * scaleFactor);

                srcY += sliceHeight;
                remainingHeight -= sliceHeight;

                if (remainingHeight > 0) {
                    pdf.addPage();
                }
            }
        }

        pdf.save(filename);
    } finally {
        restore();
    }
}