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
  props: ['node'],
  data: function () {
    return { open: true }
  },
  computed: {
    isFolder: function () {
      return true
      //return this.node.children &&
      //  this.node.children.length
    }
  },
  methods: {
    browse: function () {
      if (this.isFolder) {
        this.model.open = !this.model.open;
      }
      else {
        send([{
            'action': 'open',
            'path': this.model.path,
        }])
      }
    },
    addChild: function () {
      this.model.children.push({
        name: 'new stuff'
      })
    }
  }
})

var Browser = Vue.component('browser', {
  template: '#browser',
  data: function () {
    return { open: true }
  },
  props: {
    node: Object
  },
  computed: {
    isFolder: function () {
        return true;
      return this.$root.state.browser.treeData.children &&
        this.$root.state.browser.treeData.children.length
    }
  },
  methods: {
    browse: function () {
      if (this.isFolder) {
        this.model.open = !this.model.open;
      }
      else {
        send([{
            'action': 'open',
            'path': this.model.path,
        }])
      }
    },
    addChild: function () {
      this.model.children.push({
        name: 'new stuff'
      })
    }
  },
  //data: function () {
  //  return {state: Storage.state}
  //},
  components: {
    'browser-item': BrowserItem
  }
})

var Leftpane = Vue.component('left-pane', {
  template: '#leftpane',
  components: {'browser': Browser}
})

var Rightpane = Vue.component('right-pane', {
  template: '#rightpane',
  template: '<div id="idefix-rightpane"></div>'
})

var Editor = Vue.component('editor', {
  template: '#editor'
})

var Buffer = Vue.component('buffer', {
  template: '#buffer'
})

var BufferManager = Vue.component('buffer-manager', {
  template: '#buffer-manager',
  components: {
    'buffer': Buffer
  }
})

var Fixture = Vue.component('fixture', {
  template: '#fixture'
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
        App.$set(App.$data.state, data)
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
