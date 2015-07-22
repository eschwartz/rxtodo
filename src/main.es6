import {Observable} from 'rx';
import $ from 'jquery';
$('body').html(`
  <div id="app">
    <input type="text"/>
    <ul></ul>
  </div>
`);


var foo ='bar';

var $app = $('#app');
var $input = $app.children('input');
var $list = $app.children('ul');
var entries$ = Observable.fromEvent($input[0], 'change').
  map(evt => evt.target.value).
  filter(val => val.trim().length).
  tap(() => $input.val(''));

entries$.
  map(item => `
    <li>Item: ${item}</li>
  `).
  map(html => $(html)).
  forEach($item => $list.append($item));