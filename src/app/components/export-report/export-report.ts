import {
 ChangeDetectionStrategy,
 Component,
 computed,
 inject,
 signal
} from '@angular/core';

import {
 TEAM_LIST,
 Team
} from '../../constants/team-list.constants';

import {
 TableData
} from '../../model/table.model';

import {
 TeamDataService
} from '../../services/team-data.service';

import {
 SprintReportService
} from '../../services/report-generation.service';

import {
 TeamReportCard
} from '../team-report-card/team-report-card';

@Component({
 selector: 'app-export-report',
 standalone: true,
 imports: [
  TeamReportCard
 ],
 templateUrl: './export-report.html',
 changeDetection: ChangeDetectionStrategy.OnPush,
 host: {
  class: 'flex h-dvh flex-col overflow-hidden'
 }
})
export class ExportReport {

 private readonly teamDataService =
  inject(TeamDataService);

 private readonly reportService =
  inject(SprintReportService);

 // ---------------------------------------------------------------------------
 // Data
 // ---------------------------------------------------------------------------

 readonly teams = TEAM_LIST;

 readonly availableTeams = computed(() => this.teams.filter(team => this.teamDataService.has(team.id)));

 // ---------------------------------------------------------------------------
 // Team selection
 // ---------------------------------------------------------------------------

 readonly selectedTeamIds = signal<Set<Team['id']>>(new Set());

 readonly selectedTeams = computed(() => {
  const selected = this.selectedTeamIds();
  return this.availableTeams().filter(team => selected.has(team.id));
 });

 readonly selectedTeamCount = computed(() => this.selectedTeamIds().size);

 readonly allTeamsSelected = computed(() => {
  const teams = this.availableTeams();
  if (!teams.length) {
   return false;
  }

  const selected = this.selectedTeamIds();
  return teams.every(team => selected.has(team.id));
 });

 readonly partiallySelected = computed(() => {
  const count = this.selectedTeamCount();
  return (count > 0 && !this.allTeamsSelected());
 });

 // ---------------------------------------------------------------------------
 // Row selection
 // ---------------------------------------------------------------------------

 /**
  * teamId -> selected ticket numbers
  */
 readonly selectedRows = signal<Map<Team['id'], Set<string>>>(new Map());

 readonly selectedRowCount = computed(() => {
  let count = 0;

  for (const team of this.selectedTeams()) {
   count += this.getExportRows(team).length;
  }

  return count;
 });

 // ---------------------------------------------------------------------------
 // Expansion
 // ---------------------------------------------------------------------------

 readonly expandedTeamId = signal<Team['id'] | null>(null);

 // ---------------------------------------------------------------------------
 // Team selection actions
 // ---------------------------------------------------------------------------

 toggleTeam(teamId: Team['id']): void {

  const next = new Set(this.selectedTeamIds());

  if (next.has(teamId)) {
   next.delete(teamId);
  } else {
   next.add(teamId);
  }

  this.selectedTeamIds.set(next);
 }

 selectAllTeams(): void {
  this.selectedTeamIds.set(new Set(this.availableTeams().map(team => team.id)));
 }

 clearSelection(): void {
  this.selectedTeamIds.set(new Set());
  this.selectedRows.set(new Map());
 }

 toggleSelectAll(): void {
  if (this.allTeamsSelected()) {
   this.clearSelection();
   return;
  }

  this.selectAllTeams();
 }

 // ---------------------------------------------------------------------------
 // Expansion
 // ---------------------------------------------------------------------------

 toggleExpanded(teamId: Team['id']): void {
  this.expandedTeamId.update(current => current === teamId ? null : teamId);
 }

 // ---------------------------------------------------------------------------
 // Row selection
 // ---------------------------------------------------------------------------

 getSelectedRows(teamId: Team['id']): ReadonlySet<string> {
  return (this.selectedRows().get(teamId) ?? EMPTY_SELECTION);
 }

 updateSelectedRows(teamId: Team['id'], rows: Set<string>): void {
  const next = new Map(this.selectedRows());

  if (rows.size) {
   next.set(teamId, rows);

   // Selecting a row automatically
   // includes the team in the export.
   this.addTeamToSelection(teamId);
  } else {
   next.delete(teamId);
  }

  this.selectedRows.set(next);
 }

 // ---------------------------------------------------------------------------
 // Data access
 // ---------------------------------------------------------------------------

 getRows(teamId: Team['id']): TableData[] {
  return this.teamDataService.getTableData(teamId);
 }

 getTeamData(teamId: Team['id']) {
  return this.teamDataService.get(teamId);
 }

 // ---------------------------------------------------------------------------
 // Export
 // ---------------------------------------------------------------------------

 export(): void {

  const teams = this.selectedTeams();

  if (!teams.length) {
   return;
  }

  this.reportService
   .exportAllTeamsToExcel(
    teams.map(team => ({
     name: team.name,
     tableData:
      this.getExportRows(team)
    }))
   );
 }

 // ---------------------------------------------------------------------------
 // Helpers
 // ---------------------------------------------------------------------------

 private addTeamToSelection(teamId: Team['id']): void {
  if (this.selectedTeamIds().has(teamId)) {
   return;
  }

  const next = new Set(this.selectedTeamIds());
  next.add(teamId);
  this.selectedTeamIds.set(next);
 }

 private getExportRows(team: Team): TableData[] {
  const rows = this.getRows(team.id);
  const selected = this.selectedRows().get(team.id);

  /**
   * No row-level selection:
   * export the complete team.
   */
  if (!selected?.size) {
   return rows;
  }

  /**
   * Row-level selection:
   * export only selected rows.
   */
  return rows.filter(row => selected.has(row.ticketNo));
 }
}

const EMPTY_SELECTION: ReadonlySet<string> = new Set();