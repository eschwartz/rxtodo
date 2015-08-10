import Rx from 'rx';


Rx.Observable.fromActions = function(actions, seed) {
  return Observable.merge.apply(Observable, actions).
    scan(seed, (seedVal, action) => action(seedVal));
};

Rx.Observable.prototype.applyTo = function(seed) {
  return this.scan(seed, (seedVal, operation) => operation(seedVal)).startWith(seed);
};

module.exports = Rx;

