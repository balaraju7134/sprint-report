import {
 ChangeDetectionStrategy,
 Component,
 input,
 output
} from '@angular/core';

import {
 DatePipe
} from '@angular/common';

import {
 Team
} from '../../constants/team-list.constants';

import {
 TeamData
} from '../../services/team-data.service';

import {
 TableData
} from '../../model/table.model';

import {
 TeamInitialsPipe
} from '../../pipes/team-initials.pipe';

import {
 ReportTable
} from '../report-table/report-table';

@Component({
 selector: 'app-team-report-card',
 standalone: true,
 imports: [
  DatePipe,
  TeamInitialsPipe,
  ReportTable
 ],
 templateUrl: './team-report-card.html',
 changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamReportCard {

 readonly team =
  input.required<Team>();

 readonly teamData =
  input.required<TeamData>();

 readonly tableData =
  input.required<TableData[]>();

 readonly selected =
  input(false);

 readonly selectedRows =
  input<ReadonlySet<string>>(new Set());

 readonly selectedChange =
  output<boolean>();

 readonly selectedRowsChange =
  output<Set<string>>();

 readonly expanded =
  input(false);

 readonly expandedChange =
  output<void>();

 toggleTeam(): void {

  this.selectedChange.emit(
   !this.selected()
  );
 }

 toggleExpanded(): void {

  this.expandedChange.emit();
 }

 onRowsSelected(
  rows: Set<string>
 ): void {

  this.selectedRowsChange.emit(
   rows
  );
 }
}