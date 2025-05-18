import { Component, OnDestroy } from '@angular/core';
import { MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatLabel,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy{
  email = new FormControl('');
  password = new FormControl('');
  firstName: string = '';
  lastName: string = '';
  isLoading: boolean = false;
  loginError: string = '';
  showLoginForm: boolean = true;
  authSubscription?: Subscription;

  usernameOut: string = '';
  emailOut: string = '';
  passwordOut: string = '';

  constructor(private authService: AuthService, private router: Router){}


  login(){
    const enteredEmail = this.email.value || '';
    const enteredPassword = this.password.value || '';
    this.loginError = '';

    this.authService.signIn(enteredEmail, enteredPassword).then(userCredential => {
      console.log('Login successful: ', userCredential.user);
      this.authService.updateLoginStatus(true);
      this.router.navigateByUrl('/home');
    })
    .catch(error => {
      console.log('Error: ', error);
      this.isLoading = false;
      this.showLoginForm = true;

      switch(error.code){
        case 'auth/user-not-found':
          this.loginError = "E-mail cím nincs regisztrálva!";
          break;
        case 'auth/wrong-password':
          this.loginError = "Hibás jelszó!";
          break;
        default:
          this.loginError = "Hibás belépés. Próbáld újra!"
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }
}

