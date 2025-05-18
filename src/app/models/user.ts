import { Reservation } from "./reservations";

export interface User {
      id: string;
      name: {
            firstName: string;
            lastName: string;
      };
      email: string;
      password: string;
      reservations: Reservation[];
}