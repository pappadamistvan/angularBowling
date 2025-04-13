import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {StepperOrientation, MatStepperModule} from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from "../../pipes/datePipe";
import { TrackSelectorComponent } from './track-selector/track-selector.component';
import {BreakpointObserver} from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import {AsyncPipe} from '@angular/common';

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
  ]
})
export class ReservationsComponent implements OnInit {
  stepperOrientation: Observable<StepperOrientation>;

  trackFormGroup!: FormGroup;
  dateTimeFormGroup!: FormGroup;
  userDataFormGroup!: FormGroup;

  selectedTrack: string = '';
  selectedDate: string = '';
  selectedTime: string = '';
  userName: string = '';
  userEmail: string = '';

  isLoggedIn = false;
  isLoading: boolean = false;

  days: string[] = [];
  hours: string[] = [];

  constructor(private _formBuilder: FormBuilder) {
    const breakpointObserver = inject(BreakpointObserver);

    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({matches}) => (matches ? 'horizontal' : 'vertical')));
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
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  isEveryStepValid(): boolean {
    if (this.isLoggedIn) {
      return this.trackFormGroup.valid && this.dateTimeFormGroup.valid;
    } else {
      return this.trackFormGroup.valid && this.dateTimeFormGroup.valid && this.userDataFormGroup.valid;
    }
  }

  reservation(): void {
    this.isLoading = true;
    setTimeout(() => {
      window.location.href = "/home";
    }, 2000);
  }

  onTrackSelect(track: string): void {
    this.selectedTrack = track;
    this.trackFormGroup.patchValue({
      trackCtrl: track
    });
  }
}
