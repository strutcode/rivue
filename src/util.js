export function lookupDescriptor(root, desc) {
  const ids = desc.split(/\.|\/|\\/)
  const name = ids[ids.length - 1]
  let parent
  let value = root

  for (let i = 0; i < ids.length; i++) {
    if (typeof value !== 'object' || value[ids[i]] === undefined) {
      break
    }

    parent = value
    value = value[ids[i]]
  }

  return { parent, name, value }
}

export function resolveParam(store, param) {
  if (Array.isArray(param)) {
    return param.map(lookupDescriptor.bind(null, store))
  }
  if (typeof param === 'object') {
    const flatLookup = (acc, [key, value]) => {
      const resolved = resolveParam(store[key], value)
      return acc.concat(resolved)
    }

    return Object.entries(param).reduce(flatLookup, [])
  }
  if (typeof param === 'string') {
    return [lookupDescriptor(store, param)]
  }

  return []
}

export function createSnapshot(obj) {
  if (typeof obj !== 'object') return obj

  const descs = Object.getOwnPropertyDescriptors(obj)
  const result = {}

  for (let name in descs) {
    const { value, get, enumerable, configurable } = descs[name]

    if (!enumerable || !configurable) continue
    if (typeof value === 'function' || get && typeof get() === 'function') continue

    if (get) result[name] = get()
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
