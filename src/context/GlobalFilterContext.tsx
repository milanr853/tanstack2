// GlobalFilterContext.tsx
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface GlobalFilterContextType {
    globalFilter: string;
    setGlobalFilter: Dispatch<SetStateAction<string>>;
}

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const useGlobalFilter = (): GlobalFilterContextType => {
    const context = useContext(GlobalFilterContext);
    if (!context) {
        throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
    }
    return context;
};

interface GlobalFilterProviderProps {
    children: ReactNode;
}

export const GlobalFilterProvider: React.FC<GlobalFilterProviderProps> = ({ children }) => {
    const [globalFilter, setGlobalFilter] = useState<string>('');

    return (
        <GlobalFilterContext.Provider value={{ globalFilter, setGlobalFilter }}>
            {children}
        </GlobalFilterContext.Provider>
    );
};
