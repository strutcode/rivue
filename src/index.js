import Vue from 'vue'

export class Store {
  constructor(stores) {
    Object.entries(stores).forEach(([name, Constructor]) => {
      const data = {}
      const computed = {}
      const methods = {}

      const instance = new Constructor()
      const props = Object.getOwnPropertyDescriptors(instance)
      const funcs = Object.getOwnPropertyDescriptors(Constructor.prototype)

      Object.entries(props).forEach(([name, descriptor]) => {
        data[name] = descriptor.value
      })

      Object.entries(funcs).forEach(([name, descriptor]) => {
        if (name === 'constructor') return

        if (descriptor.get) {
          computed[name] = descriptor.get
        }
        else {
          methods[name] = descriptor.value
        }
      })

      this[name.toLowerCase()] = new Vue({ data, computed, methods })
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
  if (typeof param !== 'object') return // TODO: Warn?

  if (Array.isArray(param)) {
    return param.map(lookupDescriptor.bind(null, store))
  }

  return []
}

export default {
  Store,
  install(Vue, options) {
    Vue.mixin({
      beforeCreate() {
        const options = this.$options

        // Normal instance
        if (options.parent) {
          if (!options.parent.$store) return

          const init = name => typeof options[name] === 'function' ? options[name]() : options[name] || {}

          const store = this.$store = options.parent.$store
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

          return
        }

        if (!options.store) {
          console.warn(new Error('VuexAlt in use but no store provided'))
          return
        }

        if (!(options.store instanceof Store)) {
          throw new Error('provided store is not a vuexalt store')
        }

        // Init
        this.$store = options.store
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
  }
}
