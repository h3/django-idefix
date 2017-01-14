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

//;

  // event handlers for websocket
if(socket){

  socket.onopen = function(){
    console.debug('Websocket connection established.')
    idefix.is_ready = true;
    bus.$emit('ready');
  };

  socket.onmessage = function(msg){
    console.debug('RCV < ', msg);
    var packets = JSON.parse(msg.data);
    for (var i=0; i < packets.length; i++) {
      var packet = packets[i]
      if (packet.data) {
          bus.$emit('data', packet.data);
      }
      if (packet.message) {
          bus.$emit('message', packet.messages);
      }
    }
  };

  socket.onclose = function(a){
    console.debug('Websocket connection closed.', a)
    bus.$emit('closed');
  };

  socket.onerror = function(e){
    console.error('AA', e)
  };

  var send = function(msg){
    console.debug('SND > ', JSON.stringify(msg));
    socket.send(JSON.stringify(msg));
  };

}
else {
  var send = function(msg){
    console.error('Could not send message: ', msg);
  };
  console.error("Socket connection failed.");
}

bus.$on('data', function(newData){
  browser.treeData = Object.assign({}, browser.treeData, newData.browser);
});

bus.$on('message', function(data){
  alert(data.message);
});

// define the item component
Vue.component('item', {
  template: '#browser-node',
  props: {
    model: Object
  },
  data: function () {
    return {
        model: { open: true }
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
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
});
