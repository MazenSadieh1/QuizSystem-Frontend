import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NavbarComponent} from "./componenten/navbar/navbar.component";
import {ReactiveFormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
  imports: [RouterOutlet, NavbarComponent, ReactiveFormsModule, NgForOf]
})
export class AppComponent {
  title = 'Quiz-System';
  constructor() {


  }


}
