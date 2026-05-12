import React, { useEffect, useState } from 'react';

const themes = [
    { id: 'visual-studio', label: 'Visual Studio' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'high-contrast', label: 'High Contrast' },
    { id: 'ios', label: 'iOS' },
] as const;

type ThemeId = typeof themes[number]['id'];

const STORAGE_KEY = 'app-theme';

function getStoredTheme(): ThemeId {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && themes.some(t => t.id === stored)) {
            return stored as ThemeId;
        }
    } catch {
        // ignore
    }
    return 'visual-studio';
}

function storeTheme(id: ThemeId) {
    localStorage.setItem(STORAGE_KEY, id);
}

function applyTheme(id: ThemeId) {
    document.documentElement.setAttribute('data-theme', id);
}

const ThemeSwitcher: React.FC = () => {
    const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);
        storeTheme(theme);
    }, [theme]);

    return (
        <div className="theme-switcher">
            <label htmlFor="theme-select" className="theme-switcher-label">
                Тема:&nbsp;
            </label>
            <select
                id="theme-select"
                className="theme-switcher-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
            >
                {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ThemeSwitcher;