import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ReservationService } from '../../services/reservation.service';
import { ReactiveFormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { Reservation } from '../../models/reservations';
import { Subscription, catchError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [ReactiveFormsModule],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  reservations: (Reservation & { isEditable: boolean })[] = [];
  user: User | null = null;

  editForms: { [id: string]: FormGroup } = {};
  editReservationId: string | null = null;
  isUpdating: boolean = false;

  private subscription: Subscription | null = null;

  constructor(
    private userService: UserService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.subscription = this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.user = data.user;
        const now = new Date();

        this.reservations = data.reservations.map((reservation) => {
          const reservationDate = new Date(reservation.date);
          const isEditable = reservationDate.getTime() > new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime();

          this.editForms[reservation.id!] = this.fb.group({
            newDate: [reservation.date]
          });

          return { ...reservation, isEditable };
        });

        if (this.user) {
          this.firstName = this.user.name.firstName || '';
          this.lastName = this.user.name.lastName || '';
          this.email = this.user.email || '';
        }
      },
      error: (error) => {
        console.error('Hiba a profil adatok betöltésekor:', error);
        this.showErrorMessage('Hiba a profil adatok betöltésekor. Kérjük, próbáld újra később.');
      }
    });
  }

  deleteReservation(reservationId: string | undefined): void {
    if (!reservationId) return;

    this.reservationService.deleteReservation(reservationId).subscribe({
      next: (success) => {
        if (success) {
          this.reservations = this.reservations.filter(r => r.id !== reservationId);
          this.showSuccessMessage('A foglalás sikeresen törölve.');
        } else {
          this.showErrorMessage('A foglalás törlése sikertelen.');
        }
      },
      error: (error) => {
        console.error('Hiba a foglalás törlésekor:', error);
        this.showErrorMessage('Hiba a foglalás törlésekor. Kérjük, próbáld újra később.');
      }
    });
  }

  updateReservation(reservationId: string): void {
    if (this.isUpdating) return;
    
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const form = this.editForms[reservationId];
    const newDate = form.get('newDate')?.value;

    if (!newDate) return;

    const newDateTime = new Date(newDate);
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);

    if (newDateTime < twoDaysLater) {
      this.showErrorMessage('Csak két napnál későbbi időpontot lehet megadni.');
      return;
    }

    this.isUpdating = true;


    this.reservationService.checkAvailability(newDate, reservation.track, reservationId).subscribe({
      next: (isAvailable) => {
        if (isAvailable) {
          this.performUpdate(reservationId, newDate);
        } else {
          this.isUpdating = false;
          this.showErrorMessage('A kiválasztott időpont már foglalt ezen a pályán. Kérjük, válassz másik időpontot.');
        }
      },
      error: (error) => {
        this.isUpdating = false;
        console.error('Hiba az időpont elérhetőség ellenőrzésekor:', error);
        this.showErrorMessage('Hiba az időpont elérhetőség ellenőrzésekor. Kérjük, próbáld újra később.');
      }
    });
  }

  private performUpdate(reservationId: string, newDate: string): void {
    this.reservationService.updateReservationDate(reservationId, newDate)
      .pipe(
        catchError(error => {
          console.error('Hiba a módosítás során:', error);
          this.showErrorMessage('Ez az időpont már foglalt erre a pályára.');
          this.isUpdating = false;
          throw error;
        })
      )
      .subscribe({
        next: () => {
          this.loadUserProfile();
          this.editReservationId = null;
          this.isUpdating = false;
          this.showSuccessMessage('A foglalás időpontja sikeresen módosítva.');
        }
      });
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Bezár', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Bezár', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}