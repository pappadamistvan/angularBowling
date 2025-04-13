import { Component, Input, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  imports: [MatIconModule, MatListModule, CommonModule, RouterLink],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit{
  @Input() sidenav!: MatSidenav;
  @Input() isLoggedIn: boolean = false;

  ngOnInit(): void {
    console.log('');
  }

  logOut(): void {
    localStorage.setItem('isLoggedIn', 'false');
    this.isLoggedIn = false;
    window.location.href = "/home";
  }

  closeMenu() {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }
}
