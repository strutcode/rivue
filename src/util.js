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
