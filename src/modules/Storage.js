// Modul pre prácu s localStorage
const STORAGE_KEY = 'todoApp';

export const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Chyba pri ukladaní do localStorage:', error);
    }
};

export const loadFromStorage = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Chyba pri načítavaní z localStorage:', error);
        return null;
    }
};

export const clearStorage = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Chyba pri mazaní localStorage:', error);
    }
};
