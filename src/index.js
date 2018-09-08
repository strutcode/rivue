import Vue, { util } from 'vue'

export class Store {
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

function lookupDescriptor(root, desc) {
  const ids = desc.split('.')
  const name = ids[ids.length - 1]
  let parent
  let value = root

  for (let i = 0; i < ids.length; i++) {
    if (typeof value !== 'object' || value[ids[i]] === undefined) {
      break
    }

    parent = value
    value = value[ids[i]]
  }

  return { parent, name, value }
}

function resolveParam(store, param) {
  if (Array.isArray(param)) {
    return param.map(lookupDescriptor.bind(null, store))
  }
  if (typeof param === 'object') {
    const flatLookup = (acc, [key, value]) => {
      const resolved = resolveParam(store[key], value)
      return acc.concat(resolved)
    }

    return Object.entries(param).reduce(flatLookup, [])
  }
  if (typeof param === 'string') {
    return [lookupDescriptor(store, param)]
  }

  return []
}

const Rivue = {
  Store,
  install(Vue, options) {
    Vue.mixin({
      beforeCreate() {
        const options = this.$options

        if (!options.parent && options.store) {
          if (!(options.store instanceof Store)) {
            throw new Error('provided store is not a Rivue store')
          }

          this.$store = options.store
        }

        if (options.parent && options.parent.$store) this.$store = options.parent.$store

        // Init
        const store = this.$store
        const init = name => typeof options[name] === 'function' ? options[name]() : options[name] || {}

        options.data = init('data')
        options.computed = init('computed')
        options.methods = init('methods')

        if (options.state) {
          const map = resolveParam(store, options.state)

          // TODO: verification

          map.forEach(({ parent, name }) => {
            options.computed[name] = {
              get: function() {
                return parent[name]
              },
              set: function(val) {
                parent[name] = val
              }
            }
          })
        }
      },
      created() {
        const options = this.$options
        const store = this.$store

        if (options.stores) {
          const map = resolveParam(store, options.stores)

          // TODO: verification

          map.forEach(({ name, value }) => {
            this[name] = value
          })
        }

        if (options.actions) {
          const map = resolveParam(store, options.actions)

          // TODO: verification

          map.forEach(({ parent, name, value }) => {
            this[name] = value
          })
        }
      }
    })
  },
}

if (global.Vue) global.Vue.use(Rivue)

export default Rivue
