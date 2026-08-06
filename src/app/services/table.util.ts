import { TableData } from "../model/table.model";
import { StatusNameEnum } from "../model/work-item-status.model";
import { WorkItem } from "../model/work-item.model";

export function transformWorkItems(workItems: WorkItem[]): TableData[] {
 return workItems.map(item => {
  const statusMap = item.status_list.reduce((map, status) => {
   const dates = map.get(status.status_name) ?? [];
   dates.push(status.from_date);
   map.set(status.status_name, dates);
   return map;
  }, new Map<StatusNameEnum, string[]>());

  const firstDate = (status: StatusNameEnum): string =>
   statusMap.get(status)?.[0] ?? '';

  const lastDate = (status: StatusNameEnum): string =>
   statusMap.get(status)?.at(-1) ?? '';

  const movedBackStatus = item.status_list.some((status, index, list) => {
   if (index === 0) return false;

   const previousStatus = list[index - 1].status_name;

   return (
    (previousStatus === StatusNameEnum.QA ||
     previousStatus === StatusNameEnum.QA_DEPLOYMENT) &&
    (status.status_name === StatusNameEnum.TODO ||
     status.status_name === StatusNameEnum.IN_PROGRESS)
   );
  })
   ? 'Yes'
   : 'No';

  return {
   team: '',
   application: item.release,
   ticketNo: item.itemId,
   ticketTitle: item.itemName,
   ticketType: item.itemType,
   testingStatus: item.status,
   comments: item.comments.map(comment => comment.comments).join(', '),

   // First time entered each status
   developmentStartDate: firstDate(StatusNameEnum.IN_PROGRESS),
   qaDeployedDate: firstDate(StatusNameEnum.QA),
   qatStartDate: firstDate(StatusNameEnum.QA),
   uatDeployedDate: firstDate(StatusNameEnum.UAT),
   uatStartDate: firstDate(StatusNameEnum.UAT),
   prodDeployment: firstDate(StatusNameEnum.PROD_DEPLOYMENT),

   // Other fields
   estimatedEndDate: item.endDate,
   actualEndDate: lastDate(StatusNameEnum.PROD_DEPLOYMENT),

   movedBackStatus: movedBackStatus
  };
 });
}