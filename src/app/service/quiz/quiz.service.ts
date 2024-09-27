import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Quiz} from "../../interfaces/quiz";


@Injectable({ providedIn: 'root' })
export class QuizService {

  private baseURl = "http://localhost:8080/api/v1";

  constructor(private httpClient: HttpClient) { }

  getQuizList(): Observable<Quiz[]>{//promis
    return this.httpClient.get<Quiz[]>(`${this.baseURl}/quizzes`);
  }

  getQuiz(quizId: number): Observable<Quiz> {
    return this.httpClient.get<Quiz>(`${this.baseURl}/quiz/${quizId}`);
  }

  checkIfTitleExists(title:string): Observable<boolean>{
    return this.httpClient.get<boolean>(`${this.baseURl}/quizzes/title?title=${title}`);
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.httpClient.post<Quiz>(`${this.baseURl}/quiz`, quiz, { headers: { 'Content-Type': 'application/json' } });
  }

  deleteQuiz(quizId: number): Observable<Quiz> {
    return this.httpClient.delete<Quiz>(`${this.baseURl}/quiz/${quizId}`);
  }

  updateQuiz(quizId: number, quiz: Quiz): Observable<Quiz> {
    return this.httpClient.put<Quiz>(`${this.baseURl}/quiz/${quizId}`, quiz, { headers: { 'Content-Type': 'application/json' } });
  }

}
