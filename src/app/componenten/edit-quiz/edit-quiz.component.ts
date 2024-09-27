import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from "@angular/forms";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {CommonModule, JsonPipe, NgForOf, NgIf} from '@angular/common';
import {QuizService} from 'src/app/service/quiz/quiz.service';
import {Quiz} from "../../interfaces/quiz";
import {NavbarComponent} from "../navbar/navbar.component";
import {Answer} from "../../interfaces/answer";
import {Question} from "../../interfaces/question";
import {AddQuestionComponent} from "../add-question/add-question.component";
import {QuestionService} from "../../service/question/question.service";
import {QuestionType} from "../../enums/QuestionType.enum";
import {Subject} from "../../enums/Subject.enum";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {EditQuestionDialogComponent} from "../dialogs/edit-question-dialog/edit-question-dialog.component";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [
    NavbarComponent,
    NgForOf,
    JsonPipe,
    NgIf,
    AddQuestionComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './edit-quiz.component.html',
  styleUrls: ['./edit-quiz.component.css'],
  providers: [MatSnackBar]
})
export class EditQuizComponent implements OnInit {
  subjects: { key: string, value: string }[] =
    Object.keys(Subject).map(key => ({key: key, value: Subject[key as keyof typeof Subject] as string}));
  quizId: number = 0;
  public quizForm!: FormGroup;
  showDiv = false;
  selectedQuestion!: Question;
  dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private quizService: QuizService,
    private questionService: QuestionService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizId = params['id'];
      this.fetchQuiz();
    });
  }

  createQuestionFormGroup(question: Question): FormGroup {
    return this.fb.group({
      id: [question.id],
      type: [question.type],
      text: [question.text],
      points: [null],
      answers: this.fb.array(question.answers.map(answer => this.createAnswerFormGroup(answer)))
    });
  }

  createAnswerFormGroup(answer: Answer): FormGroup {
    return this.fb.group({
      id: [answer.id],
      text: [answer.text],
      correct: [answer.correct],
      points: [answer.points]
    });
  }

  onSaveQuiz(): void {
    if (this.quizForm.valid) {
      const quizData = this.quizForm.value as Quiz;
      this.quizService.updateQuiz(quizData.id, quizData).subscribe(
        (response) => {
          console.log('Quiz erfolgreich gespeichert: ', response)
          this.snackBar.open('Quiz erfolgreich gespeichert', 'Schließen', {duration: 3000});
          this.router.navigate(['/edit-delete-quiz']);
        },
        (error) => {
          console.log('Fehler beim Speichern des Quiz: ', error)
          this.snackBar.open('Fehler beim Speichern des Quiz', 'Schließen', {duration: 3000});
        }
      );
    }
  }

  onQuestionUpdated(updatedQuestion: Question): void {
    console.log("start onQuestionUpdated");
    const questionsFormArray = this.quizForm.get('questions') as FormArray;
    let questionArray = questionsFormArray.value as Question[];
    console.log("questionArray", questionArray);
    if (updatedQuestion.id != null) {
      console.log("updatedQuestion", updatedQuestion);
      console.log(" bevor questionsFormArray", questionsFormArray);
      const index = questionArray.findIndex(question => question.id === updatedQuestion.id);
      questionsFormArray.removeAt(index);
      questionsFormArray.insert(index, this.createQuestionFormGroup(updatedQuestion));
    }
    console.log("after questionsFormArray", questionsFormArray);
  }

  removeQuestion(id: number, index: number): void {
    if (id) {
      this.questionService.deleteQuestion(id).subscribe(
        (response) => {
          console.log('Question erfolgreich entfernt', response);
          this.snackBar.open('Frage erfolgreich entfernt', 'Schließen', {duration: 3000});
          this.removeQuestionFromArray(index);
        },
        (error) => {
          console.log('Fehler beim Entfernen der Frage: ', error)
          this.snackBar.open('Fehler beim Entfernen der Frage', 'Schließen', {duration: 3000});
        }
      );
    } else {
      this.removeQuestionFromArray(index);
    }
  }

  addQuestionToQuiz(questionData: any): void {
    const quizId = this.quizForm.value.id;
    const questionGroup = this.fb.group({
      id: [null as number | null],
      type: [questionData.type, Validators.required],
      text: [questionData.text, Validators.required],
      points: [questionData.points],
      answers: this.fb.array(
        questionData.answers.map((answer: any) =>
          this.fb.group({
            id: [null as number | null],
            text: [answer.text, Validators.required],
            correct: [answer.correct, Validators.required],
            points: [answer.points, Validators.required]
          })
        )
      ),
      quiz: this.fb.group({
        id: [quizId, Validators.required]
      })
    });
    const answers: Answer[] = questionGroup.value.answers as Answer[] || [];
    const question: Question = {
      type: questionGroup.value.type as QuestionType,
      text: questionGroup.value.text,
      points: questionGroup.value.points,
      answers: answers,
      quiz: {id: quizId} as Quiz
    };
    this.questionService.createQuestion(question).subscribe(
      (response) => {
        this.snackBar.open('Frage erfolgreich hinzugefügt', 'Schließen', {duration: 3000});
        if (response.id !== undefined) {
          questionGroup.get('id')?.setValue(response.id);
        }
        // Update the ids for each answer
        const answerControls = (questionGroup.get('answers') as FormArray).controls;
        response.answers.forEach((answerResponse: any, index: number) => {
          if (answerResponse.id !== undefined) {
            answerControls[index].get('id')?.setValue(answerResponse.id);
          }
        });
        // Optional: Füge die Frage zum Formulararray hinzu
        (this.quizForm.get('questions') as FormArray).push(questionGroup);
      },
      (error) => {
        console.log('Fehler beim Hinzufügen der Frage: ', error)
        this.snackBar.open('Fehler beim Hinzufügen der Frage', 'Schließen', {duration: 3000});
      }
    );
  }

  removeQuestionFromArray(index : number): void {
    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.removeAt(index);
  }

  toggleDiv(q: Question) {
    this.selectedQuestion = q;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {question: q};
    const dialogRef = this.dialog.open(EditQuestionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        console.log("Afterclose",res);
        this.onQuestionUpdated(res);
      }else{
        console.log("fasle");
      }
    });
  }

  private fetchQuiz() {
    this.quizService.getQuiz(this.quizId).subscribe({
      next: quiz => {
        quiz.questions.sort((a: Question, b: Question) => {
          if (a.id === undefined || b.id === undefined) {
            return 0;
          }
          return a.id - b.id;
        });
        this.quizForm = this.fb.group({
          id: [quiz.id, Validators.required],
          subject: [quiz.subject, Validators.required],
          title: [quiz.title, [Validators.required],[this.uniqueTitleValidator()]],
          creator: [quiz.creator, Validators.required],
          questions: this.fb.array(quiz.questions.map(question => this.createQuestionFormGroup(question)))
        });
      },
      error:
        (err) => {
          this.snackBar.open('Fehler beim Laden des Quiz', 'Schließen', {duration: 3000});
        }
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
