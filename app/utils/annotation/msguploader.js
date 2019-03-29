import $ from 'jquery'
import emitter from '../../utils/events'

class MsgUploader {
  constructor () {
    this.input = '#nlptest-input'
    this.submit = '#nlptest-submit'
  }
  bind (event, callback) {
    if (event === 'upload') {
      console.log('nlp msg:', $(this.input).val())

      $(this.submit).on('click', () => {
        let msg = $(this.input).val()
        console.log('nlp msg:', msg)
        // if (msg === '') { msg = null }
        if (msg === '') { msg = ' ' }
        callback(msg)
      })

      this.eventEmitter = emitter.addListener('submitDescription', (message) => {
        console.log('HomePage eventEmitter', message)
        let msg = $(this.input).val()
        console.log('nlp msg:', msg)
        // if (msg === '') { msg = null }
        if (msg === '') { msg = ' ' }
        callback(msg)
    })

    } else {
      $(this.input).on(event, callback)
    }
  }
}

export default MsgUploader
