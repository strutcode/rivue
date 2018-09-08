import { util } from 'vue'

export default class Store {
  constructor(stores) {
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
          util.defineReactive(instance, key, instance[key].bind(instance))
        }

        util.defineReactive(instance, key)
      })

      Object.defineProperty(instance, '$store', {
        value: this,
        configurable: false,
        enumerable: false,
      })

      this[storeName] = instance
    })
  }
}
