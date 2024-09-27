import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Question} from "../../interfaces/question";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private baseURl = "http://localhost:8080/api/v1";

  constructor(private httpClient: HttpClient) { }

  getQuestionList(): Observable<Question[]>{//promis
    return this.httpClient.get<Question[]>(`${this.baseURl}/questions`);
  }

  getQuestion(questionId: number): Observable<Question> {
    return this.httpClient.get<Question>(`${this.baseURl}/question/${questionId}`);
  }

  createQuestion(question: Question): Observable<Question> {
    return this.httpClient.post<Question>(`${this.baseURl}/question`, question, { headers: { 'Content-Type': 'application/json' } });
  }

  deleteQuestion(questionId: number): Observable<Question> {
    return this.httpClient.delete<Question>(`${this.baseURl}/question/${questionId}`);
  }

  updateQuestion(questionId: number,question: Question): Observable<Question> {
    return this.httpClient.put<Question>(`${this.baseURl}/question/${questionId}`, question, { headers: { 'Content-Type': 'application/json' } });
  }

}
