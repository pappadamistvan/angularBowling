import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hourPipe',
  standalone: true
})
export class HourPipe implements PipeTransform {
  transform(value: string): string {
      if (!value) {
        return ''; 
      }

      try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                  return value;
            }
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
          } catch (error) {
            return value;
      }
      
      return value;
  }
}
