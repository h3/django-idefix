var STORAGE_KEY = 'idefix'

const host    = 'ws://'+ window.location.host +'/ws'
const socket  = new WebSocket(host)

var Topbar = Vue.component('topbar', {
  template: '#topbar',
  data: function () {
    return {
        state: Storage.state
    }
  }
})

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

var Leftpane = Vue.component('left-pane', {
  template: '#leftpane',
  components: {'browser': Browser}
})

var Rightpane = Vue.component('right-pane', {
  template: '#rightpane'
})

var TabItem = Vue.component('tab-item', {
  template: '#tab-item',
  props: ['item'],
  methods: {
    focus: function (item) {
      console.log('AAzzzzzzzzzz', this.$root.$data.state.tabs.items)
      //this.$root.$data.state.tabs
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
  props: ['k', 'v', 'data']
})

var components = {
  topbar: Topbar,
  leftpane: Leftpane,
  rightpane: Rightpane,
  browser: Browser,
  //browserItem: BrowserItem,
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
        //App.$set(App.$data.state, data)
        console.log('AAA', App.$data.state)
      })
      //for (var k in data) {
      //  if (data.hasOwnProperty(k)) {
      //    console.debug('EMIT', k, 'data', data[k]);
      //    this.$emit(k +'-data', data[k]);
      //    console.log('AAA', components[k].$on)
      //    //components[k].$emit('data', data[k]);
      //  }
      //}
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

// event handlers for websocket
if(socket){

  socket.onopen = function(){
    console.debug('Websocket connection established.')
    App.$emit('ready')
  }

  socket.onmessage = function(msg){
    console.debug('RCV < ', msg)
    var packets = JSON.parse(msg.data)
    for (var i=0; i < packets.length; i++) {
      App.$emit('data', packets[i])
    }
  }

  socket.onclose = function(a){
    console.debug('Websocket connection closed.', a)
    App.$emit('closed')
  }

  socket.onerror = function(e){
    console.error(e)
  }

  var send = function(msg){
    console.debug('SND > ', JSON.stringify(msg))
    socket.send(JSON.stringify(msg))
  }

}
else {
  var send = function(msg){
    console.error('Could not send message: ', msg)
  }
  console.error("Socket connection failed.")
}
