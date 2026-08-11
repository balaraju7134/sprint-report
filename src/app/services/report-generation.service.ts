import { inject, Injectable } from '@angular/core';
import { TICKET_HEADERS } from '../constants/report-table.constants';
import { TableColumn, TableData } from '../model/table.model';
import { ExcelItemStatusTimeline, ItemStatusTimeline } from '../model/work-item-status.model';
import { ExcelWorkItem, WorkItem } from '../model/work-item.model';
import { ExcelFileService } from './excel-file.service';
import { transformWorkItems } from './report-table-transformer';
import { mapExcelItemStatusTimelines, mapExcelWorkItems } from './work-item-mapper';

@Injectable({ providedIn: 'root' })
export class SprintReportService {
  private readonly excelFileService = inject(ExcelFileService);
  private readonly transformWorkItemsFn = transformWorkItems;

  readonly tableColumns: TableColumn<TableData>[] = TICKET_HEADERS;

  async generateReportData(workItemsFile: File | null, itemStatusFiles: File[]): Promise<{ workItems: WorkItem[]; tableData: TableData[] }> {
    const workItems = await this.loadWorkItems(workItemsFile);
    const itemStatusLookup = await this.loadItemStatusLookup(itemStatusFiles);
    const enrichedWorkItems = this.attachStatusTimelines(workItems, itemStatusLookup);

    return {
      workItems: enrichedWorkItems,
      tableData: this.buildTableData(enrichedWorkItems, itemStatusLookup)
    };
  }

  buildTableData(workItems: WorkItem[], itemStatusLookup: Record<string, ItemStatusTimeline[]>): TableData[] {
    const enrichedWorkItems = this.attachStatusTimelines(workItems, itemStatusLookup);
    return this.transformWorkItemsFn(enrichedWorkItems);
  }

  async loadWorkItems(workItemsFile: File | null): Promise<WorkItem[]> {
    if (!workItemsFile) {
      return [];
    }

    const data = await this.excelFileService.convertExcelToJson<ExcelWorkItem>(workItemsFile);
    return mapExcelWorkItems(data);
  }

  async loadItemStatusLookup(itemStatusFiles: File[]): Promise<Record<string, ItemStatusTimeline[]>> {
    const result: Record<string, ItemStatusTimeline[]> = {};

    for (const file of itemStatusFiles) {
      const data = await this.excelFileService.convertExcelToJson<ExcelItemStatusTimeline>(file);
      const { itemId, status_list } = mapExcelItemStatusTimelines(data);
      const formatId = `${itemId.slice(0, 4)}I${itemId.slice(4)}`;
      result[formatId] = [...status_list];
    }

    return result;
  }

  exportToExcel(tableData: TableData[], fileName = 'sprint-report.xlsx'): void {
    this.excelFileService.exportToExcel(tableData, this.tableColumns, fileName);
  }

  private attachStatusTimelines(
    workItems: WorkItem[],
    itemStatusLookup: Record<string, ItemStatusTimeline[]>
  ): WorkItem[] {
    return workItems.map(item => ({
      ...item,
      status_list: itemStatusLookup[item.itemId] ?? []
    }));
  }
}
