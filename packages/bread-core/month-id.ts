const isValidMonthId = (date: string) => {
    return /^\d{4}(0[1-9]|1[0-2])$/.test(date)
}

export const toMonthId = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
}

export const getCurrentMonthId = (): string => {
    return toMonthId(new Date());
}

export const shiftMonth = (date: string, delta: number): string => {
    if (!isValidMonthId(date)) {
        throw new Error("date should be of the format YYYYMM");
    }

    const year = parseInt(date.slice(0, 4), 10);
    const month = parseInt(date.slice(4, 6), 10) - 1;
    return toMonthId(new Date(year, month + delta, 1));
};

export const getPreviousMonthId = (date: string = getCurrentMonthId()): string => {
    return shiftMonth(date, -1);
}


export const getNextMonthId = (date: string = getCurrentMonthId()): string => {
    return shiftMonth(date, 1);
}