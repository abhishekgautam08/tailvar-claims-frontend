/**
 * Formats a numeric rupee amount using Indian numbering system.
 * Example: 1000000 -> "₹10,00,000.00"
 *
 * @param {number|string} amount
 * @returns {string}
 */
export const formatMoney = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a calendar date "YYYY-MM-DD" into "DD Mon YYYY" (e.g. "15 May 2026").
 * Does NOT use `new Date("YYYY-MM-DD")` to avoid timezone offset shifts.
 *
 * @param {string} dateStr - Date string formatted as "YYYY-MM-DD"
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '—';

  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (monthIdx < 0 || monthIdx > 11 || isNaN(day)) {
    return dateStr;
  }

  const monthName = MONTH_NAMES[monthIdx];
  return `${day} ${monthName} ${year}`;
};

/**
 * Formats an ISO timestamp into a readable date and time.
 *
 * @param {string|Date} isoStr
 * @returns {string}
 */
export const formatDateTime = (isoStr) => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return '—';
  }
};

