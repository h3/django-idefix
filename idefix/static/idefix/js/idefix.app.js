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
