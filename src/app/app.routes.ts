import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { AboutComponent } from './pages/about/about.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard, publicGuard } from './guards/auth/auth.guard';

export const routes: Routes = [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent},
      { path: 'reservation', component: ReservationsComponent},
      { path: 'about', component: AboutComponent},
      { 
            path: 'registration', component: RegistrationComponent
      },
      { 
            path: 'login', component: LoginComponent
      },
      { 
            path: 'profile', component: ProfileComponent,
            canActivate: [authGuard]
      },
      { path: '**', redirectTo: '', pathMatch: 'full' },
];
