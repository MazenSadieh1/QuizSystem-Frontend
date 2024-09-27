import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
    selector: 'app-quiz-management',
    templateUrl: './quiz-management.component.html',
    styleUrls: ['./quiz-management.component.css'],
    standalone: true,
    imports: [RouterLink, NavbarComponent]
})
export class QuizManagementComponent {

}
