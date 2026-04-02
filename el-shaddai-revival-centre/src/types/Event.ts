export interface IEvent {
  _id?: string;
  title: string;
  description: string;
  date: Date | string;
  time?: string;
  location?: string;
  category?: string;
  recurring?: boolean;
  isPublished?: boolean;
}

// Remove stub - use IEvent interface directly
