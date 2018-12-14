import { createLocalVue } from '@vue/test-utils'
import Rivue, { Store } from 'index'

describe('Store', () => {
  // Class
  class Things {
    list = []
    number = 42
    string = 'test'
    object = { foo: 'bar' }

    get numberPlusFive() {
      return this.number + 5
    }

    listAction() {
      this.list.push({ abc: 123 })
      this.number = 5
      return this
    }
  }

  // ES5 Class
  function OldThings() {
    this.list = []
    this.number = 42
    this.string = 'test'
    this.object = {}
    this.object.foo = 'bar'

    Object.defineProperty(this, 'numberPlusFive', {
      enumerable: true,
      configurable: true,
      get: function () {
        return this.number + 5
      },
    })

    var self = this
    this.listAction = function () {
      self.list.push({ abc: 123 })
      self.number = 5
      return self
    }
  }

  let store, objectThings

  const createComponent = (options) => {
    const Vue = createLocalVue()
    Vue.use(Rivue)
    const root = new Vue({ store })
    return new Vue({
      parent: root,
      ...options
    })
  }

  beforeEach(() => {
    objectThings = {
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

    store = new Store({
      Things,
      OldThings,
      objectThings,
    })
  })

  it('Accepts different kinds of definitions', () => {
    const createEmpty = () => new Store()
    expect(createEmpty).not.to.throw()

    const createInvalid = () => new Store({ foo: 'bar' })
    expect(createInvalid).to.throw()

    // Check against extraneous properties
    expect(Object.keys(store.things)).to.eql(['list', 'number', 'string', 'object', 'constructor', 'numberPlusFive', 'listAction'])
    expect(Object.keys(store.oldthings)).to.eql(['list', 'number', 'string', 'object', 'numberPlusFive', 'listAction', 'constructor'])
    expect(Object.keys(store.objectthings)).to.eql(['list', 'number', 'string', 'object', 'numberPlusFive', 'listAction'])
    
    const variants = [store.things, store.oldthings, store.objectthings]
    variants.forEach((s) => {
      expect(s).to.have.observable('list')
      expect(s).to.have.observable('number')
      expect(s).to.have.observable('string')
      expect(s).to.have.observable('object')
      expect(s.object).to.have.observable('foo')
      expect(s).to.have.observable('numberPlusFive')
    })

    expect(objectThings).not.to.have.observable('list')
    expect(objectThings.object).not.to.have.observable('foo')
  })

  it('Provides reactive state & actions', async () => {
    const Vue = createLocalVue()
    Vue.use(Rivue)

    const changeSpy = stub()
    new Vue({
      store,
      state: 'things.list',
      watch: {
        list: changeSpy,
      },
    })

    store.things.listAction()
    await nextTick()
    expect(changeSpy).to.have.been.called
  })
})
