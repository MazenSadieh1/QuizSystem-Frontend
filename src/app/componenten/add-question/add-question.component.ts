import {Component, Output, EventEmitter, OnInit} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';
import { QuestionType } from 'src/app/enums/QuestionType.enum';
import { NgFor, NgIf } from '@angular/common';
import {NavbarComponent} from "../navbar/navbar.component";
import {MatCardModule} from "@angular/material/card";

@Component({
    selector: 'app-add-question',
    templateUrl: './add-question.component.html',
    styleUrls: ['./add-question.component.css'],
    standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, NgIf, NavbarComponent, MatCardModule]
})
export class AddQuestionComponent implements OnInit{
  questionTypeValues: {key:string, value:string }[] =  Object.keys(QuestionType).map(key => ({ key: key, value: QuestionType[key as keyof typeof QuestionType] as string }));
  @Output() questionAdded = new EventEmitter<any>();
  public questionForm!: FormGroup;
  public pointsForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.pointsForm = this.formBuilder.group(
      {points:
          [0, [Validators.required, Validators.pattern('^[0-9]*$') ]]});
    this.questionForm = this.formBuilder.group({
      type: ['', Validators.required],
      text: ['Bitte Frage schreiben', Validators.required],
      answers: this.formBuilder.array([])
    });
    this.addAnswer();
  }

  addQuestion() {
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      this.answers.controls.forEach((control) => {
        control.patchValue({ points: 1 });
      });
    }
    if (this.questionForm.invalid) {
      console.log('Ungultige Feldern');
      this.questionForm.markAllAsTouched();
      return;
    }
    const answersArray = this.questionForm.get('answers') as FormArray;
    if (this.questionForm.get('type')?.value === 'FILL_IN_THE_BLANK') {
      const pointsValue = this.pointsForm.get('points')?.value;
      const totalPoints = this.answers.length * Number(pointsValue);
      const combinedAnswers = this.answers.controls.map((control) => {
        return control.value.text;
      }).join(',');
      answersArray.clear();
      this.addAnswerWithText(combinedAnswers, totalPoints);
    }
    else if (this.questionForm.get('type')?.value === 'TRUE_FALSE'){
      this.questionForm.patchValue({ text: 'Entscheide, ob die Aussage wahr oder falsch ist.' });
    }
    this.questionAdded.emit(this.questionForm.value);
    this.resetForm();
  }

  resetForm() {
    this.questionForm.reset();
    const answersArray = this.questionForm.get('answers') as FormArray;
    answersArray.clear();
    this.addAnswer();
    this.questionForm.patchValue({ text: 'Bitte Frage schreiben' });
  }

  addAnswer() {
    this.answers.push(
     this.formBuilder.group({
       text: ['', Validators.required],
       correct: [false],
       points: [null, Validators.required]
      })
    );
  }

  addAnswerWithText( text : string, points: number) {
    this.answers.push(
      this.formBuilder.group({
        text: [text, Validators.required],
        correct: [true],
        points: [points]
      })
    );
  }

  removeAnswer(index: number) {
    this.answers.removeAt(index);
  }

  get answers() {
    return this.questionForm.get('answers') as FormArray;
  }
}
