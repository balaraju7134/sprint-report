import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelService {

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
}