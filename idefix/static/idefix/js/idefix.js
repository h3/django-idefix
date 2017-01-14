var bus = new Vue()
var host = 'ws://'+ window.location.host +'/ws';
var socket = new WebSocket(host);

var idefix = {
  is_ready: false
};

var browser = new Vue({
  el: '#idefix-browser',
  data: {
    treeData: {}
  }
});

//socket.send(text);

  // event handlers for websocket
if(socket){

  socket.onopen = function(){
    console.debug('Websocket connection established.')
    idefix.is_ready = true;
    bus.$emit('ready');
  }

  socket.onmessage = function(msg){
    console.debug('RCV > ', msg)
    var packet = JSON.parse(msg.data);
    if (packet.data) {
        bus.$emit('data', packet.data);
    }
    if (packet.message) {
        bus.$emit('message', packet.messages);
    }
  }

  socket.onclose = function(){
    console.debug('Websocket connection closed.')
    bus.$emit('closed');
  }

}
else {
  console.error("Socket connection failed.");
}

bus.$on('data', function(newData){
    console.log('dataaa', newData.browser);
    //browser.treeData === Object.assign({}, browser.treeData, newData.browser);
    browser.treeData = Object.assign({}, browser.treeData, newData.browser);
});

// define the item component
Vue.component('item', {
  template: '#browser-node',
  props: {
    model: Object
  },
  data: function () {
    return {
        model: { open: false }
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    }
  },
  methods: {
    toggle: function () {
      console.log('AAAAA');
      if (this.isFolder) {
        console.log('BBBBB', !this.model.open);
        this.model.open = !this.model.open;
      }
    },
    addChild: function () {
      this.model.children.push({
        name: 'new stuff'
      })
    }
  }
});
