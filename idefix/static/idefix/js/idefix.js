var host = 'ws://'+ window.location.host +'/ws';
var socket = new WebSocket(host);
var modules = ['editor', 'browser'];
var bus = new Vue();

var idefix = {
  is_ready: false,
  browser: new Vue({
    el: '#idefix-browser',
    data: {
      state: {
        treeData: {}
      }
    }
  }),
  editor: new Vue({
    el: '#idefix-editor',
    data: {
      state: {
        openFiles: []
      }
    }
  })
};


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
      console.log(packet);
      bus.$emit('data', packet);
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
  for (var i=0; i<modules.length;i++) {
    var module = modules[i];
    if (newData[module]) {
      for (var k in newData[module]) {
        console.log('AAA', module, k, newData[module][k])
        if (newData[module].hasOwnProperty(k)) {
           idefix[module].$data.state = Object.assign({}, idefix[module].$data.state, newData[module][k]);
           console.log('K', k, newData[module][k])
        }
      }
    }
  }
});


Vue.component('item', {
  template: '#browser-node',
  props: {
    model: Object
  },
  data: function () {
    return { open: true }
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


Vue.component('fixture', {
  template: '#editor-fixture',
  props: {
    model: Object
  },
  data: function () {
    return { open: true }
  },
  computed: {
  },
  methods: {
  }
});
