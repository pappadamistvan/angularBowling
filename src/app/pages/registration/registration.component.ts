import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { User } from '../../models/user';


@Component({
  selector: 'app-registration',
  imports: [
    MatFormFieldModule,
    MatLabel,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
    FormsModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  registrationForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(5)]),
    rePassword: new FormControl('', [Validators.required]),
    name: new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)])
    })
  });

  isLoading: boolean = false;
  showForm: boolean = true;
  registrationError: string = '';
  isLoggedIn = false;

  constructor(private router: Router){}


  registration(): void {
    if (this.registrationForm.invalid){
      this.registrationError = 'Hibás input!'
      return;
    }
    
    const password = this.registrationForm.get('password');
    const rePassword = this.registrationForm.get('rePassword');

    if(password?.value !== rePassword?.value){
      this.registrationError = 'Nem egyezik meg a jelszó!';
      return;
    }

    this.isLoading = true;
    this.showForm = false;
    this.isLoggedIn = true;

    const newUser: User = {
      name: {
        firstName: this.registrationForm.value.name?.firstName || '',
        lastName: this.registrationForm.value.name?.lastName || ''
      },
      email: this.registrationForm.value.email || '',
      password: this.registrationForm.value.password || '',
      reservations: []
    }

    localStorage.setItem(newUser.email, newUser.email + ':' + newUser.password + ':' + newUser.name.firstName + ':' + newUser.name.lastName);
    localStorage.setItem('currentUser', newUser.email + ':' + newUser.password + ':' + newUser.name.firstName + ':' + newUser.name.lastName);

    setTimeout(() => {
      this.router.navigateByUrl("/home");
    }, 2000);
  }
}
