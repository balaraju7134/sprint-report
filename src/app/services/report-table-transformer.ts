import { TableData } from '../model/table.model';
import { StatusNameEnum } from '../model/work-item-status.model';
import { WorkItem } from '../model/work-item.model';

const normalizeDates = (statusMap: Map<StatusNameEnum, string[]>, status: StatusNameEnum): string =>
 (statusMap.get(status) || []).join(", ");

const buildStatusMap = (statusList: WorkItem['status_list']) =>
 statusList.reduce((map, status) => {
  const dates = map.get(status.status_name) ?? [];
  dates.push(status.from_date);
  map.set(status.status_name, dates);
  return map;
 }, new Map<StatusNameEnum, string[]>());

const normalizeComments = (comments: WorkItem['comments']): string =>
 comments?.map(comment => comment.comments).filter(Boolean).join(', ') || '';

const hasMovedBack = (statusList: WorkItem['status_list']): boolean =>
 statusList.some((status, index, list) => {
  if (index === 0) return false;

  const previousStatus = list[index - 1].status_name;
  return (
   (previousStatus === StatusNameEnum.QA || previousStatus === StatusNameEnum.UAT) &&
   (status.status_name === StatusNameEnum.TODO || status.status_name === StatusNameEnum.IN_PROGRESS)
  );
 });

export function transformWorkItems(workItems: WorkItem[]): TableData[] {
 return workItems.map(item => {
  const statusMap = buildStatusMap(item.status_list);

  return {
   team: '',
   application: item.release,
   ticketNo: item.itemId,
   ticketTitle: item.itemName,
   ticketType: item.itemType,
   testingStatus: item.status,
   comments: "",
   developmentStartDate: item.startDate,
   estimatedEndDate: item.endDate,
   actualEndDate: normalizeDates(statusMap, StatusNameEnum.QA_DEPLOYMENT),
   qaDeployedDate: normalizeDates(statusMap, StatusNameEnum.QA),
   qatStartDate: normalizeDates(statusMap, StatusNameEnum.QA),
   uatDeployedDate: normalizeDates(statusMap, StatusNameEnum.UAT),
   uatStartDate: normalizeDates(statusMap, StatusNameEnum.UAT),
   prodDeployment: normalizeDates(statusMap, StatusNameEnum.PROD_DEPLOYMENT),
   movedBackStatus: hasMovedBack(item.status_list) ? 'Yes' : 'No'
  };
 });
}