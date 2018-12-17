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

  it('Provides a way to watch changes in the store', () => {
    const update = stub()
    store.$subscribe(update)

    store.things.listAction()
    expect(update).to.have.been.calledWith(match({
      store: 'things',
      action: 'listAction',
      oldState: {
        list: [],
        number: 42,
        string: 'test',
        object: { foo: 'bar' },
      },
      newState: {
        list: [{ abc: 123 }],
        number: 5,
        string: 'test',
        object: { foo: 'bar' },
      },
    }))
  })

  it('Provides a serialized version of the store for external use', () => {
    const store = new Store({
      foo: {
        bar: 'value',
      },
    })
    
    expect(store.$serialize()).to.eql({
      foo: {
        bar: 'value',
      },
    })
  })

  it('Provides a way to update selected stores', () => {
    const newArray = [1, 2, 3]
    const newObj = { foo: 'baz' }
    store.$replace('things', {
      list: newArray,
      object: newObj,
    })

    // Original state
    expect(store.things.number).to.equal(42)
    expect(store.things.string).to.equal('test')

    // Copies arrays
    expect(store.things.list).to.eql(newArray)
    expect(store.things.list).not.to.equal(newArray)

    // Deep copies objects
    expect(store.things.object).to.eql(newObj)
    expect(store.things.object).not.to.equal(newObj)
  })

  it('Provides a way to update the entire store', () => {
    store.$replace = stub()
    store.$replaceAll({
      things: {
        number: 99,
      },
      oldthings: {
        string: 'foo',
      },
    })

    expect(store.$replace).to.have.been.calledWith('things', match({ number: 99 }))
    expect(store.$replace).to.have.been.calledWith('oldthings', match({ string: 'foo' }))
  })
})
