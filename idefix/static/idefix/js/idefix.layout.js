var Topbar = Vue.component('topbar', {
  template: '#topbar',
  data: function () {
    return {
        state: Storage.state
    }
  }
})

var Leftpane = Vue.component('left-pane', {
  template: '#leftpane',
  components: {'browser': Browser}
})

var Rightpane = Vue.component('right-pane', {
  template: '#rightpane'
})
