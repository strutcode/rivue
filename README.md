![npm](https://img.shields.io/npm/v/rivue.svg?style=flat-square)
![npm dependencies](https://img.shields.io/badge/dependencies-0-green.svg?style=flat-square)
![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/rivue.svg?style=flat-square)
[![GitHub license](https://img.shields.io/github/license/strutcode/rivue.svg?style=flat-square)](https://github.com/strutcode/rivue/blob/master/LICENSE)

# Rivue
A clean, no frills Flux alternative for Vue.js 2.x.

## WARNING
Rivue is experimental software and is not finished. It is under active development and interfaces/functionality may change.

Please feel free to provide feedback and suggestions via [Github](https://github.com/strutcode/rivue/issues).

## Why Rivue
Frustrated by all of the boilerplate and inconvenience of traditional state management? Me too!

Wouldn't it be cool if you could define your store in a straightforward manner with no boilerplate?

```javascript
class Todos {
  // State
  list = []

  // Getter
  get count() {
    return this.list.length
  }

  // Action
  add(title) {
    this.list.push(title)
  }

  // Async action!
  async loadFromServer() {
    this.list = await axios.get('http://api.mysite.com/todos')
  }
}
```

What if you could do that while keeping all of the book keeping and time traveling features of Flux-like state managers? Plus integrate with Vue for reactive component rendering?

Enter Rivue!

## Try it Out
Check out the [Sandbox on CodePen](https://codepen.io/strutcode/pen/mGMMEP?editors=1010) to get your feet wet right away.

## Installation

For CommonJS environments (Node, Webpack)
```bash
npm install --save rivue
```

For use in browser:
```
https://unpkg.com/rivue
```

## Getting Started

Using ES6+ syntax:
```js
import Vue from 'vue'
import Rivue, { Store } from 'rivue'

// #1 Install the plugin
Vue.use(Rivue)

// #2 Define a module
class Todos {
  list = []
  title = ''

  add() {
    this.list.push({ title: this.title })
    this.title = ''
  }
}

new Vue({
  // #3 Provide your root instance a store containing your module(s)
  store: new Store({ Todos }),

  // Sample usage
  stores: ['todos'],
  template: `
    <div>
      <ul>
        <li v-for="todo in todos.list">{{todo.title}}</li>
      </ul>

      <input v-model="todos.title" />
      <button @click="todos.add">Add Todo</button>
    </div>
  `,
})
```

Rivue also accepts simple objects and ES5 syntax:
```js
/* ... */

// ES5 class syntax
var People = function() {
  this.list = []

  this.add = function(person) {
    this.list.push(person)
  }
}

// Plain object, mixing in our class
var store = new Rivue.Store({
  people: People,
  todos: {
    list: [],
    title: '',
    add: function() {
      this.list.push({ title: this.title })
      this.title = ''
    }
  }
})

/* ... */
```

## License
MIT
