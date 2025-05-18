import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';



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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}


  registration(): void {
    console.log(this.registrationForm.value);
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

    const userData: Partial<User> = {
      name: {
        firstName: this.registrationForm.value.name?.firstName || '',
        lastName: this.registrationForm.value.name?.lastName || ''
      },
      email: this.registrationForm.value.email || '',
      password: this.registrationForm.value.password || '',
      reservations: []
    };

    const email = this.registrationForm.value.email || '';
    const pw = this.registrationForm.value.password || '';

    this.authService.signUp(email, pw, userData)
    .then(userCredential => {
      console.log('Registration successful:', userCredential.user);
      this.authService.updateLoginStatus(true);
      this.router.navigateByUrl("/home");
    })
    .catch (error => {
      console.error('Regisztrációs hiba: ', error);
      this.isLoading = false;
      this.showForm = true;

      switch (error.code) {
        case 'auth/email-already-in-use':
          this.registrationError = 'Ezzel az e-mail címmel már van létrehozva fiók!';
          break;
        case 'auth/invalid-email':
          this.registrationError = 'Hibás e-mail cím formátum!';
          break;
        case 'auth/weak-password':
          this.registrationError = 'Gyenge jelszó - legalább 6 karakter hosszú legyen!';
          break;
        default:
          this.registrationError = 'Hiba a regisztráció során. Próbáld újra később!';
      }
    })

    setTimeout(() => {
      this.router.navigateByUrl("/home");
    }, 2000);
  }
}
