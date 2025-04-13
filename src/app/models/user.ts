import { Reservations } from "./reservations";

export interface User {
      name: {
            firstName: string;
            lastName: string;
      };
      email: string;
      password: string;
      reservations: Reservations[];
}