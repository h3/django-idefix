var components = {
  topbar: Topbar,
  leftpane: Leftpane,
  rightpane: Rightpane,
  browser: Browser,
  editor: Fixture,
  buffer: Fixture,
  bufferManager: Fixture,
  fixture: Fixture,
  tabs: Tabs,
}


var App = new Vue({
  data: {
    state: Storage.state
  },
  on: {
    'data': this.dispatch
  },
  methods: {
    on_new_state: function(data) {
      Storage.update(data)
      Vue.nextTick(function () {
        App.$data.state = Object.assign({}, App.$data.state, data)
      })
    },
    dispatch: function (e) {
      if (e.event) {
        try {
          this['on_'+ e.event.replace('-', '_')](e.data)
        }
        catch(e) {
          console.error(e)
        }
      }
    }
  }
})

App.$mount('#idefix')

//// Editor components

App.$on('data', function(e){
  this.dispatch(e)
})
