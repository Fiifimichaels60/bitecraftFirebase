
'use client';

import Papa from 'papaparse';

/**
 * Converts an array of objects to a CSV string and initiates a download.
 * @param data The array of objects to convert.
 * @param filename The name of the file to be downloaded (without extension).
 */
export function downloadCsv<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn("No data provided to downloadCsv function.");
    return;
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
