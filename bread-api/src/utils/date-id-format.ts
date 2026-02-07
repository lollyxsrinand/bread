
/**
 * formats a date to YYYYMM format
 * @param date Date object
 * @returns `YYYYMM` string
 * 
 * takes in a Date object and returns a string in the format YYYYMM.
 */
export const formatDateId = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
}
export const getCurrentMonthId = (): string => {
    return formatDateId(new Date());
}

const shiftMonth = (date: string, delta: number): string => {
    const year = parseInt(date.slice(0, 4), 10);
    const month = parseInt(date.slice(4, 6), 10) - 1;
    return formatDateId(new Date(year, month + delta, 1));
  };

/**
 * gets previous month in YYYYMM format.
 * @param date (optional) if not provided, uses current date
 * @returns `previousMonthDate`
 * 
 * takes in a date string in YYYYMM format and returns the previous month in the same format.
 * if no date is provided, it uses the current date.
 */
export const getPreviousMonthId = (date: string = getCurrentMonthId()): string => {
    return shiftMonth(date, -1);
}

/**
 * gets next month in YYYYMM format
 * @param date (optional) if not provided, uses current date
 * @returns `nextMonthDate`
 * 
 * takes in a date string in YYYYMM format and returns the next month in the same format.
 * if no date is provided, it uses the current date
 */
export const getNextMonthId = (date: string = getCurrentMonthId()): string => {
    return shiftMonth(date, 1);
}