import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableQuizComponent } from './table-quiz.component';

describe('TableQuizComponent', () => {
  let component: TableQuizComponent;
  let fixture: ComponentFixture<TableQuizComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TableQuizComponent]
    });
    fixture = TestBed.createComponent(TableQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
