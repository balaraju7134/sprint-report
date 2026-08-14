import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'teamInitials' })
export class TeamInitialsPipe implements PipeTransform {
 transform(value: string | null | undefined): string {
  if (!value?.trim()) {
   return '';
  }

  return value
   .trim()
   .split(/\s+/)
   .slice(0, 2)
   .map(word => word.charAt(0))
   .join('')
   .toUpperCase();
 }
}