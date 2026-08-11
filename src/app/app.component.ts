import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SprintReportService } from './services/report-generation.service';
import { WorkItem } from './model/work-item.model';
import { TableData } from './model/table.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class App {
  private readonly sprintReportService = inject(SprintReportService);

  readonly tableColumns = this.sprintReportService.tableColumns;
  readonly tableData = signal<TableData[]>([]);

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
    const { workItems, tableData } = await this.sprintReportService.generateReportData(
      this.workItemsFile(),
      this.itemStatusFiles()
    );

    this.workItems.set(workItems);
    this.tableData.set(tableData);
  }

  exportToExcel(): void {
    this.sprintReportService.exportToExcel(this.tableData());
  }
}
