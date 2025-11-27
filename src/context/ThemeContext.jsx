import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. بنشوف لو المستخدم كان مختار وضع معين قبل كدة
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            // لو مفيش اختيار سابق، بنخليه 'dark' هو الافتراضي
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark'; // وهنا كمان احتياطي
    });

    // 2. كل ما الـ theme يتغير، بنحدث الـ HTML class
    useEffect(() => {
        const root = window.document.documentElement;
        
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);