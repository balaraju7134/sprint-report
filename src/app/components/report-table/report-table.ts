import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TableData } from '../../model/table.model';
import { SprintReportService } from '../../services/report-generation.service';

@Component({
 selector: 'app-report-table',
 standalone: true,
 imports: [],
 templateUrl: './report-table.html',
 changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportTable {

 private readonly reportService = inject(SprintReportService);

 // ---------------------------------------------------------------------------
 // Inputs
 // ---------------------------------------------------------------------------

 readonly tableData = input.required<TableData[]>();
 readonly showSelection = input<boolean>(false)

 /**
  * Row IDs selected by the parent.
  *
  * Example:
  * ['SPR-101', 'SPR-102']
  */
 readonly selectedIds = input<ReadonlySet<string>>(new Set());

 // ---------------------------------------------------------------------------
 // Outputs
 // ---------------------------------------------------------------------------

 readonly selectedIdsChange = output<Set<string>>();

 // ---------------------------------------------------------------------------
 // Table configuration
 // ---------------------------------------------------------------------------

 readonly tableColumns = this.reportService.tableColumns;

 // ---------------------------------------------------------------------------
 // Computed state
 // ---------------------------------------------------------------------------

 readonly selectedCount = computed(() => this.selectedIds().size);

 readonly selectedData = computed(() => {
  const selected = this.selectedIds();
  return this.tableData().filter(row => selected.has(row.ticketNo));
 });

 readonly allSelected = computed(() => {
  const rows = this.tableData();
  if (!rows.length) return false;

  const selected = this.selectedIds();
  return rows.every(row => selected.has(row.ticketNo));
 });

 readonly partiallySelected = computed(() => {
  return (this.selectedCount() > 0 && !this.allSelected());
 });

 // ---------------------------------------------------------------------------
 // Selection
 // ---------------------------------------------------------------------------

 toggleRecord(ticketNo: string): void {
  const next = new Set(this.selectedIds());

  if (next.has(ticketNo)) {
   next.delete(ticketNo);
  } else {
   next.add(ticketNo);
  }

  this.emitSelection(next);
 }

 toggleSelectAll(): void {
  if (this.allSelected()) {
   this.clearSelection();
   return;
  }

  this.selectAll();
 }

 selectAll(): void {
  const next = new Set(this.tableData().map(row => row.ticketNo));
  this.emitSelection(next);
 }

 clearSelection(): void {
  this.emitSelection(new Set());
 }

 isSelected(ticketNo: string): boolean {
  return this.selectedIds().has(ticketNo);
 }

 // ---------------------------------------------------------------------------
 // Internal
 // ---------------------------------------------------------------------------

 private emitSelection(selection: Set<string>): void {
  this.selectedIdsChange.emit(selection);
 }
}