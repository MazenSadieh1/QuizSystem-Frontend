import {Question} from "./question";
import {Subject} from "../enums/Subject.enum";

export interface Quiz{
  id: number;
  title: string;
  creator: string;
  subject: Subject;
  password: string;
  questions: Question[];
  points: number;
}
