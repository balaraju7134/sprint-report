export interface Team {
 id: string;
 name: string;
 theme: string;
 avatarClass: string;
}

export const TEAM_LIST: Team[] = [
 {
  id: 'aqua',
  name: 'Team Aqua',
  theme: 'Aqua',
  avatarClass: 'bg-cyan-100 text-cyan-700',
 },
 {
  id: 'blue',
  name: 'Team Blue',
  theme: 'Blue',
  avatarClass: 'bg-blue-100 text-blue-700',
 },
 {
  id: 'green',
  name: 'Team Green',
  theme: 'Green',
  avatarClass: 'bg-emerald-100 text-emerald-700',
 },
 {
  id: 'orange',
  name: 'Team Orange',
  theme: 'Orange',
  avatarClass: 'bg-orange-100 text-orange-700',
 },
 {
  id: 'red',
  name: 'Team Red',
  theme: 'Red',
  avatarClass: 'bg-red-100 text-red-700',
 },
 {
  id: 'yellow',
  name: 'Team Yellow',
  theme: 'Yellow',
  avatarClass: 'bg-amber-100 text-amber-700',
 },
];