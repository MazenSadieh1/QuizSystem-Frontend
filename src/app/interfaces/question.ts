import {QuestionType} from "../enums/QuestionType.enum";
import {Answer} from "./answer";
import {Quiz} from "./quiz";

export interface Question{
  id?: number;
  text: string;
  type: QuestionType;
  answers: Answer[];
  quiz: Quiz;
  points: number;
}
