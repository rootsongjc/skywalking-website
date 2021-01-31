// import '../../style/tree.scss'

class Tree {
  constructor (options) {
    const defaultOptions = {
      element: null,
      data: [],
      id: null,
      multiple: false,
      toggle: () => {},
      select: () => {}
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.$container = this.options.element
    this.$container.classList.add('tiny-tree')
    this.tree = this.options.data
    this.initTree()
  }

  initTree () {
    this.nodeIndex = 0
    for (let index = 0; index < this.tree.length; index++) {
      this.initTreeNode(this.tree[index])
    }
  }

  initTreeNode (node) {
    node.key = this.nodeIndex
    this.nodeIndex++
    const { $title, $node, $arrow, $nodeContent} = this.getTreeNode(node)
    this.bindTitle($title, node)
    if (!node.children) {
      this.$container.appendChild($node)
      return $node
    }
    const $children = this.getNodeChildren(node)
    $node.appendChild($children)
    this.$container.appendChild($node)
    this.setTree($children, node ,$arrow, $node)
    this.bindArrow($nodeContent,$arrow, $children, node)
    return $node
  }

  getTreeNode (node) {
    const $node = document.createElement('div')
    $node.setAttribute('class', 'tree-node')
    const $nodeContent = document.createElement('div')
    $nodeContent.setAttribute('class', 'node-content')
    const $arrow = this.getNodeArrow(node)
    const $title = this.getNodeTitle(node)
    $nodeContent.appendChild($title)
    $nodeContent.appendChild($arrow)
    $node.appendChild($nodeContent)
    return { $title, $node, $arrow , $nodeContent}
  }

  getNodeChildren (node) {
    const $children = document.createElement('div')
    $children.setAttribute('class', 'node-children')
    for (let i = 0; i < node.children.length; i++) {
      const $node = this.initTreeNode(node.children[i])
      $children.appendChild($node)
    }
    return $children
  }

  getNodeArrow (node) {
    const $arrow = document.createElement('i')
    if (node.children) {
      const arrowClass = node.expand ? 'open' : ''
      $arrow.setAttribute(
        'class',
        `node-arrow iconfont iconios-arrow-forward ${arrowClass}`
      )
    } else {
      $arrow.setAttribute('class', 'node-arrow hide')
    }
    return $arrow
  }

  getNodeTitle (node) {
    const $title = document.createElement('a')
    const titleClass = (node.selected || node.id == this.options.id) ? 'selected' : ''
    const nodeHref = node.children ? 'javascript:void(0)' : `/help/documents.html?id=${node.id}`
    $title.setAttribute('class', `node-title ${titleClass} title-level-${node.level}`)
    $title.setAttribute('href', nodeHref)
    $title.innerText = node.title
    return $title
  }

  setTree ($children, node, $arrow) {
    //根据id判断展开不展开
    let diffLength = node.id.indexOf('0')
    let isSelectParent = node.id.slice(0,diffLength) == this.options.id.slice(0,diffLength);
    if (isSelectParent) {
      node.expand = true
      $arrow.classList.toggle('open')
    }
    if (!node.expand) {
      $children.style.display = 'none'
    }
  }

  bindArrow ($nodeContent,$arrow, $children, node) {
    this.isAnimate = false
    $nodeContent.addEventListener('click', () => {
      if (!this.isAnimate) {
        this.isAnimate = true
        $arrow.classList.toggle('open')
        this.setChildren($children, node)
        node.expand = !node.expand
        this.options.toggle.call(null, node)
      }
    })
    this.bindChildren($children, node)
  }

  bindTitle ($title, selectedNode) {
    $title.addEventListener('click', () => {
      this.travelTree((node, $node) => {
        if (node.key === selectedNode.key) {
          node.selected = !node.selected
          $node.children[0].children[1].classList.toggle('selected')
        } else {
          if (!this.options.multiple) {
            node.selected = false
            $node.children[0].children[1].classList.remove('selected')
          }
        }
      })
      this.options.select.call(null, this.getSelectedNodes(), selectedNode)
    })
  }

  getSelectedNodes () {
    const selectNodes = []
    this.travelTree((node) => {
      if (node.selected) {
        selectNodes.push(node)
      }
    })
    return selectNodes
  }

  setChildren ($children, node) {
    if (node.expand) {
      $children.style.height = `${$children.offsetHeight}px`
      setTimeout(() => {
        $children.style.height = '0'
      })
    } else {
      $children.style.display = ''
      const height = $children.offsetHeight
      $children.style.height = '0'
      setTimeout(() => {
        $children.style.height = `${height}px`
      })
    }
  }

  bindChildren ($children, node) {
    const afterTransition = () => {
      if (!node.expand) {
        $children.style.display = 'none'
      }
      $children.style.height = ''
      // $children.removeEventListener('transitionend', afterTransition)
      this.isAnimate = false
    }
    $children.addEventListener('transitionend', afterTransition)
  }

  travelTree (fn) {
    for (let index = 0; index < this.tree.length; index++) {
      this.travelTreeNode(this.tree[index], this.$container.children[index], fn)
    }
  }

  travelTreeNode (node, $node, fn) {
    fn(node, $node)
    if (!node.children) {
      return
    }
    for (let i = 0; i < node.children.length; i++) {
      this.travelTreeNode(node.children[i], $node.children[1].children[i], fn)
    }
  }
}

export default Tree
