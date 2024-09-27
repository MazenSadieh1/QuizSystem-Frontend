import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomeComponent} from "./componenten/welcome/welcome.component";
import {AddQuizComponent} from "./componenten/add-quiz/add-quiz.component";
import {QuizManagementComponent} from "./componenten/quiz-management/quiz-management.component";
import {SelectQuizComponent} from "./componenten/select-quiz/select-quiz.component";
import {EditQuizComponent} from "./componenten/edit-quiz/edit-quiz.component";
import {EditDeleteQuizComponent} from "./componenten/edit-delete-quiz/edit-delete-quiz.component";
import {StartQuizComponent} from "./componenten/start-quiz/start-quiz.component";

const routes: Routes =[
  {path: '', component: WelcomeComponent},
  {path: 'add-quiz', component: AddQuizComponent},
  {path: 'quiz-management', component: QuizManagementComponent},
  {path: 'select-quiz', component: SelectQuizComponent},
  {path: 'edit-quiz/:id', component: EditQuizComponent},
  {path: 'edit-delete-quiz', component: EditDeleteQuizComponent},
  {path: 'start-quiz/:id', component: StartQuizComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
