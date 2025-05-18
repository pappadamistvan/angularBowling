import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list'
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  imports: [MatIconModule, MatListModule, CommonModule, RouterLink],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy{
  @Input() sidenav!: MatSidenav;
  @Input() isLoggedIn: boolean = false;

  private subscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  logOut(): void {
    this.authService.updateLoginStatus(false);
    this.isLoggedIn = false;
    window.location.href = "/home";
  }

  closeMenu() {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
