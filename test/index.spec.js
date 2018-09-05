import { createLocalVue } from '@vue/test-utils'
import Rivue from 'index'

const { Store, resolveParam, lookupDescriptor } = Rivue

describe('Rivue', () => {
  it('is a valid Vue plugin', () => {
    const Vue = createLocalVue()
    const install = () => Vue.use(Rivue)
    expect(install).not.to.throw()
  })

  describe('protects against common misuse', () => {
    before(() => {
      stub(console, 'warn')
    })

    after(() => {
      console.warn.restore()
    })

    it('warns when not using a store', () => {
      const Vue = createLocalVue()
      Vue.use(Rivue)

      new Vue({ data: { foo: 'bar' } })

      expect(console.warn).to.have.been.calledWithMatch(Error)
    })
  })

  describe('class interface', () => {
    let Vue
    let store
    let root

    beforeEach(() => {
      Vue = createLocalVue()
      Vue.use(Rivue)

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

      store = new Store({
        Things,
      })

      root = new Vue({ store })
    })

    it('store provides reactive state', () => {
      expect(store.things).to.have.observable('list')
      expect(store.things).to.have.observable('number')
      expect(store.things).to.have.observable('string')
      expect(store.things).to.have.observable('object')
      expect(store.things.object).to.have.observable('foo')
    })
  })

  describe('instance state provider', () => {
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

  describe('instance state provider', () => {
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
