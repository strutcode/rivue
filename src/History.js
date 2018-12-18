import { createSnapshot } from 'util'

export default class History {
  mutations = []
  _current = 0

  constructor(store) {
    const devtool = typeof window !== 'undefined' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__
    const fakeStore = {}

    this._store = store

    if (devtool) {
      fakeStore.state = store.$serialize()
      devtool.emit('vuex:init', fakeStore)
      devtool.on('vuex:travel-to-state', (targetState) => {
        store.$replaceAll(targetState)
      })
    }

    store.$subscribe((change) => {
      this.mutations.push(change)
      this._current++

      if (devtool) {
        fakeStore.state = store.$serialize()
        devtool.emit('vuex:mutation', {
          type: `${change.store}/${change.action}`,
          payload: undefined,
        })
      }
    })
  }

  goto(n) {
    if (!this.mutations[n]) {
      throw new Error(`No such state: #{n}. Valid range is 0-${this.mutations.length - 1}`)
    }

    if (n === this._current) return

    let i = this._current
    const forward = n > i

    while (i !== n) {
      const mutation = this.mutations[i - 1]

      this._store.$replace(mutation.store, forward ? mutation.newState : mutation.oldState)

      if (forward) i++
      else i--
    }

    this.current = n
  }
}
