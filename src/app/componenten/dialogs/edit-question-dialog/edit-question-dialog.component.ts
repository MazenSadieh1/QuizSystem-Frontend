import {Component, Inject, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AnswerService} from "../../../service/answer/answer.service";
import {QuestionService} from "../../../service/question/question.service";
import {Answer} from "../../../interfaces/answer";
import {Question} from "../../../interfaces/question";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-edit-question-dialog',
  standalone: true,
  imports: [

    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './edit-question-dialog.component.html',
  styleUrls: ['./edit-question-dialog.component.css']
})
export class EditQuestionDialogComponent implements OnInit {
  public questionForm!: FormGroup;
  public pointsForm!: FormGroup;
  answerService = inject(AnswerService);
  formBuilder = inject(FormBuilder);
  questionService = inject(QuestionService);
  dialogRef = inject(MatDialogRef<EditQuestionDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log("data", data);
    data.question.answers.sort((a: Answer, b: Answer) => {
      if (a.id === undefined || b.id === undefined) {
        return 0;
      }
      return a.id - b.id;
    });
    this.questionForm = this.formBuilder.group({
      id: [data.question.id, Validators.required],
      type: [data.question.type, Validators.required],
      text: [data.question.text, Validators.required],
      answers: this.formBuilder.array(
        data.question.answers.map((answer: Answer) => this.createAnswerFormGroup(answer))
      )
    });
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      this.processFillInTheBlankAnswers();
    }
  }

  ngOnInit() {
    let points = 0;
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      const text = this.answers.at(0).value.text;
      points = this.answers.at(0).value.points / this.stringToArray(text).length;
    }
    this.pointsForm = this.formBuilder.group({points: [points, Validators.required]});
  }

  processFillInTheBlankAnswers() {
    const answersFormArray = this.questionForm.get('answers') as FormArray;
    const currentAnswers = answersFormArray.value;
    answersFormArray.clear();
    currentAnswers.forEach((answer: Answer) => {
      const blanks = this.stringToArray(answer.text);
      const pointsPerBlank = answer.points / blanks.length;
      blanks.forEach((blank: string, index: number) => {
        answersFormArray.push(this.createAnswerFormGroup({
          id: index === 0 ? answer.id : undefined,
          text: blank.trim(),
          correct: answer.correct,
          points: pointsPerBlank
        }));
      });
    });
  }

  createAnswerFormGroup(answer: Answer): FormGroup {
    return this.formBuilder.group({
      id: [answer.id],
      text: [answer.text],
      correct: [answer.correct],
      points: [answer.points]
    });
  }

  removeAnswer(answerId: number, index: number): void {
    if (!answerId) {
      this.answers.removeAt(index);
      return;
    }
    this.answerService.deleteAnswer(answerId).subscribe({
      next: res => {
        console.log('deletedAnswer ID',answerId);
        this.answers.removeAt(index);
      },
      error: err => {
        console.error(err)
      }
    });
  }

  addAnswer(id: any = null, text: string = '', points: number  = 0): void {
    this.answers.push(this.formBuilder.group({
      id: [id],
      text: [text, Validators.required],
      correct: [false],
      points: [points, Validators.required]
    }));
  }

  updateQuestion(qiestionId: number, question: Question): void {
    this.questionService.updateQuestion(qiestionId, question).subscribe({
        next: res => {
          console.log("updatedQuestion res", res);
          this.dialogRef.close(res);
        },
        error: err => {
          this.dialogRef.close(null);
          console.error(err)
        }
      }
    );
  }

  updateAnswer(answerId:number, answer: Answer): void {
    this.answerService.updateAnswer(answerId, answer).subscribe({
        next: res => {
          console.log('updatedAnswer res', res);
        },
        error: err => {
          console.error(err)
        }
      }
    );
  }

  createAnswer(answer: Answer, index: number): void {
    this.answerService.createAnswer(answer).subscribe(
      {
        next: res => {
          console.log('createdAnswer res', res);
          this.answers.at(index).setValue(res);
        },
        error: err => {
          console.error(err)
        }
      }
    );
  }

  fillInTheBlank(): void {
    const answersArray = this.questionForm.get('answers') as FormArray;
      const combinedAnswers = this.answers.controls.map((control) => {
        return control.value.text;
      }).join(',');
      const totalPoints = this.stringToArray(combinedAnswers).length * this.pointsForm.get('points')?.value;
      const answerId = this.answers.controls[0].value.id;
      if (answerId) {
        answersArray.clear();
        this.addAnswer(answerId, combinedAnswers, totalPoints);
        const updatedAnswer = this.answers.at(0).value;
        this.updateAnswer(answerId, updatedAnswer);
      } else {
        answersArray.clear();
        this.addAnswer(null, combinedAnswers, totalPoints);
        const answer = this.answers.at(0).value;
        const newAnswer = {
          ...answer,
          question: {id: this.questionForm.get('id')!.value}
        };
        this.createAnswer(newAnswer, 0);

    }
  }
  other(): void {
    // Logik für andere Fragetypen
    this.answers.controls.forEach((control, index) => {
      const answer = control.value;
      if (answer.id) {
        this.updateAnswer(answer.id, answer);
      } else {
        const newAnswer = {
          ...answer,
          question: {id: this.questionForm.get('id')!.value}
        };
        this.createAnswer(newAnswer, index);
      }
    });
  }

  saveQuestion(): void {
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      this.answers.controls.forEach((control) => {
        control.patchValue({points: 1});
      });
    }
    if (this.questionForm.invalid) {
      console.log('Ungultige Feldern');
      this.questionForm.markAllAsTouched();
      return;
    }
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      this.fillInTheBlank()
    }
    else {
      this.other()
    }
    setTimeout(()=>{
    const question = this.questionForm.value;
    console.log('question', question);
    this.updateQuestion(question.id, question);}, 500);
  }

  stringToArray(commaSeparatedString: string): string[] {
    return commaSeparatedString.split(',');
  }

  get answers() {
    return this.questionForm.get('answers') as FormArray;
  }

  onClose() {
    this.dialogRef.close(null);
  }
}
