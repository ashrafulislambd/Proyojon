import { format, isValid } from 'date-fns';

/**
 * Safely formats a date, preventing RangeError: Invalid time value.
 * @param date The date string, Date object, or null/undefined value to format.
 * @param formatStr The desired format string (default: 'MMM dd, yyyy').
 * @returns The formatted date string, 'N/A' for null/undefined, or 'Invalid Date' for malformed inputs.
 */
export function formatDate(date: string | Date | null | undefined, formatStr: string = 'MMM dd, yyyy'): string {
    if (!date) return 'N/A';

    const d = new Date(date);

    if (!isValid(d)) {
        console.warn('Invalid date encountered:', date);
        return 'Invalid Date';
    }

    try {
        return format(d, formatStr);
    } catch (err) {
        console.error('Error formatting date:', err, { date, formatStr });
        return 'Invalid Date';
    }
}
