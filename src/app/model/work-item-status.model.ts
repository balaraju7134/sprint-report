export interface ExcelItemStatusTimeline {
 "Team Name": string;
 bijib: string;
 __EMPTY: string;
 __EMPTY_1: string;
 __EMPTY_2: string;
 __EMPTY_3: string;
}

export interface ItemStatusTimeline {
 status_name: StatusName;
 sprint: string;
 updated_by: string;
 from_date: string;
 to_date: string;
 duration: string;
}

export interface ItemIdWithStatus {
 itemId: string;
 status_list: ItemStatusTimeline[]
}

export enum StatusNameEnum {
 TODO = 'To do',
 IN_PROGRESS = 'In progress',
 COMPLETED = 'Completed',
 QA_DEPLOYMENT = 'QA-Deployment',
 QA = 'QA',
 UAT_DEPLOYMENT = 'UAT-Deployment',
 UAT = 'UAT',
 PROD_DEPLOYMENT = 'Prod-Deployment',
 PVT = 'PVT',
 DONE = 'Done'
}

export type StatusName =
 | StatusNameEnum.TODO
 | StatusNameEnum.IN_PROGRESS
 | StatusNameEnum.COMPLETED
 | StatusNameEnum.QA_DEPLOYMENT
 | StatusNameEnum.QA
 | StatusNameEnum.UAT_DEPLOYMENT
 | StatusNameEnum.UAT
 | StatusNameEnum.PROD_DEPLOYMENT
 | StatusNameEnum.PVT
 | StatusNameEnum.DONE
