import MLoad from './msguploader.js'
import Modal from './loading.js'
import emitter from '../../utils/events'

class MSocket {
  constructor (socket, message) {
    this.socket = socket
    this.message = message
    this.data = null
    this.mload = new MLoad()
    this.mdl = new Modal()
  }
  getData (data) {
    this.data = data
  }
  handleEmit () {
    this.socket.emit(this.message, this.data)
    console.info(`Message '${this.data}' sent!`)
  }
  handleUpload () {
    this.mload.bind('upload', (data) => {
      this.getData(data)
      if (this.data !== null) {
        this.handleEmit()
        this.mdl.show(true, 'Running NLP ...')
      }
    })
  }
  handleReceive () {
    this.socket.on(this.message, (data) => {
      console.info('msgsocket handleReceive', data)
      this.mdl.show(false)
      emitter.emit('doneNLP', data);
    })
  }
  onConnect () {
    this.handleUpload()
    this.handleReceive()
  }
}

export default MSocket
