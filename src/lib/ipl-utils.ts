import { differenceInMonths, startOfMonth, format, parse, isValid, parseISO } from "date-fns";

/**
 * Calculates unpaid periods (yyyy-MM) from registration date to now.
 * @param registrationDate ISO date string (YYYY-MM-DD)
 * @param paidPeriods List of periods already paid
 */
export const calculateUnpaidPeriods = (registrationDate: string, paidPeriods: string[]): string[] => {
    if (!registrationDate) return [];

    const now = new Date();
    const parsedDate = parseISO(registrationDate);
    if (!isValid(parsedDate)) {
        console.error("Invalid registration date:", registrationDate);
        return [];
    }

    const startMonth = startOfMonth(parsedDate);
    const currentMonth = startOfMonth(now);

    const unpaidPeriods: string[] = [];

    let iterDate = startMonth;
    // Safety break: max 20 years
    let safetyCounter = 0;
    while (iterDate <= currentMonth && safetyCounter < 240) {
        const periodStr = format(iterDate, "yyyy-MM");
        if (!paidPeriods.includes(periodStr)) {
            unpaidPeriods.push(periodStr);
        }

        // Increment by 1 month
        iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 1);
        safetyCounter++;
    }

    return unpaidPeriods;
};

/**
 * Gets the list of periods (yyyy-MM) that will be covered by a given payment amount.
 * Starts from the oldest unpaid period.
 */
export const getNextPeriodsToPay = (
    amount: number,
    monthlyAmount: number,
    registrationDate: string,
    paidPeriods: string[]
): string[] => {
    if (monthlyAmount <= 0 || amount < monthlyAmount) return [];

    const startMonth = startOfMonth(parseISO(registrationDate));
    const periodsToPay: string[] = [];
    let remainingAmount = amount;

    let iterDate = startMonth;
    // Safety break to prevent infinite loop (10 years / 120 months)
    let safetyCounter = 0;

    while (remainingAmount >= monthlyAmount && safetyCounter < 120) {
        const periodStr = format(iterDate, "yyyy-MM");

        if (!paidPeriods.includes(periodStr)) {
            periodsToPay.push(periodStr);
            remainingAmount -= monthlyAmount;
        }

        // Increment by 1 month
        iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 1);
        safetyCounter++;
    }

    return periodsToPay;
};

/**
 * Gets the total IPL amount due based on unpaid months.
 * @param monthlyAmount Individual month IPL price
 * @param unpaidCount Number of unpaid months
 */
export const calculateTotalIplDue = (monthlyAmount: number, unpaidCount: number): number => {
    return monthlyAmount * unpaidCount;
};
