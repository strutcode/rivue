import Chai from 'chai'
import Sinon from 'sinon'
import SinonChai from 'sinon-chai'
import 'chai/register-expect'

Chai.use(SinonChai)

Chai.Assertion.addMethod('observable', function(name) {
  const observable = new Chai.Assertion(this._obj)
  const isObservable = (obj, id) => {
    if (typeof obj[id] === 'object') return obj[id].__ob__

    const desc = Object.getOwnPropertyDescriptor(obj, id)

    if (!desc) return false

    return (
      ( // Data
        (desc.get && desc.get.name.match(/(reactive|proxy)Getter/)) &&
        (desc.set && desc.set.name.match(/(reactive|proxy)Setter/))
      ) ||
      ( // Computed
        (desc.get && desc.get.name === 'computedGetter') &&
        (desc.set && desc.set.name.match(/(set)?/))
      )
    )
  }

  new Chai.Assertion(this._obj).to.be.an('object')

  observable.assert(
    isObservable(this._obj, name),
    `expected object to have observable '${name}'`,
    `expected object not to have observable '${name}'`,
  )
})

Object.assign(global, {
  mock: Sinon.mock,
  stub: Sinon.stub,
  spy: Sinon.spy,
  match: Sinon.match,
  Vue: { use: Sinon.stub() },
  nextTick:  () => new Promise((resolve) => {
    setTimeout(resolve)
  }),
  DEVELOPMENT: true,
})
