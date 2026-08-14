import {
 Component,
 computed,
 inject,
 signal,
} from '@angular/core';

import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

import {
 TEAM_LIST,
 Team,
} from '../../constants/team-list.constants';

import { TeamInitialsPipe } from '../../pipes/team-initials.pipe';
import { ReportTable } from '../report-table/report-table';
import { TeamDataService } from '../../services/team-data.service';
import { ROUTES } from '../../constants/route.constants';

@Component({
 selector: 'app-team-list',
 imports: [
  NgClass,
  TeamInitialsPipe,
  ReportTable,
 ],
 templateUrl: './team-list.html',
})
export class TeamList {

 private readonly router = inject(Router);
 private readonly teamDataService = inject(TeamDataService);

 readonly teamList = TEAM_LIST;

 readonly openedTeam = signal<Team['id'] | null>(null);

 readonly tableData = computed(() => {
  const id = this.openedTeam()
  if (!id) return []
  return this.teamDataService.getTableData(id)
 })

 toggleTeam(teamId: Team['id']): void {
  this.openedTeam.update(current =>
   current === teamId ? null : teamId
  );
 }

 goToExport(): void {
  this.router.navigate([`/${ROUTES.EXPORT_REPORT}`]);
 }

 isOpen(teamId: Team['id']): boolean {
  return this.openedTeam() === teamId;
 }

 uploadTeam(teamId: Team['id']): void {
  this.teamDataService.selectTeam(teamId);

  this.router.navigate([`/${ROUTES.TEAM_WISE_REPORT}`]);
 }

 clearTeam(teamId: Team['id']): void {
  this.teamDataService.clear(teamId);
 }

 hasData(teamId: Team['id']): boolean {
  return this.teamDataService.has(teamId);
 }
}