import Vue, { util } from 'vue'

import { createSnapshot } from 'util'

const hidden = (t, v, d) => {
  d.enumerable = false
  return d
}

export default class Store {
  @hidden _stores = []
  @hidden _context = []

  constructor(stores) {
    if (!stores) return

    Object.entries(stores).forEach(([name, Constructor]) => {
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
        instance = Constructor
        props = Object.getOwnPropertyNames(instance)
      }
      else {
        throw new Error(`Provided store '${name}' is not a class or object`)
      }

      props.forEach(key => {
        if (typeof instance[key] === 'function') {
          const original = instance[key]
          util.defineReactive(instance, key, (...args) => {
            this._context = [key]
            return original.apply(instance, args)
          })
        }

        util.defineReactive(instance, key)
      })

      Object.defineProperty(instance, '$store', {
        value: this,
        configurable: false,
        enumerable: false,
      })

      this[storeName] = instance
      this._stores.push(storeName)
    })
  }

  $inspect(handler) {
    const opts = {
      data: this._stores.reduce(
        (acc, name) => {
          acc[name] = this[name]
          return acc
        },
        {},
      ),
      watch: this._stores.reduce(
        (watchers, name) => {
          let before = createSnapshot(this[name])
          watchers[name] = {
            handler: function(oldVal, newVal) {
              const after = createSnapshot(newVal)
              handler(before, after, this._context)
              before = after
            },
            deep: true,
          }
          return watchers
        },
        {},
      )
    }

    const watcher = new Vue(opts)
  }
}
