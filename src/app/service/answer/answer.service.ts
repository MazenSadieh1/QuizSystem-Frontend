import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Answer} from "../../interfaces/answer";

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private baseURl = "http://localhost:8080/api/v1";

  constructor(private httpClient: HttpClient) { }

  getAnswerList(): Observable<Answer[]>{
    return this.httpClient.get<Answer[]>(`${this.baseURl}/answers`);
  }

  getAnswer(answerId: number): Observable<Answer> {
    return this.httpClient.get<Answer>(`${this.baseURl}/answer/${answerId}`);
  }

  createAnswer(answer: Answer): Observable<Answer> {
    return this.httpClient.post<Answer>(`${this.baseURl}/answer`, answer, { headers: { 'Content-Type': 'application/json' } });
  }

  deleteAnswer(answerId: number): Observable<Answer> {
    return this.httpClient.delete<Answer>(`${this.baseURl}/answer/${answerId}`);
  }

  updateAnswer(answerId: number, answer: Answer): Observable<Answer> {
    return this.httpClient.put<Answer>(`${this.baseURl}/answer/${answerId}`, answer, { headers: { 'Content-Type': 'application/json' } });
  }

}
