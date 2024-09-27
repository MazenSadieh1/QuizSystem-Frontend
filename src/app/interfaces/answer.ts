import {Question} from "./question";

export interface Answer{
  id?: number;
  text: string;
  correct: boolean;
  points: number;
  question?: Question
}
