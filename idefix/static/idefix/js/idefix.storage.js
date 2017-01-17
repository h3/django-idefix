var truth = { browser: { treeData: {} } }
var lstore = localStorage.getItem(STORAGE_KEY)

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Storage.state))
  }
}
Storage.init()
