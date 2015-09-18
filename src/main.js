import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';


var Operation = {
  AddItem: item =>
      state => _.extend(state, {
    items: state.items.concat(item)
  }),
  RemoveById: item =>
      state => _.extend(state, {
    items: state.items.filter(i => i.id !== item.id)
  })
};

function intent(DOM) {
  return {
    newItems: DOM.get('input', 'change').
      map(evt => evt.target.value).
      filter(val => val.trim().length).
      map(val => ({
        id: _.uniqueId('item_'),
        val: val
      })),
    deletedItems: DOM.get('li', 'remove').
      map(evt => evt.detail)
  }
}

function model(actions) {
  return Observable.
    merge(
      actions.newItems.map(item => Operation.AddItem(item)),
      actions.deletedItems.map(item => Operation.RemoveById(item))
    ).
    scan({ items: [] }, (state, operation) => operation(state));
}

function view(state) {
  return state.
    startWith({ items: [] }).
    map(state =>
      h('div', [
        h('input', {type: 'text', value: ''}),
        h('ul', state.items.map(item =>
            h('item', {
              val: item.val,
              id: item.id,
              key: item.id
            })
        ))
      ])
  );
}

function main({DOM}) {
  return {
    DOM: view(model(intent(DOM)))
      .catch((err) => {
        console.error(err.stack);
        debugger;
      })
  }
}

window.debug = run(main, {
  DOM: makeDOMDriver('#app', {
    item: require('./element/item')
  })
});