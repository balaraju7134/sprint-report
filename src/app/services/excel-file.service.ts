import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { TableColumn } from '../model/table.model';

export interface ExcelSheetData<T> {
 name: string;
 data: T[];
}

@Injectable({ providedIn: 'root' })
export class ExcelFileService {

 /**
  * Converts the first sheet of a single Excel file to JSON.
  */
 async convertExcelToJson<T = any>(
  file: File
 ): Promise<T[]> {
  try {
   const arrayBuffer = await file.arrayBuffer();

   const workbook = XLSX.read(arrayBuffer, {
    type: 'array'
   });

   const sheetName = workbook.SheetNames[0];

   if (!sheetName) {
    return [];
   }

   const worksheet = workbook.Sheets[sheetName];

   return XLSX.utils.sheet_to_json<T>(
    worksheet,
    {
     defval: null,
     raw: false
    }
   );
  } catch (error) {
   console.error(
    'Error reading Excel file:',
    error
   );

   throw error;
  }
 }

 /**
  * Converts multiple Excel files to one combined JSON array.
  *
  * Only the first sheet from each file is read.
  */
 async convertMultipleExcelToJson<T = any>(
  files: File[]
 ): Promise<T[]> {
  const result: T[] = [];

  for (const file of files) {
   const data =
    await this.convertExcelToJson<T>(file);

   result.push(...data);
  }

  return result;
 }

 /**
  * Converts all sheets from a single Excel file to JSON.
  */
 async convertAllSheetsToJson<T = any>(
  file: File
 ): Promise<Record<string, T[]>> {
  try {
   const arrayBuffer = await file.arrayBuffer();

   const workbook = XLSX.read(arrayBuffer, {
    type: 'array'
   });

   const result: Record<string, T[]> = {};

   workbook.SheetNames.forEach(sheetName => {
    result[sheetName] =
     XLSX.utils.sheet_to_json<T>(
      workbook.Sheets[sheetName],
      {
       defval: null,
       raw: false
      }
     );
   });

   return result;
  } catch (error) {
   console.error(
    'Error reading Excel sheets:',
    error
   );

   throw error;
  }
 }

 /**
  * Export a single dataset to an Excel file.
  */
 exportToExcel<T>(
  data: T[],
  columns: TableColumn<T>[],
  fileName = 'export.xlsx',
  sheetName = 'Report'
 ): void {
  try {
   const worksheet =
    this.createWorksheet(
     data,
     columns
    );

   const workbook =
    XLSX.utils.book_new();

   XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    this.getSafeSheetName(
     sheetName,
     0
    )
   );

   XLSX.writeFile(
    workbook,
    fileName
   );
  } catch (error) {
   console.error(
    'Error exporting Excel file:',
    error
   );

   throw error;
  }
 }

 /**
  * Export multiple datasets into one Excel workbook.
  *
  * Each dataset gets its own worksheet/tab.
  */
 exportMultipleSheets<T>(
  sheets: ExcelSheetData<T>[],
  columns: TableColumn<T>[],
  fileName = 'export.xlsx'
 ): void {
  try {
   const workbook =
    XLSX.utils.book_new();

   sheets.forEach((sheet, index) => {
    const worksheet =
     this.createWorksheet(
      sheet.data,
      columns
     );

    const sheetName =
     this.getSafeSheetName(
      sheet.name,
      index
     );

    XLSX.utils.book_append_sheet(
     workbook,
     worksheet,
     sheetName
    );
   });

   XLSX.writeFile(
    workbook,
    fileName
   );
  } catch (error) {
   console.error(
    'Error exporting multiple Excel sheets:',
    error
   );

   throw error;
  }
 }

 /**
  * Creates a worksheet:
  *
  * Row 1 -> Headers
  * Row 2+ -> Data
  */
 private createWorksheet<T>(
  data: T[],
  columns: TableColumn<T>[]
 ): XLSX.WorkSheet {

  const excelData =
   data.map(row => {
    const excelRow:
     Record<string, unknown> = {};

    columns.forEach(column => {
     excelRow[column.label] =
      row[column.key];
    });

    return excelRow;
   });

  const worksheet =
   XLSX.utils.json_to_sheet(
    excelData
   );

  /**
   * Auto-size columns.
   */
  worksheet['!cols'] =
   columns.map(column => {
    const headerLength =
     String(
      column.label ?? ''
     ).length;

    const maxContentLength =
     data.reduce(
      (max, row) => {
       const value =
        row[column.key];

       if (
        value === null ||
        value === undefined
       ) {
        return max;
       }

       let displayValue: string;

       if (
        value instanceof Date
       ) {
        displayValue =
         value.toLocaleDateString();
       } else if (
        typeof value === 'object'
       ) {
        displayValue =
         JSON.stringify(value);
       } else {
        displayValue =
         String(value);
       }

       return Math.max(
        max,
        displayValue.length
       );
      },
      0
     );

    const calculatedWidth =
     Math.max(
      headerLength,
      maxContentLength
     ) + 2;

    return {
     wch: Math.min(
      Math.max(
       calculatedWidth,
       10
      ),
      40
     )
    };
   });

  /**
   * Header styling.
   */
  columns.forEach(
   (_, columnIndex) => {
    const cellAddress =
     XLSX.utils.encode_cell({
      r: 0,
      c: columnIndex
     });

    const cell =
     worksheet[cellAddress];

    if (cell) {
     cell.s = {
      fill: {
       patternType: 'solid',
       fgColor: {
        rgb: '1F4E78'
       }
      },
      font: {
       bold: true,
       color: {
        rgb: 'FFFFFF'
       }
      },
      alignment: {
       horizontal: 'center',
       vertical: 'center'
      }
     };
    }
   }
  );

  /**
   * Header row height.
   */
  worksheet['!rows'] = [
   {
    hpt: 25
   }
  ];

  return worksheet;
 }

 /**
  * Excel worksheet names:
  *
  * - Maximum 31 characters
  * - Cannot contain \ / ? * [ ] :
  */
 private getSafeSheetName(
  name: string,
  index: number
 ): string {
  const cleanedName =
   name
    .replace(
     /[\\/?*[\]:]/g,
     ''
    )
    .trim();

  const fallback =
   `Team ${index + 1}`;

  return (
   cleanedName || fallback
  ).substring(0, 31);
 }
}