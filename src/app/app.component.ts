import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireAction } from '@angular/fire/database';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
  <h1>Firebase widgets!</h1>
  <div *ngIf="items$ | async; let items; else loading">
    <ul>
      <li *ngFor="let item of items">
        {{ item.payload.val().text }}
        <code>{{ item.payload.key }}</code>
      </li>
    </ul>
    <div *ngIf="items.length === 0">No results, try clearing filters</div>
  </div>
  <ng-template #loading>Loading&hellip;</ng-template>
  <div>
    <h4>Filter by size</h4>
    <button (click)="filterBy('small')">Small</button>
    <button (click)="filterBy('medium')">Medium</button>
    <button (click)="filterBy('large')">Large</button>
    <button (click)="filterBy('x-large')">Extra Large</button>
    <button (click)="filterBy(null)" *ngIf="this.size$.getValue()">
      <em>clear filter</em>
    </button>
  </div>
  `,
})
export class AppComponent {
  items$: Observable<AngularFireAction<firebase.database.DataSnapshot>[]>;
  size$: BehaviorSubject<string|null>;
  
  constructor(db: AngularFireDatabase) {
    this.size$ = new BehaviorSubject(null);
    this.items$ = this.size$.pipe(
      switchMap(size => 
        db.list('/items', ref =>
          size ? ref.orderByChild('size').equalTo(size) : ref
        ).snapshotChanges()
      )
    );
  }
  filterBy(size: string|null) {
    this.size$.next(size);
  }
}