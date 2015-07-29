import {Observable, BehaviorSubject} from 'rx';
import $ from 'jquery';
import _ from 'lodash';


Observable.fromLiveEvent = function($scope, eventType, selector) {
  return Observable.create(observer => {
    var handler = evt => observer.onNext(evt);
    $scope.on(eventType, selector, handler);

    return () => $scope.off(eventType, selector, handler);
  });
};

$.prototype.toObservable = function(eventType, selector) {
  return Observable.fromLiveEvent(this, eventType, selector);
};

$('body').html(`<div id="app"></div>`);


var $app = $('#app');

var updates = new BehaviorSubject(x => x);

var enteredItems$ = $app.toObservable('change', 'input').
  map(evt => evt.target.value).
  filter(val => val.trim().length).
  map(val => ({
    id: _.uniqueId('item_'),
    val: val
  }));

var deletedItems$ = $app.toObservable('click', 'li > .deleteBtn').
  map(evt => ({
    id: evt.target.dataset.itemId
  }));


var deleteOperations$ = deletedItems$.
  map(deletedTodo =>
      todos => todos.filter(todo => todo.id !== deletedTodo.id));

var addOperations$ = enteredItems$.
  map(addedTodo =>
      todos => todos.concat(addedTodo));

deleteOperations$.subscribe(updates);
addOperations$.subscribe(updates);

var todos = updates.
  scan([], (todos, operation) => operation(todos));


var state$ = todos.
  map(items => ({
    items: items
  }));

state$.subscribe(render);

render({
  items: []
});

function render(state) {
  console.log('state', state);
  return $app.html(`
    <input type="text" />
    <ul>
      ${state.items.map(item => `
        <li>${item.val} <button data-item-id="${item.id}" class="deleteBtn">X</button></li>
      `).join('')}
    </ul>
  `);
}


