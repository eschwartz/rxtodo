import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/web';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';


function intent(DOM) {
  return {
    addItem: DOM.get('input', 'change').
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
          todos => todos.concat(item))
    ,
    removeItem: DOM.get('.deleteBtn', 'click').
      map(evt => ({
        id: evt.target.dataset.itemId
      })).
      map(deletedItem =>
          todos => todos.filter(item => item.id !== deletedItem.id))
  }
}

function model(actions) {
  return Observable.merge(
    actions.addItem,
    actions.removeItem
  ).
    scan([], (todos, action) => action(todos)).
    startWith([]).
    map(todos => ({
      items: todos
    }));
}

function view(state) {
  return state.map(state =>
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
  );
}

function main({DOM}) {
  return {
    DOM: view(model(intent(DOM)))
      .catch(() => {
        debugger;
      })
  }
}

window.debug = run(main, {
  DOM: makeDOMDriver('#app')
});