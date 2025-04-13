import { Component, EventEmitter, Output } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';

@Component({
  selector: 'app-track-selector',
  templateUrl: './track-selector.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatStepperModule
  ],
  styleUrls: ['./track-selector.component.scss']
})
export class TrackSelectorComponent {
  @Output() trackSelected = new EventEmitter<string>();

  tracks = ['Pálya 1', 'Pálya 2', 'Pálya 3', 'Pálya 4'];
  selectedTrack: string = '';

  onTrackSelect(selectedTrack: string): void {
    this.trackSelected.emit(selectedTrack);
  }
  
}
