import { Timestamp } from '@angular/fire/firestore';

export interface Reservation {
  id?: string;
  userId: string;
  name: string;
  track: string;
  date: string
  isEditable?: boolean;
}
