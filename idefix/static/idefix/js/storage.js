var truth = {
  browser: { treeData: {}}
}
var lstore_key = 'idefix'
var lstore = localStorage.getItem(lstore_key)

var Storage = {
  debug: true,
  state: truth,
  init: function() {
    if (lstore) {
        this.state = Object.assign({}, this.state, JSON.parse(lstore))
    }
  },
  update: function(newData) {
    console.debug('Updating state', newData)
    this.state = Object.assign({}, this.state, newData)
  },
  save: function() {
    localStorage.setItem(lstore_key, JSON.stringify(Storage.state))
  }
}

Storage.init()
