import FRead from './filereader.js'
import FLoad from './fileuploader.js'
import IView from './imgviewer.js'
import Modal from './loading.js'
import emitter from '../../utils/events'

class FSocket {
  constructor (socket, message) {
    this.socket = socket
    this.message = message
    this.data = null
    this.result = null
    this.fread = new FRead()
    this.fload = new FLoad()
    this.iview = new IView(message)
    this.mdl = new Modal()
    this.fload.init()
  }
  getData (data) {
    this.data = data
  }
  handleEmit () {
    this.socket.emit(this.message, this.data)
    console.info(`File '${this.data.name}' uploaded!`)
  }
  handleUpload () {
    // Read the file when uploaded
    this.fload.bind('fileloaded', (event, file) => {
      this.fread.getFile(file)
      this.fread.read((data) => {
        this.getData(data)
      })
    })
    // Remove the file when cleared
    this.fload.bind('fileclear', () => {
      console.info(`File '${this.data.name}' removed!`)
      this.fread.getFile(null)
    })
    // Upload the file
    this.fload.bind('upload', () => {
      if (this.data !== null) {
        // Show the original image
        this.fload.show(false)
        this.iview.getOriginal(this.data)
        this.iview.show()
        // Upload the original image
        this.handleEmit()
        this.mdl.show(true, 'Running object detection ...')
      }
    })
  }
  handleReceive () {
    let that = this
    this.socket.on(this.message, (data) => {
      that.result = data
      this.iview.getResult(data)
      emitter.emit('doneOD', data['tonlp'])
      this.mdl.show(false)
    })
  }
  onConnect () {
    this.handleUpload()
    this.handleReceive()
  }
  handleShow (objectKey=null) {
    // Show the processed image
    this.iview.showObj(objectKey)
    this.iview.show()
  }
  handleShowAuto (message=null) {
    // Show the processed image
    this.iview.showObjAuto(message)
    this.iview.show()
  }
  handleShowSentences (message=null) {
    // let sentences = {
    //     'st_1': 'The green car belongs to Mr. Lee.',
    //     'st_2': 'There are many red cars.'
    //   }
    // let entities = {
    //   'et_1': {
    //     'name': 'car',
    //     'sentence': 'st_1',
    //     'shape': {
    //       'car': true
    //     },
    //     'color': {
    //       'green': true
    //     },
    //     'boundary': {
    //       'stroke': false
    //     }
    //   },
    //   'et_2': {
    //     'name': 'car',
    //     'sentence': 'st_2',
    //     'shape': {
    //       'car': true
    //     },
    //     'color': {
    //       'red': true
    //     },
    //     'boundary': {
    //       'stroke': false
    //     }
    //   }
    // }
    // let entities = message.entities
    // let sentences = message.sentences
    // this.iview.showSentences(sentences, entities)
    window.iview = this.iview
    console.warn('======== iview', window.iview)
    this.iview.showSentences(message)
    
    this.iview.show()

  }
}

export default FSocket
