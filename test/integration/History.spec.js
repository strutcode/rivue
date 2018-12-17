import { createLocalVue } from '@vue/test-utils'
import Rivue, { Store } from 'index'

describe('History', () => {
  let hook, store, history

  beforeEach(() => {
    const Vue = createLocalVue()
    Vue.use(Rivue)

    global.window = {
      __VUE_DEVTOOLS_GLOBAL_HOOK__: {
        emit: stub(),
        on: stub(),
      }
    }
    hook = global.window.__VUE_DEVTOOLS_GLOBAL_HOOK__

    store = new Store({
      things: {
        list: [],
        add() {
          this.list.push(42)
        },
        async load(promise) {
          await promise
          this.list = [1, 2, 3]
        }
      },
    })

    history = store.$history
  })

  it('Can track state changes via actions', () => {
    expect(history.mutations).to.have.length(0)
    store.things.add()
    expect(history.mutations).to.have.length(1)

    expect(history.mutations[0]).to.eql({
      store: 'things',
      action: 'add',
      oldState: {
        list: [],
      },
      newState: {
        list: [42],
      },
    })
  })

  it('Allows state time travel', () => {
    store.things.add()
    expect(store.things.list).to.eql([42])
    history.goto(0)
    expect(store.things.list).to.eql([])
  })

  it('Is compatible with Vuex dev tools', () => {
    expect(hook.on).to.have.been.calledWith('vuex:travel-to-state', match.func)
    expect(hook.emit).to.have.been.calledWith('vuex:init', match.object)
    store.things.add()
    expect(hook.emit).to.have.been.calledWith('vuex:mutation', 'add', match.object)
  })
})
