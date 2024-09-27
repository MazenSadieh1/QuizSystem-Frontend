import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDeleteQuizComponent } from './edit-delete-quiz.component';

describe('EditDeleteQuizComponent', () => {
  let component: EditDeleteQuizComponent;
  let fixture: ComponentFixture<EditDeleteQuizComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EditDeleteQuizComponent]
    });
    fixture = TestBed.createComponent(EditDeleteQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
