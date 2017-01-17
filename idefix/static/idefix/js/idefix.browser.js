var BrowserItem = Vue.component('browser-item', {
  template: '#browser-item',
  props: ['leaf'],
  data: function () {
    return { open: true }
  },
  computed: {
    isFolder: function () {
      return this.leaf.children &&
        this.leaf.children.length
    }
  },
  methods: {
    browse: function () {
      if (this.isFolder) {
        this.leaf.open = !this.leaf.open;
      }
      else {
        send([{
            'action': 'open',
            'path': this.leaf.path,
        }])
      }
    },
    addChild: function () {
      this.leaf.children.push({
        name: 'new stuff'
      })
    }
  }
})

var Browser = Vue.component('browser', {
  template: '#browser',
  components: {
    'browser-item': BrowserItem
  }
})
