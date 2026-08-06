import { ItemStatusTimeline } from "./work-item-status.model";

export interface ExcelWorkItem {
 'Item Id': string;
 'Item Name': string;
 Description: string;
 'Completed On': string;
 Tags: string;
 Sprint: string;
 'Created by': string;
 'Created On': string;
 Assignee: string;
 Status: string;
 Epic: string;
 'Item Type': string;
 Priority: string;
 'Start Date': string;
 'End Date': string;
 'Start After': string;
 Duration: string;
 'Estimation Points': string;
 Release: string;
 'Total Workhours': string;
 'Work hours per owner': string;
 'Work hours type': string;
 'Parent Id': string;
 'Sprint Type': string;
 'Sprint Start Date': string;
 'Sprint End Date': string;
 Comments: string;
 'Created Time': string;
 'Last Modified': string;
 'Blocked by': string;
 'Blocked On': string;
}

export interface WorkItem {
 itemId: string;
 itemName: string;
 description: string;
 completedOn: string;
 tags: string;
 sprint: string;
 createdBy: string;
 createdOn: string;
 assignee: string[];
 status: string;
 epic: string;
 itemType: string;
 priority: string;
 startDate: string;
 endDate: string;
 startAfter: string;
 duration: string;
 estimationPoints: number;
 release: string;
 totalWorkHours: string;
 workHoursPerOwner: string[];
 workHoursType: string;
 parentId: string;
 sprintType: string;
 sprintStartDate: string;
 sprintEndDate: string;
 comments: Comment[];
 createdTime: string;
 lastModified: string;
 blockedBy: string;
 blockedOn: string;

 // Additional
 status_list: ItemStatusTimeline[]
}

export interface Comment {
 comments: string;
 addedBy: string;
}