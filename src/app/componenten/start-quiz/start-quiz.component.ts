import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavbarComponent} from "../navbar/navbar.component";
import {Question} from "../../interfaces/question";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {QuizService} from "../../service/quiz/quiz.service";
import {Answer} from "../../interfaces/answer";

@Component({
  selector: 'app-start-quiz',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './start-quiz.component.html',
  styleUrls: ['./start-quiz.component.css']
})
export class StartQuizComponent implements OnInit {

  check = signal<boolean>(false);
  quizID: number = 0;
  public quizForm!: FormGroup;
  public blankAnswers = new Map<string, string>;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quizID = params['id'];
      this.quizService.getQuiz(this.quizID).subscribe({
          next: res => {
            res.questions.sort((a: Question, b: Question) => {
              if (a.id === undefined || b.id === undefined) {
                return 0;
              }
              return a.id - b.id;
            });

            this.quizForm = this.formBuilder.group({
              id: [res.id, Validators.required],
              subject: [res.subject, Validators.required],
              title: [res.title, Validators.required],
              creator: [res.creator, Validators.required],
              points: [res.points, Validators.required],
              questions: this.formBuilder.array(res.questions.map(question => this.createQuestionFormGroup(question)))
            });
          },
          error: err => {
            // maybe also redirect to another page?
            console.error(err)
          }
        }
      );
    });
  }

  createQuestionFormGroup(question: Question): FormGroup {

    question.answers.sort((a: Answer, b: Answer) => {
      if (a.id === undefined || b.id === undefined) {
        return 0;
      }
      return a.id - b.id;
    });

    return this.formBuilder.group({
      id: [question.id],
      type: [question.type],
      text: [question.text],
      points: [question.points],
      answers: this.formBuilder.array(question.answers.map(answer => this.createAnswerFormGroup(answer))),
      userAnswers: this.formBuilder.array(question.answers.map(() => this.createAnswerFormGroup())),
      blanks: this.formBuilder.array(this.stringToArray(question.answers[0].text).map(() => this.createAnswerFormGroup())),
    });
  }

  createAnswerFormGroup(answer: Answer | null = null): FormGroup {
    return this.formBuilder.group({
      id: [answer?.id ?? null],
      text: [answer?.text ?? ''],
      correct: [answer?.correct ?? false],
      points: [answer?.points ?? 0]
    });
  }


  stringToArray(inputString: string | undefined | null): string[] {
    if (inputString?.trim) {
      return inputString.trim().split(",");
    } else {
      return [];
    }
  }

  getFormControl(path: (string | number)[]): FormControl {
    return this.quizForm.get(path) as FormControl;
  }

  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

  getBlanks(i: number): FormArray {
    return (this.quizForm.get(['questions', i, 'blanks']) as FormArray);
  }

  getBlankControl(i: number, j: number): FormControl {
    return this.getBlanks(i).at(j) as FormControl;
  }

  userQuestionPoints(i: number): number {
    const question = this.quizForm.get(['questions', i]);

    if (!question) {
      return 0; // handle case where question form group is not found
    }

    let userAnswers: any[];
    let correctAnswers: any[];

    if (question.value.type === 'FILL_IN_THE_BLANK') {
      correctAnswers = this.stringToArray(question.value.answers[0].text);
      const pointForEachBlank = (question.value.points / correctAnswers.length);

      return correctAnswers.reduce((sum: number, blank, j) => {

        return this.getBlankAnswers(i, j) === blank ? sum + pointForEachBlank : sum;
      }, 0);

    } else if (question.value.type === 'MULTIPLE_CHOICE') {
      if (this.isAllCorrect(i))
        return question.value.points;
      else
        return 0;
    } else {
      userAnswers = this.getFormControl(['questions', i, 'userAnswers']).value;
      correctAnswers = this.getFormControl(['questions', i, 'answers']).value;
      return userAnswers.reduce((sum: number, answer, j) => {
        return answer.correct === correctAnswers[j].correct ? sum + correctAnswers[j].points : sum;
      }, 0);
    }
  }

  userTotalPoints(): number {
    const questions = this.quizForm.get('questions')?.value;

    if (!questions) {
      return 0; // handle case where questions form array is not found
    }

    return questions.reduce((sum: number, question: Question, index: number) => {
      return sum + this.userQuestionPoints(index);
    }, 0);
  }

  checkIt(): void {
    this.check.update(res => !res);
  }

  isCorrect(i: number, j: number): boolean {
    const question = this.quizForm.get(['questions', i]);

    if (!question) {
      return false; // handle case where question form group is not found
    }

    const userAnswer = question.value.type === 'FILL_IN_THE_BLANK' ?
      // changed for blanks answers
      this.getBlankAnswers(i, j) :
      this.getFormControl(['questions', i, 'userAnswers', j, 'correct']).value;

    const correctAnswer = question.value.type === 'FILL_IN_THE_BLANK' ?
      this.stringToArray(question.value.answers[0].text)[j] :
      this.getFormControl(['questions', i, 'answers', j, 'correct']).value;

    return userAnswer === correctAnswer;
  }

  isAllCorrect(i: number): boolean {
    const question = this.quizForm.get(['questions', i]);
    if (!question) {
      return false; // handle case where question form group is not found
    }

    if (question.value.type === 'FILL_IN_THE_BLANK') {
      const correctBlanks = this.stringToArray(question.value.answers[0].text);

      return correctBlanks.every((blank: any, j: number) => blank === this.getBlankAnswers(i, j));
    } else {
      const userAnswers = this.getFormControl(['questions', i, 'userAnswers']).value;
      const correctAnswers = this.getFormControl(['questions', i, 'answers']).value;

      return userAnswers.every((answer: any, j: number) => answer.correct === correctAnswers[j].correct);
    }
  }

  isAllIncorrect(i: number): boolean {
    const question = this.quizForm.get(['questions', i]);

    if (!question) {
      return false; // handle case where question form group is not found
    }

    if (question.value.type === 'FILL_IN_THE_BLANK') {
      const correctBlanks = this.stringToArray(question.value.answers[0].text);

      return correctBlanks.every((blank: any, j: number) => blank !== this.getBlankAnswers(i, j));
    } else {
      const userAnswers = this.getFormControl(['questions', i, 'userAnswers']).value;
      const correctAnswers = this.getFormControl(['questions', i, 'answers']).value;

      return userAnswers.every((answer: any, j: number) => answer.correct !== correctAnswers[j].correct);
    }
  }

  protected readonly FormControl = FormControl;

  saveBlankResponse(input: any, questionIndex: number, blankIndex: number) {
    console.log(input?.target?.value);

    const key = `${questionIndex},${blankIndex}`;
    this.blankAnswers.set(key, input?.target?.value);


  }

  getBlankAnswers(questionIndex: number, blankIndex: number) {
    const key = `${questionIndex},${blankIndex}`;
    return this.blankAnswers.get(key);
  }

}
