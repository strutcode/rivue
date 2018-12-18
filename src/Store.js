import Vue from 'vue'

import History from 'History'
import { clone, createSnapshot, iterateObject, hidden } from 'util'

export default class Store {
  @hidden _subscribers = []

  constructor(stores) {
    if (!stores) return

    iterateObject(stores, (name, Constructor) => {
      const storeName = name.toLowerCase()

      let instance, props

      if (typeof Constructor === 'function') {
        instance = new Constructor()
        props = [
          ...Object.getOwnPropertyNames(Constructor.prototype),
          ...Object.getOwnPropertyNames(instance),
        ]
      }
      else if (typeof Constructor === 'object') {
        instance = clone(Constructor)
        props = Object.getOwnPropertyNames(instance)
      }
      else {
        throw new Error(`Provided store '${name}' is not a class or object`)
      }

      props.forEach(key => {
        if (typeof instance[key] === 'function') {
          const original = instance[key]

          Vue.util.defineReactive(instance, key, (...args) => {
            const oldState = createSnapshot(instance)
            const result = original.apply(instance, args)
            const newState = createSnapshot(instance)

            const change = {
              store: storeName,
              action: key,
              oldState,
              newState,
            }
            this._subscribers.forEach(f => f(change))

            return result
          })
        }
        else {
          Vue.util.defineReactive(instance, key)
        }
      })

      Object.defineProperty(instance, '$store', {
        value: this,
        configurable: false,
        enumerable: false,
      })

      this[storeName] = instance
    })

    this.$history = new History(this)
  }

  @hidden $history

  $subscribe(callback) {
    this._subscribers.push(callback)
  }

  $serialize() {
    return createSnapshot(this)
  }

  $replace(store, newState) {
    if (!this[store]) {
      throw new Error(`Invlid store '${store}'`)
    }

    iterateObject(newState, (key, value) => {
      if (typeof value === 'object') {
        this[store][key] = clone(value)
      }
      else {
        this[store][key] = value
      }
    })
  }

  $replaceAll(newState) {
    iterateObject(newState, (key, value) => this.$replace(key, value))
  }
}
