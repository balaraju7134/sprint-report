import { TableColumn, TableData } from '../model/table.model';

export const TICKET_HEADERS: TableColumn<TableData>[] = [
  { key: 'ticketNo', label: 'Ticket No.' },
  { key: 'ticketTitle', label: 'Ticket Title' },
  { key: 'ticketType', label: 'Ticket Type' },
  { key: 'testingStatus', label: 'Testing Status' },
  { key: 'comments', label: 'Comments' },
  { key: 'developmentStartDate', label: 'Development Start Date' },
  { key: 'estimatedEndDate', label: 'Estimated End Date' },
  { key: 'actualEndDate', label: 'Actual End Date' },
  { key: 'qaDeployedDate', label: 'QA Deployed Date' },
  { key: 'qatStartDate', label: 'QAT Start Date' },
  { key: 'uatDeployedDate', label: 'UAT Deployed Date' },
  { key: 'uatStartDate', label: 'UAT Start Date' },
  { key: 'prodDeployment', label: 'Prod Deployment' },
  { key: 'movedBackStatus', label: 'Moved Back Status' }
] as const;
