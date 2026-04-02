export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
start: string;
  end: string;
  location?: string;
  description?: string;
  color?: string;
  category?: string;
  isPublished?: boolean;
}

export default CalendarEvent;

