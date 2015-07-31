import {run} from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/web';
import {Observable, BehaviorSubject} from 'rx';
import _ from 'lodash';

module.exports = function Item(responses) {

  function intent(DOM) {
    return {
      remove: DOM.get('.deleteBtn', 'click')
    }
  }

  function view(state) {
    return state.map(state =>
        h('li', [
          state.val,
          h('button', {
            attributes: {
              'class': 'deleteBtn'
            }
          }, ['X'])
        ])
    );
  }

  function model(props, actions) {
    return props.getAll();
  }

  var actions = intent(responses.DOM);
  var state = model(responses.props, actions);
  return {
    DOM: view(state).catch((err) => {
      console.err(err.stack);
      debugger;
    }),
    events: {
      remove: actions.remove.
        // return item model on remove
        withLatestFrom(state, (evt, state) => state)
    }
  };
};