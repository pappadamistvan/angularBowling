import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Reservation } from '../models/reservations';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { from, Observable, of, switchMap, map, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private userService: UserService
  ) {}

  createReservation(track: string, date: string): Observable<string | null> {
    return this.authService.currentUser.pipe(
      switchMap(user => {
        if (!user) {
          console.error('A foglaláshoz bejelentkezés szükséges');
          return of(null);
        }

        return from(this.userService.getUserById(user.uid)).pipe(
          switchMap(userData => {
            if (!userData) {
              console.error('Nem található felhasználói profil');
              return of(null);
            }

            const fullName = `${userData.name.firstName} ${userData.name.lastName}`;

            const reservationData: Reservation = {
              date,
              track,
              userId: user.uid,
              name: fullName
            };

            return from(this.addReservationToFirestore(reservationData));
          })
        );
      })
    );
  }

  private async addReservationToFirestore(reservation: Reservation): Promise<string | null> {
    try {
      const isAvailable = await this.checkAvailabilityFirestore(reservation.date, reservation.track);
      if (!isAvailable) {
        throw new Error('A kiválasztott időpont és pálya már foglalt!');
      }

      const reservationsCollection = collection(this.firestore, 'Reservations');
      const docRef = await addDoc(reservationsCollection, {
        ...reservation,
        createdAt: serverTimestamp()
      });

      console.log('Foglalás sikeresen létrehozva, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Hiba a foglalás létrehozása során:', error);
      throw error;
    }
  }

  checkAvailability(date: string, track: string, currentReservationId?: string): Observable<boolean> {
    return from(this.checkAvailabilityFirestore(date, track, currentReservationId)).pipe(
      catchError(error => {
        console.error('Hiba az időpont elérhetőség ellenőrzésekor:', error);
        return of(false);
      })
    );
  }

  private async checkAvailabilityFirestore(date: string, track: string, currentReservationId?: string): Promise<boolean> {
    try {
      const reservationsCollection = collection(this.firestore, 'Reservations');
      const q = query(
        reservationsCollection,
        where('track', '==', track),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);

      if (!currentReservationId) {
        return snapshot.empty;
      }
      
      if (snapshot.empty) {
        return true;
      }
      
      const conflictingReservation = snapshot.docs.find(doc => doc.id !== currentReservationId);
      return !conflictingReservation;
    } catch (error) {
      console.error('Hiba az időpont elérhetőség ellenőrzésekor:', error);
      throw error;
    }
  }

  deleteReservation(reservationId: string): Observable<boolean> {
    return from(this.deleteReservationFromFirestore(reservationId));
  }

  private async deleteReservationFromFirestore(reservationId: string): Promise<boolean> {
    try {
      const reservationDocRef = doc(this.firestore, 'Reservations', reservationId);
      await deleteDoc(reservationDocRef);
      console.log('Foglalás sikeresen törölve');
      return true;
    } catch (error) {
      console.error('Hiba a foglalás törlése során:', error);
      return false;
    }
  }

  createGuestReservation(guestReservation: Reservation): Observable<string | null> {
    return from(this.addGuestReservationToFirestore(guestReservation));
  }

  private async addGuestReservationToFirestore(guestReservation: Reservation): Promise<string | null> {
    try {
      const isAvailable = await this.checkAvailabilityFirestore(guestReservation.date, guestReservation.track);
      if (!isAvailable) {
        throw new Error('A kiválasztott időpont és pálya már foglalt!');
      }

      const reservationsCollection = collection(this.firestore, 'Reservations');
      const docRef = await addDoc(reservationsCollection, {
        ...guestReservation,
        createdAt: serverTimestamp()
      });

      console.log('Vendég foglalás sikeresen létrehozva, ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Hiba a vendég foglalás létrehozása során:', error);
      throw error;
    }
  }

  updateReservationDate(reservationId: string, newDate: string): Observable<void> {
  const reservationDocRef = doc(this.firestore, 'Reservations', reservationId);

  return from(this.getReservationById(reservationId)).pipe(
    switchMap(reservation => {
      if (!reservation || !reservation.track) {
        throw new Error('A foglalás nem található vagy hiányos adatokkal rendelkezik');
      }

      const parsedDate = new Date(newDate);
      const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')} ${parsedDate.getHours().toString().padStart(2, '0')}:${parsedDate.getMinutes().toString().padStart(2, '0')}`;

      return from(this.checkAvailabilityFirestore(formattedDate, reservation.track, reservationId)).pipe(
        switchMap(isAvailable => {
          if (!isAvailable) {
            throw new Error('Ez az időpont már foglalt erre a pályára.');
          }

          return from(updateDoc(reservationDocRef, {
            date: formattedDate,
            updatedAt: serverTimestamp()
          }));
        })
      );
    })
  );
}


  private async getReservationById(reservationId: string): Promise<Reservation | null> {
    try {
      const reservationRef = doc(this.firestore, 'Reservations', reservationId);
      const snapshot = await getDocs(query(collection(this.firestore, 'Reservations')));
      const reservation = snapshot.docs.find(doc => doc.id === reservationId);
      
      if (!reservation) {
        return null;
      }
      
      return { id: reservation.id, ...reservation.data() } as Reservation;
    } catch (error) {
      console.error('Hiba a foglalás lekérdezésekor:', error);
      return null;
    }
  }

  private async updateReservationInFirestore(reservationId: string, data: Partial<Reservation>): Promise<boolean> {
    try {
      const reservationDocRef = doc(this.firestore, 'Reservations', reservationId);
      await updateDoc(reservationDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      console.log('Foglalás sikeresen frissítve');
      return true;
    } catch (error) {
      console.error('Hiba a foglalás frissítése során:', error);
      return false;
    }
  }
}