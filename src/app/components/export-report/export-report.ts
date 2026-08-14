import {
 Component,
 computed,
 inject,
 signal
} from '@angular/core';

import {
 DatePipe
} from '@angular/common';

import {
 TEAM_LIST,
 Team
} from '../../constants/team-list.constants';

import {
 TableData
} from '../../model/table.model';

import {
 TeamData,
 TeamDataService
} from '../../services/team-data.service';

import {
 SprintReportService
} from '../../services/report-generation.service';

import {
 TeamInitialsPipe
} from '../../pipes/team-initials.pipe';

import {
 ReportTable
} from '../report-table/report-table';

@Component({
 selector: 'app-export-report',
 imports: [
  DatePipe,
  TeamInitialsPipe,
  ReportTable
 ],
 templateUrl: './export-report.html'
})
export class ExportReport {

 private readonly teamDataService =
  inject(TeamDataService);

 private readonly sprintReportService =
  inject(SprintReportService);

 readonly teamList = TEAM_LIST;

 readonly tableColumns =
  this.sprintReportService.tableColumns;

 /**
  * Selected teams.
  */
 readonly selectedTeamIds =
  signal<Set<Team['id']>>(
   new Set()
  );

 /**
  * Currently expanded team.
  */
 readonly expandedTeamId =
  signal<Team['id'] | null>(null);

 /**
  * Teams with generated reports.
  */
 readonly availableTeams =
  computed(() =>
   this.teamList.filter(team =>
    this.teamDataService.has(team.id)
   )
  );

 /**
  * Number of selected teams.
  */
 readonly selectedCount =
  computed(() =>
   this.selectedTeamIds().size
  );

 /**
  * Whether all available teams are selected.
  */
 readonly allSelected =
  computed(() => {

   const teams =
    this.availableTeams();

   const selected =
    this.selectedTeamIds();

   return (
    teams.length > 0 &&
    teams.every(team =>
     selected.has(team.id)
    )
   );
  });

 /**
  * Whether selection is partial.
  */
 readonly partiallySelected =
  computed(() => {

   const count =
    this.selectedCount();

   return (
    count > 0 &&
    !this.allSelected()
   );
  });

 /**
  * Total rows across selected teams.
  */
 readonly selectedRowCount =
  computed(() =>
   this.availableTeams()
    .filter(team =>
     this.selectedTeamIds()
      .has(team.id)
    )
    .reduce(
     (total, team) =>
      total +
      this.getTableData(team.id).length,
     0
    )
  );

 /**
  * Selected team names.
  */
 readonly selectedTeamNames =
  computed(() =>
   this.availableTeams()
    .filter(team =>
     this.selectedTeamIds()
      .has(team.id)
    )
    .map(team => team.name)
  );

 toggleTeam(
  teamId: Team['id']
 ): void {

  const selected =
   new Set(
    this.selectedTeamIds()
   );

  if (selected.has(teamId)) {
   selected.delete(teamId);
  } else {
   selected.add(teamId);
  }

  this.selectedTeamIds.set(
   selected
  );
 }

 isSelected(
  teamId: Team['id']
 ): boolean {

  return this.selectedTeamIds()
   .has(teamId);
 }

 toggleExpanded(
  teamId: Team['id']
 ): void {

  this.expandedTeamId.update(
   current =>
    current === teamId
     ? null
     : teamId
  );
 }

 isExpanded(
  teamId: Team['id']
 ): boolean {

  return (
   this.expandedTeamId() === teamId
  );
 }

 selectAll(): void {

  this.selectedTeamIds.set(
   new Set(
    this.availableTeams()
     .map(team => team.id)
   )
  );
 }

 clearSelection(): void {

  this.selectedTeamIds.set(
   new Set()
  );
 }

 toggleSelectAll(): void {

  if (this.allSelected()) {
   this.clearSelection();
  } else {
   this.selectAll();
  }
 }

 getTableData(
  teamId: Team['id']
 ): TableData[] {

  return this.teamDataService
   .getTableData(teamId);
 }

 getTeamData(
  teamId: Team['id']
 ): TeamData | null {

  return this.teamDataService
   .get(teamId);
 }

 /**
  * Export all selected teams into one
  * Excel workbook.
  *
  * Each team gets its own worksheet.
  */
 exportSelected(): void {

  const selectedTeams =
   this.availableTeams()
    .filter(team =>
     this.selectedTeamIds()
      .has(team.id)
    );

  if (!selectedTeams.length) {
   return;
  }

  this.sprintReportService
   .exportAllTeamsToExcel(
    selectedTeams.map(team => ({
     name: team.name,
     tableData:
      this.getTableData(team.id)
    }))
   );
 }

 /**
  * Export selected rows from one team's
  * preview table.
  */
 exportSelectedFromTable(
  teamId: Team['id'],
  selectedData:
   TableData[] | null | undefined
 ): void {

  const team =
   this.teamList.find(
    item => item.id === teamId
   );

  if (!team) {
   return;
  }

  const data =
   selectedData?.length
    ? selectedData
    : this.getTableData(teamId);

  this.sprintReportService
   .exportTeamRowsToExcel(
    team.name,
    data
   );
 }
}