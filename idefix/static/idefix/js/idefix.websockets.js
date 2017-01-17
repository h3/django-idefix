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
