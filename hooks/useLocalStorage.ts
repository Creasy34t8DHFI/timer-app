// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Stan do przechowywania wartości
  // Przekazujemy funkcję inicjalizującą do useState, aby wartość była pobierana 
  // z localStorage tylko raz podczas montowania komponentu
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Sprawdź, czy w localStorage jest już zapisana wartość
      const item = window.localStorage.getItem(key);
      // Rozparsuj zapisany JSON lub zwróć initialValue, jeśli localStorage jest pusty
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // W przypadku błędu, zwróć wartość początkową
      console.log(error);
      return initialValue;
    }
  });
  
  // Funkcja aktualizująca wartość w localStorage i w stanie
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Sprawdź, czy value jest funkcją, aby zachować ten sam interfejs, co useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Zapisz w stanie
      setStoredValue(valueToStore);
      // Zapisz w localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  // Obsługa zmian w localStorage z innych miejsc (np. z innych zakładek)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  return [storedValue, setValue] as const;
}