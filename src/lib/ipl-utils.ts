import { differenceInMonths, startOfMonth, format, parse, isValid } from "date-fns";

/**
 * Calculates the total months between startDate and now that haven't been paid.
 * @param createdAt The date the resident was created (start of obligation)
 * @param paidPeriods Array of periods already paid in 'yyyy-MM' format
 * @returns Array of unpaid periods in 'yyyy-MM' format
 */
export const calculateUnpaidPeriods = (createdAt: Date, paidPeriods: string[]): string[] => {
    const now = new Date();
    const startMonth = startOfMonth(createdAt);
    const currentMonth = startOfMonth(now);

    const unpaidPeriods: string[] = [];

    let iterDate = startMonth;
    while (iterDate <= currentMonth) {
        const periodStr = format(iterDate, "yyyy-MM");
        if (!paidPeriods.includes(periodStr)) {
            unpaidPeriods.push(periodStr);
        }

        // Increment by 1 month
        iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 1);
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
    createdAt: Date,
    paidPeriods: string[]
): string[] => {
    if (monthlyAmount <= 0 || amount < monthlyAmount) return [];

    const startMonth = startOfMonth(createdAt);
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
