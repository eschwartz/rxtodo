import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/web';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';


var Actions = {
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
      map(item => Actions.AddItem(item))
    ,
    removeItem: DOM.get('.deleteBtn', 'click').
      map(evt => ({
        id: evt.target.dataset.itemId
      })).
      map(item => Actions.RemoveById(item))
  }
}


Observable.fromActions = function(actions, seed) {
  return Observable.merge.apply(Observable, actions).
    scan(seed, (seedVal, action) => action(seedVal));
};

function model(actions) {
  var initialState = {
    items: []
  };
  return Observable.fromActions(_.values(actions), initialState).
    startWith(initialState);
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
      .catch((err) => {
        console.err(err.stack);
      })
  }
}

window.debug = run(main, {
  DOM: makeDOMDriver('#app')
});