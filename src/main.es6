import {Observable, BehaviorSubject} from 'rx';
import $ from 'jquery';
import _ from 'lodash';
import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';


Observable.fromLiveEvent = function($scope, eventType, selector) {
  return Observable.create(observer => {
    var handler = evt => observer.onNext(evt);
    $scope.on(eventType, selector, handler);

    return () => $scope.off(eventType, selector, handler);
  });
};

$.prototype.observeEvent = function(eventType, selector) {
  return Observable.fromLiveEvent(this, eventType, selector);
};

$('body').html(`<div id="app"></div>`);


var $app = $('#app');

// Stream of added todo items
var newItems$ = $app.observeEvent('change', 'input').
  // ignore empty values
  filter(evt => evt.target.value.trim().length).
  // map to an Item object
  map(evt => ({
    id: _.uniqueId('item_'),
    val: evt.target.value
  }));

// Stream of deleted todo items
var deletedItems$ = $app.observeEvent('click', 'li > .deleteBtn').
  // Map to an item object
  map(evt => ({
    id: evt.target.dataset.itemId
  }));

// Merge add/remove actions into a todo list
var todos$ = Observable.merge(
  newItems$.map(AddItemAction),
  deletedItems$.map(RemoveItemAction)
).
  scan([], (todos, operation) => operation(todos));

var operations$ = new BehaviorSubject(x => x);

var state$ = todos$.
  startWith([]).
  map(todos => ({
    items: todos
  })).
  forEach(render);

var tree, rootNode;
function render(state) {
  var newTree =  h('div', [
    h('input', {
      type: 'text'
    }),
    h('ul', state.items.map(item =>
      h('li', [
        item.val,
        h('button', {
          'data-item-id': item.id,
          'class': 'deleteBtn'
        }, ['X'])
      ])
    ))
  ]);

  if (!tree) {
    tree = newTree;
    rootNode = createElement(tree);
    document.body.appendChild(rootNode);
    return;
  }

  var patches = diff(tree, newTree);
  rootNode = patch(rootNode, patches);
  tree = newTree;
}

function RemoveItemAction(item) {
  return collection => collection.filter(i => i.id !== item.id);
}

function AddItemAction(item) {
  return collection => collection.concat(item)
}

