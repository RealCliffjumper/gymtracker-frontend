import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'parseDates',
  standalone: true
})
export class ParseDatesPipe implements PipeTransform {

  transform(value: any): Date | null {
    if (!value) return null;

    if (typeof value === 'string') {
      // If string looks like "2025,9,4,0,0"
      const parts = value.split(',').map(p => parseInt(p, 10));
      if (parts.length >= 3) {
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0);
      }
      return new Date(value);
    }

    if (Array.isArray(value)) {
      // If backend sends [2025, 9, 4, 0, 0]
      return new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0);
    }

    if (typeof value === 'number') {
      // Timestamp in ms
      return new Date(value);
    }

    return null;
  }

}
