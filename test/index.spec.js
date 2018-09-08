import { createLocalVue } from '@vue/test-utils'
import Rivue from 'index'

const { Store, resolveParam, lookupDescriptor } = Rivue

describe('Rivue', () => {
  it('is a valid Vue plugin', () => {
    const Vue = createLocalVue()
    const install = () => Vue.use(Rivue)
    expect(install).not.to.throw()
  })

  describe('Store', () => {
    let classStore, objectStore

    // Fixtures
    class Things {
      // State
      list = []
      number = 42
      string = 'test'
      object = { foo: 'bar' }

      // Getters/Setters
      get numberPlusFive() {
        return this.number + 5
      }

      // Actions
      listAction() {
        this.list.push({ abc: 123 })
        this.number = 5
        return this
      }
    }

    function OldThings() {
      // State
      this.list = []
      this.number = 42
      this.string = 'test'
      this.object = {}
      this.object.foo = 'bar'

      // Getters/Setters
      Object.defineProperty(this, 'numberPlusFive', {
        get: function() {
          return this.number + 5
        },
      })

      // Actions
      var self = this
      this.listAction = function() {
        self.list.push({ abc: 123 })
        self.number = 5
        return self
      }
    }

    beforeEach(() => {
      classStore = new Store({
        Things,
        OldThings,
      })

      objectStore = new Store({
        things: {
          list: [],
          number: 42,
          string: 'test',
          object: { foo: 'bar' },
          get numberPlusFive() {
            return this.number + 5
          },
          listAction() {
            this.list.push({ abc: 123 })
            this.number = 5
            return this
          },
        }
      })
    })

    it('accepts a class', () => {
      expect(classStore.things).to.have.observable('list')
      expect(classStore.things).to.have.observable('number')
      expect(classStore.things).to.have.observable('string')
      expect(classStore.things).to.have.observable('object')
      expect(classStore.things.object).to.have.observable('foo')
      expect(classStore.things).to.have.observable('numberPlusFive')
    })

    it('accepts an ES5 class', () => {
      expect(classStore.oldthings).to.have.observable('list')
      expect(classStore.oldthings).to.have.observable('number')
      expect(classStore.oldthings).to.have.observable('string')
      expect(classStore.oldthings).to.have.observable('object')
      expect(classStore.oldthings.object).to.have.observable('foo')
      expect(classStore.things).to.have.observable('numberPlusFive')
    })

    it('accepts an object', () => {
      expect(classStore.things).to.have.observable('list')
      expect(classStore.things).to.have.observable('number')
      expect(classStore.things).to.have.observable('string')
      expect(classStore.things).to.have.observable('object')
      expect(classStore.things.object).to.have.observable('foo')
      expect(classStore.things).to.have.observable('numberPlusFive')
    })

    it('provides stores without extraneous properties', () => {
      const store = new Store({
        things: {
          list: [],
          number: 42,
          string: 'test',
          object: { foo: 'bar' },
          func: () => {},
          anotherFunc() {},
        }
      })

      const keys = Object.keys(store.things)
      expect(keys).to.eql(['list', 'number', 'string', 'object', 'func', 'anotherFunc'])
    })

    it('provides stores that are serializable', () => {
      const store = new Store({ abc: { def: 42 } })
      const serialize = JSON.stringify(store)
      expect(serialize).not.to.throw
    })

    it('provides the root store as a property', () => {
      const store = new Store({ things: {} })
      expect(store.things.$store).to.equal(store)
    })
  })

  describe('Vue instance', () => {
    describe('state provider', () => {
      const Vue = createLocalVue()
      Vue.use(Rivue)

      let store, root

      beforeEach(() => {
        store = new Store({
          things: {
            list: [],
            object: { foo: 'bar' },
            string: 'test',
            number: 42,
            get numberPlusFive() {
              return this.number + 5
            },
          },
        })

        root = new Vue({ store })
      })

      it('works with a string', () => {
        const component = new Vue({
          parent: root,
          state: 'things.object',
        })

        expect(component.object).to.equal(store.things.object)
      })

      it('works with arrays', () => {
        const component = new Vue({
          parent: root,
          state: ['things.object', 'things.object.foo', 'things.number'],
        })

        expect(component.object).to.equal(store.things.object)
        expect(component.foo).to.equal(store.things.object.foo)
        expect(component.number).to.equal(store.things.number)
      })

      it('works with objects', () => {
        const component = new Vue({
          parent: root,
          state: { things: ['object', 'object.foo', 'number'] },
        })

        expect(component.object).to.equal(store.things.object)
        expect(component.foo).to.equal(store.things.object.foo)
        expect(component.number).to.equal(store.things.number)
      })

      it('provides reactive properties', () => {
        const component = new Vue({
          parent: root,
          state: { things: ['list', 'number', 'object']},
        })

        expect(component).to.have.observable('list')
        expect(component).to.have.observable('number')
        expect(component.object).to.have.observable('foo')
      })

      it('synchronizes changes with the store', () => {
        const component = new Vue({
          parent: root,
          state: { things: ['list', 'number', 'object'] },
        })

        component.list.push(5)
        component.number = 2
        component.object.foo = 'zed'

        expect(store.things.list).to.eql([5])
        expect(store.things.number).to.equal(2)
        expect(store.things.numberPlusFive).to.equal(7)
        expect(store.things.object.foo).to.equal('zed')
      })
    })

    describe('action provider', () => {
      const Vue = createLocalVue()
      Vue.use(Rivue)

      let store, root

      beforeEach(() => {
        store = new Store({
          things: {
            state: [],
            simpleAction() {
              this.state.push(42)
              return this.state
            },
            actionWithParam(param) {
              this.state = param
            },
          },
        })

        root = new Vue({ store })
      })

      it('works with a string', () => {
        const component = new Vue({
          parent: root,
          actions: 'things.simpleAction',
        })

        expect(component.simpleAction).to.equal(store.things.simpleAction)
      })

      it('works with arrays', () => {
        const component = new Vue({
          parent: root,
          actions: ['things.simpleAction', 'things.actionWithParam'],
        })

        expect(component.simpleAction).to.equal(store.things.simpleAction)
        expect(component.actionWithParam).to.equal(store.things.actionWithParam)
      })

      it('works with objects', () => {
        const component = new Vue({
          parent: root,
          actions: { things: ['simpleAction', 'actionWithParam'] },
        })

        expect(component.simpleAction).to.equal(store.things.simpleAction)
        expect(component.actionWithParam).to.equal(store.things.actionWithParam)
      })

      it('provides actions that are the same as the original', () => {
        const component = new Vue({
          parent: root,
          actions: { things: 'simpleAction' },
        })

        expect(component.simpleAction).to.equal(store.things.simpleAction)
      })

      it('actions run in the correct context', () => {
        const component = new Vue({
          parent: root,
          actions: { things: 'simpleAction' },
        })
        const result = component.simpleAction()

        expect(result).to.equal(store.things.state)
        expect(store.things.state).to.eql([42])
      })
    })
  })
})
