import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { TableColumn } from '../model/table.model';

@Injectable({ providedIn: 'root' })
export class ExcelFileService {

 /**
  * Converts the first sheet of an Excel file to JSON.
  */
 async convertExcelToJson<T = any>(file: File): Promise<T[]> {
  try {
   const arrayBuffer = await file.arrayBuffer();

   const workbook = XLSX.read(arrayBuffer, {
    type: 'array'
   });

   const sheetName = workbook.SheetNames[0];
   const worksheet = workbook.Sheets[sheetName];

   return XLSX.utils.sheet_to_json<T>(worksheet, {
    defval: null,
    raw: false
   });
  } catch (error) {
   console.error('Error reading Excel file:', error);
   throw error;
  }
 }

 /**
  * Converts all sheets to JSON.
  */
 async convertAllSheetsToJson(file: File): Promise<Record<string, any[]>> {
  try {
   const arrayBuffer = await file.arrayBuffer();

   const workbook = XLSX.read(arrayBuffer, {
    type: 'array'
   });

   const result: Record<string, any[]> = {};

   workbook.SheetNames.forEach(sheetName => {
    result[sheetName] = XLSX.utils.sheet_to_json(
     workbook.Sheets[sheetName],
     {
      defval: null,
      raw: false
     }
    );
   });

   return result;
  } catch (error) {
   console.error('Error reading Excel file:', error);
   throw error;
  }
 }

 /**
  * Exports table data to Excel using the configured table columns.
  */
 exportToExcel<T>(
  data: T[],
  columns: TableColumn<T>[],
  fileName = 'export.xlsx',
  sheetName = 'Sheet1'
 ): void {
  try {
   const excelData = data.map(row => {
    const excelRow: Record<string, unknown> = {};

    columns.forEach(column => {
     excelRow[column.label] = row[column.key];
    });

    return excelRow;
   });

   const worksheet = XLSX.utils.json_to_sheet(excelData);

   // Auto-size columns
   worksheet['!cols'] = columns.map(column => {
    const headerLength = String(column.label ?? '').length;

    const maxContentLength = data.reduce((max, row) => {
     const value = row[column.key];

     if (value === null || value === undefined) {
      return max;
     }

     let displayValue: string;

     if (value instanceof Date) {
      displayValue = value.toLocaleDateString();
     } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
     } else {
      displayValue = String(value);
     }

     return Math.max(max, displayValue.length);
    }, 0);

    const calculatedWidth =
     Math.max(headerLength, maxContentLength) + 2;

    const MIN_WIDTH = 10;
    const MAX_WIDTH = 40;

    return {
     wch: Math.min(
      Math.max(calculatedWidth, MIN_WIDTH),
      MAX_WIDTH
     )
    };
   });

   // Header styling
   columns.forEach((_, index) => {
    const cellAddress = XLSX.utils.encode_cell({
     r: 0,
     c: index
    });

    const cell = worksheet[cellAddress];

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
   });

   // Header row height
   worksheet['!rows'] = [
    {
     hpt: 25
    }
   ];

   // Create workbook
   const workbook = XLSX.utils.book_new();

   XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
   );

   XLSX.writeFile(workbook, fileName);
  } catch (error) {
   console.error('Error exporting Excel file:', error);
   throw error;
  }
 }
}