import { lookupDescriptor, resolveParam } from 'util'

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
})
