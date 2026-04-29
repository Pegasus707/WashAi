export const getCurrencySymbol = (currencyStr: string) => {
  if (currencyStr.includes('USD')) return '$';
  if (currencyStr.includes('EUR')) return '€';
  if (currencyStr.includes('GBP')) return '£';
  if (currencyStr.includes('CAD')) return 'C$';
  return '₹'; // Default to INR
}

export const formatCurrency = (amountInINR: number, targetCurrency: string) => {
  // Hardcoded exchange rates relative to INR for demonstration purposes
  const rates: Record<string, number> = {
    'USD ($)': 1 / 83.5,
    'EUR (€)': 1 / 90.2,
    'GBP (£)': 1 / 105.4,
    'CAD ($)': 1 / 61.2,
    'INR (₹)': 1
  };

  const rate = rates[targetCurrency] || 1;
  const converted = amountInINR * rate;
  const symbol = getCurrencySymbol(targetCurrency);
  
  return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
