import {
 Component,
 computed,
 effect,
 inject,
 input,
 output,
 signal
} from '@angular/core';

import {
 TableData
} from '../../model/table.model';

import {
 SprintReportService
} from '../../services/report-generation.service';

@Component({
 selector: 'app-report-table',
 imports: [],
 templateUrl: './report-table.html'
})
export class ReportTable {

 private readonly sprintReportService =
  inject(SprintReportService);

 readonly tableData =
  input.required<TableData[]>();

 readonly tableColumns =
  this.sprintReportService.tableColumns;

 /**
  * Selected ticket numbers.
  */
 readonly selectedTicketNos =
  signal<Set<string>>(
   new Set()
  );

 /**
  * Number of selected records.
  */
 readonly selectedCount =
  computed(() =>
   this.selectedTicketNos().size
  );

 /**
  * Whether all records are selected.
  */
 readonly allSelected =
  computed(() => {

   const data =
    this.tableData();

   if (!data.length) {
    return false;
   }

   const selected =
    this.selectedTicketNos();

   return data.every(item =>
    selected.has(item.ticketNo)
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
  * Selected records.
  */
 readonly selectedData =
  computed(() => {

   const selected =
    this.selectedTicketNos();

   return this.tableData()
    .filter(item =>
     selected.has(item.ticketNo)
    );
  });

 constructor() {

  /**
   * Clear row selection whenever
   * the input dataset changes.
   */
  effect(() => {

   this.tableData();

   this.selectedTicketNos.set(
    new Set()
   );
  });
 }

 toggleRecord(
  ticketNo: string
 ): void {

  const selected =
   new Set(
    this.selectedTicketNos()
   );

  if (selected.has(ticketNo)) {
   selected.delete(ticketNo);
  } else {
   selected.add(ticketNo);
  }

  this.selectedTicketNos.set(
   selected
  );
 }

 isSelected(
  ticketNo: string
 ): boolean {

  return this.selectedTicketNos()
   .has(ticketNo);
 }

 toggleSelectAll(): void {

  if (this.allSelected()) {
   this.clearSelection();
  } else {
   this.selectAll();
  }
 }

 selectAll(): void {

  this.selectedTicketNos.set(
   new Set(
    this.tableData()
     .map(item =>
      item.ticketNo
     )
   )
  );
 }

 clearSelection(): void {

  this.selectedTicketNos.set(
   new Set()
  );
 }

 exportToExcel(): void {

  const selected =
   this.selectedData();

  if (!selected.length) {
   return;
  }

  this.sprintReportService
   .exportToExcel(selected);

  this.clearSelection();
 }
}