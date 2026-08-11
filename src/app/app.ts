import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from './services/excel.service';
import { mapExcelWorkItems, mapExcelItemStatusTimelines } from './services/work-item.mapper';
import { ExcelWorkItem, WorkItem } from './model/work-item.model';
import { ExcelItemStatusTimeline, ItemStatusTimeline } from './model/work-item-status.model';
import { TableColumn, TableData } from './model/table.model';
import { transformWorkItems } from './services/table.util';

@Component({
 selector: 'app-root',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './app.html'
})
export class App {

 private readonly excelService = inject(ExcelService);

 readonly tableColumns = [...TICKET_HEADERS]
 readonly tableData = signal<TableData[]>([])

 readonly workItemsFile = signal<File | null>(null);
 readonly itemStatusFiles = signal<File[]>([]);

 readonly workItems = signal<WorkItem[]>([]);

 onWorkItemFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.workItemsFile.set(input.files?.[0] ?? null);
 }

 onStatusFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.itemStatusFiles.set(Array.from(input.files ?? []));
 }

 async generateReport(): Promise<void> {
  const allItemsData = await this.getWorkItemsData()
  const allItemStatusList = await this.getItemStatusList()

  // Map Status List
  allItemsData.forEach(m => {
   m.status_list = allItemStatusList[m.itemId] || []
  })

  this.workItems.set(JSON.parse(JSON.stringify(allItemsData)))
  this.tableData.set(transformWorkItems(this.workItems()))
 }

 async getWorkItemsData(): Promise<WorkItem[]> {
  const file = this.workItemsFile();
  if (!file) return [];

  const data = await this.excelService.convertExcelToJson<ExcelWorkItem>(file);
  return mapExcelWorkItems(data)
 }

 async getItemStatusList(): Promise<Record<string, ItemStatusTimeline[]>> {
  const result: Record<string, ItemStatusTimeline[]> = {};

  for (const file of this.itemStatusFiles()) {
   const data = await this.excelService.convertExcelToJson<ExcelItemStatusTimeline>(file);
   const { itemId, status_list } = mapExcelItemStatusTimelines(data)
   const formatID = `${itemId.slice(0, 4)}I${itemId.slice(4)}`
   result[formatID] = [...status_list]
  }

  return result
 }

 exportToExcel(): void {
  this.excelService.exportToExcel<TableData>(this.tableData(), this.tableColumns)
 }
}


export const TICKET_HEADERS: TableColumn<TableData>[] = [
 // { key: 'team', label: 'Team' },
 // { key: 'application', label: 'Application' },
 { key: 'ticketNo', label: 'Ticket No.' },
 { key: 'ticketTitle', label: 'Ticket Title' },
 { key: 'ticketType', label: 'Ticket Type' },
 { key: 'testingStatus', label: 'Testing Status' },
 { key: 'comments', label: 'Comments' },
 { key: 'developmentStartDate', label: 'Development Start Date' },
 { key: 'estimatedEndDate', label: 'Estimated End Date' },
 { key: 'actualEndDate', label: 'Actual End Date' },
 { key: 'qaDeployedDate', label: 'QA Deployed Date' },
 { key: 'qatStartDate', label: 'QAT Start Date' },
 { key: 'uatDeployedDate', label: 'UAT Deployed Date' },
 { key: 'uatStartDate', label: 'UAT Start Date' },
 { key: 'prodDeployment', label: 'Prod Deployment' },
 { key: 'movedBackStatus', label: 'Moved Back Status' }
] as const