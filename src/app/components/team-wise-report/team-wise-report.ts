import {
 Component,
 computed,
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

 // ---------------------------------------------------------------------------
 // Team / report data
 // ---------------------------------------------------------------------------

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

 // ---------------------------------------------------------------------------
 // Upload state
 // ---------------------------------------------------------------------------

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

 // ---------------------------------------------------------------------------
 // Row selection
 // ---------------------------------------------------------------------------

 /**
  * Selected ticket numbers from ReportTable.
  *
  * This is the source of truth for row selection.
  */
 readonly selectedIds =
  signal<ReadonlySet<string>>(
   new Set()
  );

 /**
  * Number of selected rows.
  */
 readonly selectedCount =
  computed(() =>
   this.selectedIds().size
  );

 /**
  * Actual selected table rows.
  */
 readonly selectedRows =
  computed(() => {

   const selected =
    this.selectedIds();

   return this.tableData()
    .filter(row =>
     selected.has(row.ticketNo)
    );
  });

 // ---------------------------------------------------------------------------
 // File selection
 // ---------------------------------------------------------------------------

 onWorkItemFileSelected(
  event: Event
 ): void {

  const input =
   event.target as HTMLInputElement;

  this.workItemsFile.set(
   input.files?.[0] ?? null
  );

  this.errorMessage.set(null);
 }

 onStatusFilesSelected(
  event: Event
 ): void {

  const input =
   event.target as HTMLInputElement;

  this.itemStatusFiles.set(
   Array.from(input.files ?? [])
  );

  this.errorMessage.set(null);
 }

 // ---------------------------------------------------------------------------
 // Row selection
 // ---------------------------------------------------------------------------

 /**
  * Receives selection from ReportTable.
  */
 onRowsSelected(
  ids: Set<string>
 ): void {

  this.selectedIds.set(
   new Set(ids)
  );
 }

 /**
  * Clear selection when a new report is generated.
  */
 private clearRowSelection(): void {

  this.selectedIds.set(
   new Set()
  );
 }

 // ---------------------------------------------------------------------------
 // Report generation
 // ---------------------------------------------------------------------------

 async generateReport(): Promise<void> {

  const teamId =
   this.teamId();

  const workItemsFile =
   this.workItemsFile();

  const statusFiles =
   this.itemStatusFiles();

  if (
   !teamId ||
   !workItemsFile ||
   !statusFiles.length
  ) {
   return;
  }

  this.isGenerating.set(true);
  this.errorMessage.set(null);

  // New report = new row selection.
  this.clearRowSelection();

  try {

   const {
    workItems,
    tableData,
   } =
    await this.sprintReportService
     .generateReportData(
      workItemsFile,
      statusFiles
     );

   this.workItems.set(
    workItems
   );

   /**
    * Store generated report data
    * against the current team.
    */
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

 // ---------------------------------------------------------------------------
 // Excel export
 // ---------------------------------------------------------------------------

 exportToExcel(): void {

  const selected =
   this.selectedRows();

  if (!selected.length) {
   return;
  }

  this.sprintReportService
   .exportToExcel(selected);
 }
}