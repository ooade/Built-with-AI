export enum DiagramType {
  Flowchart = 'flowchart',
  Sequence = 'sequence',
  Class = 'class',
  State = 'state',
  ER = 'er',
  UserJourney = 'journey',
  Gantt = 'gantt',
  Pie = 'pie',
}

export interface DiagramState {
  code: string;
  history: string[]; // For undo
  historyIndex: number;
  lastUpdated: number;
}

export interface SavedDiagram {
  id: string;
  name: string;
  code: string;
  lastModified: number;
}
