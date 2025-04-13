import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

constructor(private userService: UserService) {}
  

user: string = localStorage.getItem('currentUser') || '';

email: string = this.user.split(':')[0];
password: string = this.user.split(':')[1];
firstName: string = this.user.split(':')[2];
lastName: string = this.user.split(':')[3];
}
