import React, { useEffect, useState } from 'react';
import { colors } from '../components/AppColors/AppColors';
import { getAsyncData } from '../Utils/GetAsyncData';

export const ThemeContext = React.createContext<any>(null);

const ThemesContext = ({ children }: { children: React.ReactNode }) => {
    const [isMode, setIsMode] = useState('dark')

    useEffect(() => {
        const getIntialValues = async () => {
            try {
                const mode = await getAsyncData('isMode')
                if (mode) {
                    setIsMode(mode)
                }
            } catch (error) {
                console.error('Error getting theme mode:', error);
            }
        }

        getIntialValues()
    }, [])

    const theme = { colors: isMode == 'dark' ? colors.dark : colors.light };

    const values = {
        theme,
        isMode,
        setIsMode
    }

    return (
        <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>
    );
};

export default ThemesContext; 