import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs';
import { User } from '../models/user';
import { Reservation } from '../models/reservations';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  getUserProfile(): Observable<{ user: User | null; reservations: Reservation[] }> {
    return this.authService.currentUser.pipe(
      switchMap(authUser => {
        if (!authUser) {
          return of({ user: null, reservations: [] });
        }
        return from(this.fetchUserWithReservations(authUser.uid));
      })
    );
  }

  private async fetchUserWithReservations(userId: string): Promise<{ user: User | null; reservations: Reservation[] }> {
    try {
      const userDocRef = doc(this.firestore, 'User', userId);
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        return { user: null, reservations: [] };
      }

      const userData = userSnapshot.data() as User;
      const user = { ...userData, id: userId };

      const reservationCollection = collection(this.firestore, 'Reservations');
      const q = query(reservationCollection, where('userId', '==', userId));
      const reservationSnapshot = await getDocs(q);

      const reservations: Reservation[] = [];
      reservationSnapshot.forEach(doc => {
        const data = doc.data();
        if (data) {
          const reservation: Reservation = {
            id: doc.id,
            date: data['date'], // már string típusban
            track: data['track'],
            userId: data['userId'],
            name: data['name']
          };
          reservations.push(reservation);
        }
      });

      reservations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return { user, reservations };
    } catch (error) {
      console.error("Hiba a felhasználói adatok betöltése során:", error);
      return { user: null, reservations: [] };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.firestore, 'User', userId);
      const userSnapshot = await getDoc(userDocRef);
      if (!userSnapshot.exists()) return null;

      const userData = userSnapshot.data() as User;
      return { ...userData, id: userId };
    } catch (error) {
      console.error("Hiba a felhasználó lekérése során:", error);
      return null;
    }
  }
}
