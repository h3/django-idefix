var TabItem = Vue.component('tab-item', {
  template: '#tab-item',
  props: ['item'],
  methods: {
    focus: function (item) {
      for (var k in this.$root.$data.state.tabs.items) {
        var itm = this.$root.$data.state.tabs.items[k];
        if (this.$root.$data.state.tabs.items[k].path == item.path) {
          this.$root.$data.state.tabs.items[k].is_open = true;
        }
        else {
          this.$root.$data.state.tabs.items[k].is_open = false;
        }
      }
      send([{
        'action': 'push-state',
        'path': this.$root.$data.state.tabs,
      }])
    }
  }
})

var Tabs = Vue.component('tabs', {
  template: '#tabs',
  computed: {
    items: {
      get: function() {
          return this.$root.$data.state.tabs ? this.$root.$data.state.tabs.items : null
      },
      set: function() {
          this.items = this.$root.$data.state.tabs.items
      }
    }
  },
  components: {
    'tab-item': TabItem
  }
})
