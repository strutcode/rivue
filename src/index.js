import Vue from 'vue'

export class Store {
  constructor(stores) {
    Object.entries(stores).forEach(([name, Constructor]) => {
      const storeName = name.toLowerCase()
      const data = {}
      const computed = {}
      const methods = {}

      let instance, props

      if (typeof Constructor === 'function') {
        instance = new Constructor()
        props = Object.assign(
          {},
          Object.getOwnPropertyDescriptors(Constructor.prototype),
          Object.getOwnPropertyDescriptors(instance),
        )
      }
      else if (typeof Constructor === 'object') {
        instance = Constructor
        props = Object.getOwnPropertyDescriptors(instance)
      }
      else {
        throw new Error(`Provided store '${name}' is not a class or object`)
      }

      Object.entries(props).forEach(([name, descriptor]) => {
        if (descriptor.get) {
          computed[name] = descriptor.get
        }
        else if (typeof descriptor.value === 'function') {
          if (name === 'constructor') return
          methods[name] = descriptor.value
        }
        else {
          data[name] = descriptor.value
        }
      })

      this[storeName] = new Vue({ data, computed, methods })
      this[storeName].$store = this
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

if (window && window.Vue) window.Vue.use(Rivue)

export default Rivue
