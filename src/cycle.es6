import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/web';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';

function main(responses) {
  var updates = new BehaviorSubject(x => x);

  var todos = updates.
    scan([], (todos, operation) => operation(todos));

  var state = todos.
    startWith([]).
    map(todos => ({
      items: todos
    }));

  responses.DOM.get('input', 'change').
    map(evt => {
      var value = evt.target.value;
      evt.target.value = '';
      evt.target.focus();
      return value;
    }).
    filter(val => val.trim().length).
    map(val => ({
      id: _.uniqueId('item_'),
      val: val
    })).
    map(item =>
        todos => todos.concat(item)).
    subscribe(updates);

  responses.DOM.get('.deleteBtn', 'click').
    map(evt => ({
      id: evt.target.dataset.itemId
    })).
    map(deletedItem =>
      todos => todos.filter(item => item.id !== deletedItem.id)).
      subscribe(updates);

  return {
    DOM: state.map(state =>
        h('div', [
          h('input', {type: 'text'}),
          h('ul', state.items.map(item =>
              h('li', [
                item.val,
                h('button', {
                  attributes: {
                    'data-item-id': item.id,
                    'class': 'deleteBtn'
                  }
                }, ['X'])
              ])
          ))
        ])
    ).catch(function() {
        debugger;
      })
  }
}

window.debug = run(main, {
  DOM: makeDOMDriver('#app')
});