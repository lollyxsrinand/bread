export const isValidMonthId = (date: string) => {
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

export const shiftMonth = (monthId: string, delta: number): string => {
    if (!isValidMonthId(monthId)) {
        throw new Error("monthId should be of the format YYYYMM");
    }

    const year = parseInt(monthId.slice(0, 4), 10);
    const month = parseInt(monthId.slice(4, 6), 10) - 1;
    return toMonthId(new Date(year, month + delta, 1));
};

export const getPreviousMonthId = (monthId: string = getCurrentMonthId()): string => {
    return shiftMonth(monthId, -1);
}

export const getNextMonthId = (monthId: string = getCurrentMonthId()): string => {
    return shiftMonth(monthId, 1);
}