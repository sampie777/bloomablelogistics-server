
export const runAsync = (f: () => any) => setTimeout(f, 0);

export const emptyPromise = (): Promise<null> => new Promise((resolve => resolve(null)));
export const emptyPromiseWithValue = <T>(value: T): Promise<T> => new Promise((resolve => resolve(value)));

// Filter characters to prevent SQL injection
export const sanitizeQueryParameter = (value: string): string => {
    return value.replace(/[^0-9a-zA-Z-.()]/g, '');
};
