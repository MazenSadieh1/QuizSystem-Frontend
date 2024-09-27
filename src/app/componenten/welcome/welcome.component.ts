import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.css'],
    standalone: true,
    imports: [RouterLink, RouterOutlet, NavbarComponent]
})
export class WelcomeComponent {

}
