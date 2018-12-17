import History from 'History'

describe('History', () => {
  let store, history, commitChange

  beforeEach(() => {
    let update

    store = {
      $subscribe: callback => (update = callback),
      $serialize() { return { test: this.test } },
      $replace: stub(),
      test: { foo: 1 },
    }
    history = new History(store)

    commitChange = () => {
      expect(update).to.be.a('function')
      update({
        store: 'test',
        action: 'doIt',
        oldState: { foo: 1 },
        newState: { foo: 2 },
      })
    }
  })

  it('Saves snapshots of stores', () => {
    expect(history.mutations).to.have.length(0)
    commitChange()
    expect(history.mutations).to.have.length(1)
  })

  it('Provides a diff of the states', () => {
    commitChange()
    expect(history.mutations[0]).to.eql({
      store: 'test',
      action: 'doIt',
      oldState: { foo: 1 },
      newState: { foo: 2 },
    })
  })

  it('Can time travel to another state', () => {
    commitChange()
    history.goto(0)
    expect(store.$replace).to.have.been.calledWith('test', match({ foo: 1 }))
  })
})
