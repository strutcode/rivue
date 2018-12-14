import { createLocalVue } from '@vue/test-utils'
import Rivue from 'index'

describe('Plugin', () => {
  it('Is a valid Vue plugin', () => {
    const Vue = createLocalVue()
    const install = () => Vue.use(Rivue)

    expect(install).not.to.throw()
  })

  it('Auto installs as UMD', () => {
    // See setup.js
    expect(global.Vue.use).to.have.been.calledWith(Rivue)
  })

  it('Accepts a store arguement for root instances', () => {
    const Vue = createLocalVue()
    Vue.use(Rivue)

    const store = new Rivue.Store({})
    const store2 = new Rivue.Store({})

    const createRoot = () => new Vue({ store })
    const createComp = () => new Vue({ parent: createRoot(), store2 })
    const createFailure = () => new Vue({ store: {} })

    expect(createRoot).not.to.throw()
    expect(createRoot().$store).to.equal(store)
    
    expect(createComp).not.to.throw()
    expect(createComp().$store).to.equal(store)

    stub(console, 'error').callsFake(() => {})
    expect(createFailure).to.throw()
    console.error.restore()
  })
  
  it('Provides state mappers to components', () => {
    const Vue = createLocalVue()
    Vue.use(Rivue)

    const store = new Rivue.Store({
      test: {
        value: 'abc',
        action() {},
      }
    })

    
    const root = new Vue({ store })
    const instance = new Vue({
      parent: root,
      state: ['test.value'],
      actions: ['test.action'],
    })

    expect(instance.value).to.equal('abc')
    expect(instance.action).to.be.a('function')
  })

  describe('Options', () => {
    it('Can adjust component mappers to avoid conflicts')
  })
})
