export const runAsync = (f: () => any) => setTimeout(f, 0);

export const emptyPromise = (): Promise<null> => new Promise((resolve => resolve(null)));
export const emptyPromiseWithValue = <T>(value: T): Promise<T> => new Promise((resolve => resolve(value)));

// Filter characters to prevent SQL injection
export const sanitizeQueryParameter = (value: string): string => {
    return value.replace(/[^0-9a-zA-Z-.()]/g, '');
};

export const plural = (text: string, count: number, pluralExtension = "s") =>
    count == 1 || count == -1 ? text : text + pluralExtension

export function dateFrom(date: Date | string): Date {
    if (typeof date === "string") {
        return new Date(date);
    }
    return date;
}

export function format(date: Date | string | undefined, _format: string) {
    if (date === undefined) {
        return "";
    }

    date = dateFrom(date);

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return _format
        .replace(/%dddd/g, days[date.getUTCDay()])
        .replace(/%dd/g, date.getUTCDate().toString().padStart(2, "0"))
        .replace(/%d/g, date.getUTCDate().toString())
        .replace(/%mm/g, (date.getUTCMonth() + 1).toString().padStart(2, "0"))
        .replace(/%m/g, (date.getUTCMonth() + 1).toString())
        .replace(/%YYYY/g, date.getUTCFullYear().toString())
        .replace(/%YY/g, (date.getUTCFullYear() % 100).toString())
        .replace(/%Y/g, date.getUTCFullYear().toString())
        .replace(/%HH/g, date.getUTCHours().toString().padStart(2, "0"))
        .replace(/%H/g, date.getUTCHours().toString())
        .replace(/%MM/g, date.getUTCMinutes().toString().padStart(2, "0"))
        .replace(/%M/g, date.getUTCMinutes().toString())
        .replace(/%SS/g, date.getUTCSeconds().toString().padStart(2, "0"))
        .replace(/%S/g, date.getUTCSeconds().toString())
        .replace(/%f/g, date.getUTCMilliseconds().toString().padStart(3, "0"));
}

export const formatDateToWords = (date: Date | string | undefined, defaultFormat: string) => {
    if (date === undefined) {
        return "unknown";
    }

    const now = new Date();
    date = dateFrom(date);
    if (isToday(now, date)) {
        return "today";
    } else if (isTomorrow(now, date)) {
        return "tomorrow";
    } else if (isYesterday(now, date)) {
        return "yesterday";
    }
    return format(date, defaultFormat);
};

export const isToday = (ref: Date, date: Date): boolean => {
    return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth() && date.getDate() === ref.getDate();
};

export const isTomorrow = (ref: Date, date: Date): boolean => {
    return isToday(new Date(ref.getTime() + 24 * 60 * 60 * 1000), date);
};

export const isYesterday = (ref: Date, date: Date): boolean => {
    return isToday(new Date(ref.getTime() - 24 * 60 * 60 * 1000), date);
};

export const isUpcomingWeek = (ref: Date, date: Date): boolean => {
    if (isToday(ref, date)) {
        return true;
    }

    if (date.getTime() < ref.getTime()) {
        return false;
    }

    const weekEndDate = new Date(ref.getTime() + 7 * 24 * 60 * 60 * 1000);
    weekEndDate.setHours(0);
    weekEndDate.setMinutes(0);
    weekEndDate.setSeconds(0);
    weekEndDate.setMilliseconds(0);

    return date.getTime() < weekEndDate.getTime();
};

export const getPreviousDay = (ref: Date): Date => new Date(ref.getTime() - 24 * 60 * 60 * 1000);
export const getNextDay = (ref: Date): Date => new Date(ref.getTime() + 24 * 60 * 60 * 1000);

export const unique = <T>(value: T, index: number, array: T[]) => array.indexOf(value) === index
