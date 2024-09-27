import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from "../navbar/navbar.component";
import {TableQuizComponent} from "../table-quiz/table-quiz.component";

@Component({
  selector: 'app-edit-delete-quiz',
  standalone: true,
    imports: [CommonModule, NavbarComponent, TableQuizComponent],
  templateUrl: './edit-delete-quiz.component.html',
  styleUrls: ['./edit-delete-quiz.component.css']
})
export class EditDeleteQuizComponent {

}
