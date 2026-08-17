export interface TableData {
 team: string;
 application: string;
 ticketNo: string;
 ticketTitle: string;
 ticketType: string;
 testingStatus: string;
 comments: string;
 developmentStartDate: Date | string | null;
 estimatedEndDate: Date | string | null;
 actualEndDate: Date | string | null;
 qaDeployedDate: Date | string | null;
 qatStartDate: Date | string | null;
 uatDeployedDate: Date | string | null;
 uatStartDate: Date | string | null;
 prodDeployment: Date | string | null;
 movedBackStatus: string;
}

export type ReportSelection = string[]

export interface TableColumn<T = any> {
 key: keyof T;
 label: string;
}