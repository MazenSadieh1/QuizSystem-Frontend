import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from "../navbar/navbar.component";
import {TableQuizComponent} from "../table-quiz/table-quiz.component";

@Component({
  selector: 'app-select-quiz',
  standalone: true,
    imports: [CommonModule, NavbarComponent, TableQuizComponent],
  templateUrl: './select-quiz.component.html',
  styleUrls: ['./select-quiz.component.css']
})
export class SelectQuizComponent {

}
