import cloneDeep from 'lodash/cloneDeep'

export function lookupDescriptor(root, desc, rootName) {
  const ids = desc.split(/\.|\\|\//)
  const name = ids[ids.length - 1]
  let parent, parentName
  let value = root

  for (let i = 0; i < ids.length; i++) {
    if (typeof value !== 'object' || value[ids[i]] === undefined) {
      break
    }

    parent = value
    parentName = ids[i - 1] || rootName
    value = value[ids[i]]
  }

  return { parent, parentName, name, value }
}

export function resolveParam(store, param, name) {
  if (Array.isArray(param)) {
    return param.map(p => lookupDescriptor(store, p, name))
  }
  if (typeof param === 'object') {
    const flatLookup = (acc, [key, value]) => {
      const resolved = resolveParam(store[key], value, key)
      return acc.concat(resolved)
    }

    return Object.entries(param).reduce(flatLookup, [])
  }
  if (typeof param === 'string') {
    return [lookupDescriptor(store, param, name)]
  }

  return []
}

export function createSnapshot(obj) {
  if (typeof obj !== 'object') return obj

  const descs = Object.getOwnPropertyDescriptors(obj)
  const result = {}

  for (let name in descs) {
    const { value, get, enumerable } = descs[name]

    if (!enumerable) continue
    if (typeof value === 'function') continue

    if (get) {
      const value = get.call(obj)
      if (typeof value === 'function') continue
      result[name] = value
    }
    else result[name] = value

    if (Array.isArray(result[name])) {
      result[name] = result[name].map(createSnapshot)
    }
    else if (typeof result[name] === 'object') {
      result[name] = createSnapshot(result[name])
    }
  }

  return result
}

export function clone(obj) {
  return cloneDeep(obj)
}

export function iterateObject(obj, callback) {
  const props = Object.getOwnPropertyNames(obj)

  props.forEach((prop) => callback(prop, obj[prop]))
}

export function hidden(t, v, d) {
  d.enumerable = false
  return d
}
