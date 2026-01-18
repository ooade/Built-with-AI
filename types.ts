export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export enum SectionId {
  HERO = 'hero',
  PROJECTS = 'projects',
  ABOUT = 'about',
}