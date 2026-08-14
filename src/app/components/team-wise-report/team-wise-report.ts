import {
 Component,
 inject,
 signal,
} from '@angular/core';

import { ReportTable } from '../report-table/report-table';

import { SprintReportService } from '../../services/report-generation.service';

import { TeamDataService } from '../../services/team-data.service';

import { WorkItem } from '../../model/work-item.model';

@Component({
 selector: 'app-team-wise-report',
 imports: [ReportTable],
 templateUrl: './team-wise-report.html',
})
export class TeamWiseReport {

 private readonly sprintReportService =
  inject(SprintReportService);

 private readonly teamDataService =
  inject(TeamDataService);

 readonly team =
  this.teamDataService.team;

 readonly teamId =
  this.teamDataService.teamId;

 readonly tableData =
  this.teamDataService.tableData;

 readonly hasData =
  this.teamDataService.hasData;

 readonly tableColumns =
  this.sprintReportService.tableColumns;

 readonly workItemsFile =
  signal<File | null>(null);

 readonly itemStatusFiles =
  signal<File[]>([]);

 readonly workItems =
  signal<WorkItem[]>([]);

 readonly isGenerating =
  signal(false);

 readonly errorMessage =
  signal<string | null>(null);

 onWorkItemFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  this.workItemsFile.set(
   input.files?.[0] ?? null
  );

  this.errorMessage.set(null);
 }

 onStatusFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  this.itemStatusFiles.set(
   Array.from(input.files ?? [])
  );

  this.errorMessage.set(null);
 }

 async generateReport(): Promise<void> {
  const teamId = this.teamId();

  const workItemsFile =
   this.workItemsFile();

  const statusFiles =
   this.itemStatusFiles();

  if (!teamId || !workItemsFile || !statusFiles.length) {
   return;
  }

  this.isGenerating.set(true);
  this.errorMessage.set(null);

  try {
   const {
    workItems,
    tableData,
   } =
    await this.sprintReportService.generateReportData(
     workItemsFile,
     statusFiles
    );

   this.workItems.set(workItems);

   // Store generated report for this team.
   this.teamDataService.setTableData(
    teamId,
    tableData
   );

  } catch (error) {
   console.error(
    'Failed to generate sprint report',
    error
   );

   this.errorMessage.set(
    'Unable to generate the report. Please check your files and try again.'
   );

  } finally {
   this.isGenerating.set(false);
  }
 }

 exportToExcel(): void {
  const data = this.tableData();

  if (!data.length) {
   return;
  }

  this.sprintReportService.exportToExcel(data);
 }
}