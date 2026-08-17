import { computed, Injectable, signal } from '@angular/core';
import { TEAM_LIST, Team, } from '../constants/team-list.constants';
import { TableData } from '../model/table.model';

export interface TeamData {
 teamId: Team['id'];
 tableData: TableData[];
 uploadedAt: string | null;
}

type TeamDataStore = Partial<Record<Team['id'], TeamData>>;

@Injectable({ providedIn: 'root' })
export class TeamDataService {

 private readonly STORAGE_KEY = 'team-data';

 private readonly store = signal<TeamDataStore>(this.load());
 private readonly selectedTeamId = signal<Team['id'] | null>(null);

 readonly teamId = this.selectedTeamId.asReadonly();

 readonly team = computed<Team | null>(() => {
  const teamId = this.selectedTeamId();
  return TEAM_LIST.find(team => team.id === teamId) ?? null;
 });

 readonly tableData = computed<TableData[]>(() => {
  const teamId = this.selectedTeamId();

  if (!teamId) {
   return [];
  }

  return this.store()[teamId]?.tableData ?? [];
 });

 readonly hasData = computed(() => {
  return this.tableData().length > 0;
 });

 selectTeam(teamId: Team['id']): void {
  this.selectedTeamId.set(teamId);
 }

 get(teamId: Team['id']): TeamData | null {
  return this.store()[teamId] ?? null;
 }

 getTableData(teamId: Team['id']): TableData[] {
  return this.store()[teamId]?.tableData ?? [];
 }

 has(teamId: Team['id']): boolean {
  return !!this.store()[teamId];
 }

 setTableData(
  teamId: Team['id'],
  tableData: TableData[],
 ): void {
  const next: TeamDataStore = {
   ...this.store(),
   [teamId]: {
    teamId,
    tableData,
    uploadedAt: new Date().toISOString(),
   },
  };

  this.persist(next);
 }

 clear(teamId: Team['id']): void {
  const next = { ...this.store() };

  delete next[teamId];

  this.persist(next);
 }

 clearAll(): void {
  localStorage.removeItem(this.STORAGE_KEY);

  this.store.set({});
  this.selectedTeamId.set(null);
 }

 private load(): TeamDataStore {
  const stored = localStorage.getItem(this.STORAGE_KEY);

  if (!stored) {
   return {};
  }

  try {
   return JSON.parse(stored) as TeamDataStore;
  } catch {
   return {};
  }
 }

 private persist(store: TeamDataStore): void {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
  this.store.set(store);
 }
}