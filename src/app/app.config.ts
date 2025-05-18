import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "angularbowling-b3b38", appId: "1:819709758818:web:163f4a550b3d9e5294703b", storageBucket: "angularbowling-b3b38.firebasestorage.app", apiKey: "AIzaSyDVde8-MpG1Mc87PgaN1wqQRiFOG7eWdCY", authDomain: "angularbowling-b3b38.firebaseapp.com", messagingSenderId: "819709758818" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
