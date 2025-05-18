import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from "../../pipes/datePipe";
import { TrackSelectorComponent } from './track-selector/track-selector.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, Observable, finalize } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    TrackSelectorComponent,
    AsyncPipe
  ],
  standalone: true
})
export class ReservationsComponent implements OnInit {
  stepperOrientation: Observable<StepperOrientation>;
  trackFormGroup!: FormGroup;
  dateTimeFormGroup!: FormGroup;
  userDataFormGroup!: FormGroup;

  selectedTrack: string = '';
  userName: string = '';
  userEmail: string = '';
  userId: string = '';

  isLoggedIn = false;
  isLoading: boolean = false;

  days: string[] = [];
  hours: string[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private reservationService: ReservationService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit() {
    this.trackFormGroup = this._formBuilder.group({
      trackCtrl: ['', Validators.required],
    });

    this.dateTimeFormGroup = this._formBuilder.group({
      dateCtrl: ['', Validators.required],
      timeCtrl: ['', Validators.required],
    });

    this.userDataFormGroup = this._formBuilder.group({
      lastNameCtrl: ['', Validators.required],
      firstNameCtrl: ['', Validators.required],
      emailCtrl: ['', [Validators.required, Validators.email]],
    });

    this.checkLoginStatus();

    for (let i = 1; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      this.days.push(date.toISOString());
    }

    for (let i = 10; i < 21; i++) {
      this.hours.push(i + ":00");
    }
  }

  checkLoginStatus() {

    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      console.log('Login state from service:', isLoggedIn);
      this.isLoggedIn = isLoggedIn;
      

      if (isLoggedIn) {
        this.authService.currentUser.subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.userService.getUserById(user.uid).then(userData => {
              if (userData) {
                this.userName = `${userData.name.firstName} ${userData.name.lastName}`;
                this.userEmail = userData.email;
              }
            });
          }
        });
      }
    });


    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    console.log('Login state from localStorage:', storedLoginStatus);
    if (storedLoginStatus === 'false') {
      this.isLoggedIn = false;
    }
  }

  isEveryStepValid(): boolean {
    if (this.isLoggedIn) {
      return this.trackFormGroup.valid && this.dateTimeFormGroup.valid;
    } else {
      return this.trackFormGroup.valid && this.dateTimeFormGroup.valid && this.userDataFormGroup.valid;
    }
  }

  reservation(): void {
    if (!this.isEveryStepValid()) {
      this.snackBar.open('Kérlek töltsd ki az összes kötelező mezőt!', 'Bezár', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    const selectedDate = new Date(this.dateTimeFormGroup.value.dateCtrl);
    const selectedTime = this.dateTimeFormGroup.value.timeCtrl;
    const [hours, minutes] = selectedTime.split(':').map(Number);
    selectedDate.setHours(hours, minutes, 0, 0);

    const formattedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')} ${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`;

    if (this.isLoggedIn) {
      this.reservationService.createReservation(this.selectedTrack, formattedDate)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              this.isLoading = false;
              this.router.navigate(['/profile']);
            }, 2000);
          })
        )
        .subscribe({
          next: (reservationId) => {
            if (reservationId) {
              this.snackBar.open('Foglalásod sikeresen elmentve!', 'Bezár', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            } else {
              this.handleReservationError('A foglalás mentése sikertelen.');
            }
          },
          error: (error) => {
            this.handleReservationError(error.message || 'Hiba történt a foglalás során.');
          }
        });
    } else {
      const lastName = this.userDataFormGroup.value.lastNameCtrl;
      const firstName = this.userDataFormGroup.value.firstNameCtrl;
      const email = this.userDataFormGroup.value.emailCtrl;
      const fullName = `${lastName} ${firstName}`;

      const guestReservation = {
        track: this.selectedTrack,
        date: formattedDate,
        name: fullName,
        email: email,
        userId: 'guest'
      };

      this.reservationService.createGuestReservation(guestReservation)
        .pipe(
          finalize(() => {
            setTimeout(() => {
              this.isLoading = false;
              this.router.navigate(['/home']);
            }, 2000);
          })
        )
        .subscribe({
          next: (reservationId) => {
            if (reservationId) {
              this.snackBar.open('Foglalásod sikeresen elmentve!', 'Bezár', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            } else {
              this.handleReservationError('A foglalás mentése sikertelen.');
            }
          },
          error: (error) => {
            this.handleReservationError(error.message || 'Hiba történt a foglalás során.');
          }
        });
    }
  }

  onTrackSelect(track: string): void {
    this.selectedTrack = track;
    this.trackFormGroup.patchValue({
      trackCtrl: track
    });
  }

  private handleReservationError(errorMessage: string): void {
    this.snackBar.open(errorMessage, 'Bezár', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
    this.isLoading = false;
  }
}