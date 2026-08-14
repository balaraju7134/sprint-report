import { Routes } from '@angular/router';
import { ROUTES } from './constants/route.constants';

export const routes: Routes = [
 {
  path: ROUTES.HOME,
  loadComponent: () => import('./components/team-list/team-list').then(m => m.TeamList)
 },
 {
  path: ROUTES.TEAM_WISE_REPORT,
  loadComponent: () => import('./components/team-wise-report/team-wise-report').then(m => m.TeamWiseReport)
 },
 {
  path: ROUTES.EXPORT_REPORT,
  loadComponent: () => import('./components/export-report/export-report').then(m => m.ExportReport)
 }
]