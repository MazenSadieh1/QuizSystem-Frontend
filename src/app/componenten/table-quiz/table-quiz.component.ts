import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Quiz} from "../../interfaces/quiz";
import {QuizService} from "../../service/quiz/quiz.service";
import {RouterLink} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-table-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './table-quiz.component.html',
  styleUrls: ['./table-quiz.component.css']
})
export class TableQuizComponent implements OnInit {

  @Input() editQuiz: boolean | undefined;
  quizzes : Quiz[] = [];
  filteredQuizzes:Quiz[] = [];
  enteredPassword: string[] = [];
  isPasswordCorrect: boolean[] = [];

  constructor(private quizService: QuizService){}

  ngOnInit() {
    this.quizService.getQuizList().subscribe((data: Quiz[]) => {
      this.quizzes = data.sort((a, b) => a.id - b.id);
      this.filteredQuizzes = data;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredQuizzes = this.quizzes.filter(quiz =>
      quiz.id.toString().includes(filterValue) ||
      quiz.subject.toLowerCase().includes(filterValue) ||
      quiz.title.toLowerCase().includes(filterValue) ||
      quiz.creator.toLowerCase().includes(filterValue) ||
      quiz.questions.length.toString().includes(filterValue)
    );
  }

  removeQuiz(id: number): void {
    this.quizService.deleteQuiz(id).subscribe(
      (response ) => {
        console.log('Quiz erfolgreich entfernt',response);
        location.reload();
      }
    )
  }

  checkPassword(index: number, correctHashedPassword: string): void {
    const enteredPassword = this.enteredPassword[index];
    // Hash the entered password and compare it with the correct hashed password
    bcrypt.compare(enteredPassword, correctHashedPassword)
      .then(isMatch => {
        this.isPasswordCorrect[index] = isMatch;
      })
      .catch(err => {
        console.error('Error comparing passwords:', err);
        this.isPasswordCorrect[index] = false; // Fallback to false on error
      });
  }


}
