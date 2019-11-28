export const dom = {
  create(html, children) {
    const template = document.createElement('template')
    template.innerHTML = html.trim()
    const node = template.content.firstChild
    if (children) {
      this.append(node, children)
    }
    return node
  },
  append(parent, children) {
    if (!children.length) {
      children = [children]
    }
    for (let i = 0; i < children.length; i++) {
      parent.appendChild(children[i])
    }
    return parent
  }
}

export function toggleClass(el, className) {
  if (el.classList.contains(className)) {
    el.classList.remove(className)
  } else {
    el.classList.add(className)
  }
}

export function zerolize(num) {
  return num <= 9 ? `0${num}` : (num + '')
}

export function isObject(data) {
  if (typeof data === 'object' && data !== null) {
    return true
  }
  return false
}