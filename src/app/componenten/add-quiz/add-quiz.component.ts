import {Component, inject, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  AsyncValidatorFn, AbstractControl, ValidationErrors
} from '@angular/forms';
import { AddQuestionComponent } from '../add-question/add-question.component';
import { NgFor, JsonPipe, NgIf } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { QuizService } from '../../service/quiz/quiz.service';
import { Quiz } from '../../interfaces/quiz';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Subject } from '../../enums/Subject.enum';
import * as bcrypt from 'bcryptjs';
import { Observable, of} from "rxjs";
import { catchError, map} from "rxjs/operators";

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    AddQuestionComponent,
    JsonPipe,
    NavbarComponent,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSelectModule,
    NgIf
  ]
})
export class AddQuizComponent implements OnInit {
  subjects: { key: string, value: string }[] = Object.keys(Subject).map(key => ({ key: key, value: Subject[key as keyof typeof Subject] as string }));
  public quizForm!: FormGroup;
  formBuilder = inject(FormBuilder);
  quizService = inject(QuizService);
  router = inject(Router);

  constructor() { }

  ngOnInit() {
    this.quizForm = this.formBuilder.group({
      subject: [null, [Validators.required]],
      title: [null, [Validators.required],[this.uniqueTitleValidator()]],
      creator: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  onSaveQuiz(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }
    const password = this.quizForm.get('password')?.value;
    bcrypt.hash(password, 10)
      .then(hashedPassword => {
        const quizData = { ...this.quizForm.value, password: hashedPassword } as Quiz;
        this.quizService.createQuiz(quizData)
          .subscribe({
            next: res => {
              this.router.navigate([`/edit-quiz/${res.id}`]);
              },
            error: err => {
              alert("Ein Fehler ist aufgetreten!");
              console.error(err);
            }
          });
      })
      .catch(err => {
        console.error('Error hashing password:', err);
      });
  }
  uniqueTitleValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.quizService.checkIfTitleExists(control.value).pipe(
        map(titleExist => titleExist ? { titleNotUnique: true } : null),
        catchError(() => of(null))
      );
    };
  }
}
