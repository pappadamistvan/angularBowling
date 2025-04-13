import { Component, EventEmitter, Output } from '@angular/core';
import { MatFormFieldModule, MatLabel} from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

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
export class LoginComponent {
  email = new FormControl('');
  password = new FormControl('');
  firstName: string = '';
  lastName: string = '';
  isLoading: boolean = false;
  loginError: string = '';
  showLoginForm: boolean = true;

  usernameOut: string = '';
  emailOut: string = '';
  passwordOut: string = '';

  constructor(private userService: UserService){}


  login(){
    const enteredEmail = this.email.value;
    const enteredPassword = this.password.value;
    let isAunthenticated = false;
    this.loginError = '';

    for (let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      if (key){
        const storedPassword = localStorage.getItem(key)?.split(':')[1];
        this.firstName = localStorage.getItem(key)?.split(':')[2] || '';
        this.lastName = localStorage.getItem(key)?.split(':')[3] || '';
        if (key === enteredEmail){
          if (storedPassword === enteredPassword){
            isAunthenticated = true;
            break;
          }
        }
      }
    }

    if (!isAunthenticated){
      this.loginError = 'Hibás felhasználónév vagy jelszó!';
    }

    if (isAunthenticated){
      this.isLoading = true;
      this.showLoginForm = false;

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', enteredEmail + ':' + enteredPassword + ':' + this.firstName + ':' + this.lastName);

      setTimeout(() => {
        window.location.href = '/home';
      }, 3000);
    }
  }
}

