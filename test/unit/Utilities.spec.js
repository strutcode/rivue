import { lookupDescriptor, resolveParam, clone, createSnapshot, hidden } from 'util'

describe('Utilities', () => {
  describe('Store descriptor lookup', () => {
    it('Can handle a single level', () => {
      const obj = { abc: 'def' }

      expect(lookupDescriptor(obj, 'abc')).to.eql({
        parent: obj,
        parentName: '<root>',
        name: 'abc',
        value: 'def',
      })
    })

    it('Can handle multiple levels', () => {
      const obj = {
        abc: {
          def: 123,
        },
      }

      expect(lookupDescriptor(obj, 'abc.def')).to.eql({
        parent: obj.abc,
        parentName: 'abc',
        name: 'def',
        value: 123,
      })
    })

    it('Can handle unusual names', () => {
      const obj = {
        he110: {
          camelWorld: 123,
          $hidden: 'property',
          'a space!?': 'why',
        },
      }

      expect(lookupDescriptor(obj, 'he110.camelWorld')).to.eql({
        parent: obj.he110,
        parentName: 'he110',
        name: 'camelWorld',
        value: 123,
      })

      expect(lookupDescriptor(obj, 'he110.$hidden')).to.eql({
        parent: obj.he110,
        parentName: 'he110',
        name: '$hidden',
        value: 'property',
      })

      expect(lookupDescriptor(obj, 'he110.a space!?')).to.eql({
        parent: obj.he110,
        parentName: 'he110',
        name: 'a space!?',
        value: 'why',
      })
    })
  })

  describe('Parameter resolution', () => {
    const obj = {
      value: 'abc',
      firstLevel: {
        value: 'def',
        secondLevel: {
          value: 'xyz',
        }
      }
    }

    it('Can map a string', () => {
      expect(resolveParam(obj, 'value')).to.eql([{
        parent: obj,
        parentName: '<root>',
        name: 'value',
        value: 'abc',
      }])
    })

    it('Can map an array', () => {
      expect(resolveParam(obj, ['value', 'firstLevel.value', 'firstLevel.secondLevel.value']))
        .to.eql([
          {
            parent: obj,
            parentName: '<root>',
            name: 'value',
            value: 'abc',
          },
          {
            parent: obj.firstLevel,
            parentName: 'firstLevel',
            name: 'value',
            value: 'def',
          },
          {
            parent: obj.firstLevel.secondLevel,
            parentName: 'secondLevel',
            name: 'value',
            value: 'xyz',
          },
        ])
    })

    it('Can map an object', () => {
      expect(resolveParam(obj, { firstLevel: ['value', 'secondLevel.value'] }))
        .to.eql([
          {
            parent: obj.firstLevel,
            parentName: 'firstLevel',
            name: 'value',
            value: 'def',
          },
          {
            parent: obj.firstLevel.secondLevel,
            parentName: 'secondLevel',
            name: 'value',
            value: 'xyz',
          },
        ])
    })
  })

  describe('createSnapshot', () => {
    it('Only copies values', () => {
      class TestObject {
        value = 123
        @hidden foo = 42
        bar() {}
      }

      const result = createSnapshot(new TestObject())

      expect(result).to.eql({ value: 123 })
    })

    it('Can map getters', () => {
      const result = createSnapshot({
        value: 123,
        get computedValue() {
          return this.value + 42
        }
      })

      expect(result).to.eql({
        value: 123,
        computedValue: 123 + 42,
      })
    })

    it('Can deeply map objects and arrays', () => {
      const obj = {
        foo: {
          bar: {
            baz: 123,
          },
          bax: [{ abc: 'xyz' }],
        },
      }
      const result = createSnapshot(obj)

      expect(result).to.eql({
        foo: {
          bar: {
            baz: 123,
          },
          bax: [{ abc: 'xyz' }],
        },
      })
      expect(result).not.to.equal(obj)
      expect(result.foo).not.to.equal(obj.foo)
      expect(result.foo.bar).not.to.equal(obj.foo.bar)
      expect(result.foo.bax).not.to.equal(obj.foo.bax)
      expect(result.foo.bax[0]).not.to.equal(obj.foo.bax[0])
    })
  })

  describe('clone', () => {
    it('Creates a unique copy from multi-level objects', () => {
      const a = {
        xyz: [{ abc: 123 }],
        value: {
          foo: 'bar',
        },
      }
      const b = clone(a)

      expect(b).to.not.equal(a)
      expect(b.xyz).to.not.equal(a.xyz)
      expect(b.xyz[0]).to.not.equal(a.xyz[0])
      expect(b.xyz[0].abc).to.equal(a.xyz[0].abc)

      expect(b.value).to.not.equal(a.value)
      expect(b.value.foo).to.equal(a.value.foo)
    })
  })
  
  // describe('diff', () => {
  //   const a = {
  //     string: 'foo',
  //     array: [],
  //     object: {
  //       string: 'foo',
  //       array: [42],
  //     },
  //   }

  //   const a = {
  //     string: 'bar',
  //     array: [1, 2, 3],
  //     object: {
  //       string: '123',
  //       array: [],
  //     },
  //   }

  //   const result = diff(a, b)

  //   expect(result).to.eql({})
  // })
})
