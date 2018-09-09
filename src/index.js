import Store from 'Store'
import { lookupDescriptor, resolveParam } from 'util'

function install(Vue, options) {
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
}

const Rivue = {
  Store,
  install,
}

if (global.Vue) global.Vue.use(Rivue)

export {
  Store,
  install,
}
export default Rivue
