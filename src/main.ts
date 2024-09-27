import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { CommonModule } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

import { provideAnimations } from '@angular/platform-browser/animations';
import {MatDialogModule} from "@angular/material/dialog";

bootstrapApplication(AppComponent, {
    providers: [
    importProvidersFrom(BrowserModule, CommonModule,MatDialogModule, AppRoutingModule, FormsModule, ReactiveFormsModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideAnimations()
]
})
  .catch(err => console.error(err));
