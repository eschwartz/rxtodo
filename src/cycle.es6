import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/web';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';


var StateChangers = {
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
      })),
    deletedItems: DOM.get('li', 'remove').
      map(evt => evt.detail)
  }
}


Observable.fromActions = function(actions, seed) {
  return Observable.merge.apply(Observable, actions).
    scan(seed, (seedVal, action) => action(seedVal));
};

Observable.prototype.applyTo = function(seed) {
  return this.scan(seed, (seedVal, operation) => operation(seedVal)).startWith(seed);
};

function model(actions) {
  return Observable.merge(
    actions.newItems.map(StateChangers.AddItem),
    actions.deletedItems.map(StateChangers.RemoveById)
  ).
    applyTo({
      items: []
    });
}

function view(state) {
  return state.map(state =>
      h('div', [
        h('input', {type: 'text'}),
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
        console.err(err.stack);
        debugger;
      })
  }
}

window.debug = run(main, {
  DOM: makeDOMDriver('#app', {
    item: require('./element/item')
  })
});