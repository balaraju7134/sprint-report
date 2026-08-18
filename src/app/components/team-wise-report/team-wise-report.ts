import { Component, computed, inject, signal } from '@angular/core';
import { ReportTable } from '../report-table/report-table';
import { SprintReportService } from '../../services/report-generation.service';
import { TeamDataService } from '../../services/team-data.service';
import { WorkItem } from '../../model/work-item.model';
import { Router } from '@angular/router';
import { ROUTES } from '../../constants/route.constants';

@Component({
 selector: 'app-team-wise-report',
 imports: [ReportTable],
 templateUrl: './team-wise-report.html'
})
export class TeamWiseReport {

 private readonly sprintReportService = inject(SprintReportService);
 private readonly teamDataService = inject(TeamDataService);
 private readonly router = inject(Router)

 // ---------------------------------------------------------------------------
 // Team / report data
 // ---------------------------------------------------------------------------

 readonly team = this.teamDataService.team;
 readonly teamId = this.teamDataService.teamId;
 readonly tableData = this.teamDataService.tableData;
 readonly hasData = this.teamDataService.hasData;
 readonly tableColumns = this.sprintReportService.tableColumns;

 // ---------------------------------------------------------------------------
 // Upload state
 // ---------------------------------------------------------------------------

 readonly workItemsFiles = signal<File[]>([]);
 readonly itemStatusFiles = signal<File[]>([]);
 readonly workItems = signal<WorkItem[]>([]);
 readonly isGenerating = signal(false);
 readonly errorMessage = signal<string | null>(null);

 readonly disableGenerateButton = computed(() => {
  return !this.workItemsFiles().length || !this.itemStatusFiles().length || this.isGenerating()
 })
 // ---------------------------------------------------------------------------
 // File selection
 // ---------------------------------------------------------------------------

 onWorkItemFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.workItemsFiles.set(Array.from(input.files ?? []));
  this.errorMessage.set(null);
 }

 onStatusFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.itemStatusFiles.set(Array.from(input.files ?? []));
  this.errorMessage.set(null);
 }

 // ---------------------------------------------------------------------------
 // Report generation
 // ---------------------------------------------------------------------------

 async generateReport(): Promise<void> {
  const teamId = this.teamId();
  const workItemsFiles = this.workItemsFiles();
  const statusFiles = this.itemStatusFiles();

  if (!teamId || !workItemsFiles.length || !statusFiles.length) {
   return;
  }

  this.isGenerating.set(true);
  this.errorMessage.set(null);

  try {
   const { workItems, tableData } = await this.sprintReportService.generateReportData(workItemsFiles, statusFiles);
   this.workItems.set(workItems);

   /**
    * Store generated report data
    * against the current team.
    */
   this.teamDataService.setTableData(teamId, tableData);
  } catch (error) {
   console.error('Failed to generate sprint report', error);
   this.errorMessage.set('Unable to generate the report. Please check your files and try again.');
  } finally {
   this.isGenerating.set(false);
  }
 }

 goHome(): void {
  this.router.navigate([`/${ROUTES.HOME}`])
 }
}