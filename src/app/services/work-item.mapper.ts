import { ExcelItemStatusTimeline, ItemIdWithStatus, ItemStatusTimeline, StatusName } from "../model/work-item-status.model";
import { Comment, ExcelWorkItem, WorkItem } from "../model/work-item.model";

export function mapExcelToWorkItem(item: ExcelWorkItem): WorkItem {
 let comments: Comment[] = [];

 if (item.Comments) {
  try {
   comments = JSON.parse(item.Comments).map((comment: any) => ({
    comments: comment.Comments,
    addedBy: comment.addedBy
   }));
  } catch {
   comments = [];
  }
 }

 return {
  itemId: item['Item Id'],
  itemName: item['Item Name'],
  description: item.Description,
  completedOn: item['Completed On'],
  tags: item.Tags,
  sprint: item.Sprint,
  createdBy: item['Created by'],
  createdOn: item['Created On'],
  assignee: item.Assignee
   ? item.Assignee.split(',').map(value => value.trim())
   : [],
  status: item.Status,
  epic: item.Epic,
  itemType: item['Item Type'],
  priority: item.Priority,
  startDate: item['Start Date'],
  endDate: item['End Date'],
  startAfter: item['Start After'],
  duration: item.Duration,
  estimationPoints: Number(item['Estimation Points'] || 0),
  release: item.Release,
  totalWorkHours: item['Total Workhours'],
  workHoursPerOwner: item['Work hours per owner']
   ? item['Work hours per owner'].split(',')
   : [],
  workHoursType: item['Work hours type'],
  parentId: item['Parent Id'],
  sprintType: item['Sprint Type'],
  sprintStartDate: item['Sprint Start Date'],
  sprintEndDate: item['Sprint End Date'],
  comments,
  createdTime: item['Created Time'],
  lastModified: item['Last Modified'],
  blockedBy: item['Blocked by'],
  blockedOn: item['Blocked On'],
  status_list: []
 };
}

export function mapExcelWorkItems(items: ExcelWorkItem[]): WorkItem[] {
 return items.map(mapExcelToWorkItem);
}

export function mapExcelItemStatusTimeline(item: ExcelItemStatusTimeline): ItemStatusTimeline {
 return {
  status_name: item['Team Name'] as StatusName,
  sprint: item.bijib,
  updated_by: item.__EMPTY,
  from_date: item.__EMPTY_1,
  to_date: item.__EMPTY_2,
  duration: item.__EMPTY_3
 };
}

export function mapExcelItemStatusTimelines(items: ExcelItemStatusTimeline[]): ItemIdWithStatus {
 const itemId = items[2].bijib
 const statusList = items.slice(5)
 return { itemId, status_list: statusList.map(mapExcelItemStatusTimeline) }
}