var Editor = Vue.component('editor', {
  template: '#editor',
  props: ['state']
})

var Buffer = Vue.component('buffer', {
  template: '#buffer',
  props: ['item']
})

var BufferManager = Vue.component('buffer-manager', {
  template: '#buffer-manager',
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
    'buffer': Buffer
  }
})

var Fixture = Vue.component('fixture', {
  template: '#fixture',
  props: ['data', 'editing']
})

var ButtonAddFixture = Vue.component('add-fixture', {
  template: '<span class="f-add fixture"><i class="fa fa-plus-square" aria-hidden="true"></i></span>',
})

var ButtonAddField = Vue.component('add-field', {
  template: '<span class="f-add field"><i class="fa fa-plus-square" aria-hidden="true"></i></span>',
})
