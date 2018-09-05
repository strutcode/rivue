import { createLocalVue } from '@vue/test-utils'
import VuexAlt, { Store } from 'index'

describe('basics', () => {
  it('is a valid Vue plugin', () => {
    const Vue = createLocalVue()
    const install = () => Vue.use(VuexAlt)
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
      Vue.use(VuexAlt)

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
      Vue.use(VuexAlt)

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

    describe('instance store provider', () => {
      let instance

      beforeEach(() => {
        instance = new Vue({
          parent: root,
          stores: ['things'],
        })
      })

      it('provides a store that is the same as the original', () => {
        expect(instance.things).to.equal(store.things)
      })

      it('provides a store with reactive state', () => {
        expect(instance.things).to.have.observable('list')
        expect(instance.things.object).to.have.observable('foo')
      })

      it('synchronizes changes with the store', () => {
        instance.things.number = 0
        expect(store.things.number).to.equal(0)
      })
    })

    describe('instance state provider', () => {
      let instance

      beforeEach(() => {
        instance = new Vue({
          parent: root,
          state: ['things.list', 'things.number', 'things.object'],
        })
      })

      it('provides values that are the same as the original', () => {
        expect(instance.list).to.equal(store.things.list)
        expect(instance.number).to.equal(store.things.number)
      })

      it('provides reactive properties', () => {
        expect(instance).to.have.observable('list')
        expect(instance).to.have.observable('number')
        expect(instance.object).to.have.observable('foo')
      })

      it('synchronizes changes with the store', () => {
        instance.list.push(5)
        instance.number = 2
        instance.object.foo = 'zed'

        expect(store.things.list).to.eql([5])
        expect(store.things.number).to.equal(2)
        expect(store.things.object.foo).to.equal('zed')
      })
    })

    describe('instance action provider', () => {
      let instance

      beforeEach(() => {
        instance = new Vue({
          parent: root,
          actions: ['things.listAction'],
        })
      })

      it('provides actions that are the same as the original', () => {
        expect(instance.listAction).to.equal(store.things.listAction)
      })

      it('actions run in the correct context', () => {
        const result = instance.listAction()

        expect(result).to.equal(store.things)
        expect(store.things.number).to.equal(5)
        expect(store.things.list).to.eql([{ abc: 123 }])
      })
    })
  })
})
