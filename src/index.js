import Store from 'Store'
import { resolveParam } from 'util'

function install(Vue, pluginOptions) {
  Vue.mixin({
    beforeCreate() {
      const options = this.$options

      if (!options.parent && options.store) {
        if (DEVELOPMENT) {
          if (!(options.store instanceof Store)) {
            throw new Error('provided store is not a Rivue store')
          }
        }

        this.$store = options.store
      }

      if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store
      }

      if (options.state) {
        const map = resolveParam(this.$store, options.state)
        const componentName = this.name || this.constructor.name
  
        // TODO: verification
  
        if (!this.$options.computed) this.$options.computed = {}
        map.forEach(({ parent, name, value }) => {
          if (value === undefined) {
            if (DEVELOPMENT) {
              console.warn(`Store '${parentName}' doesn't provide state '${name}' in <${componentName}>`)
            }
          }
          else {
            this.$options.computed[name] = {
              get: function () {
                return parent[name]
              },
              set: function (val) {
                parent[name] = val
              }
            }
          }
        })
      }
    },
    created() {
      const options = this.$options
      const store = this.$store
      const componentName = this.name || this.constructor.name

      if (options.actions) {
        const map = resolveParam(store, options.actions)

        map.forEach(({ parentName, name, value }) => {
          if (DEVELOPMENT) {
            if (!value || typeof value !== 'function') {
              console.warn(`Store '${parentName}' doesn't provide an action '${name}' in <${componentName}>`)
            }
          }
        
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
