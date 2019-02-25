import $ from 'jquery'

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
        if (msg === '') { msg = null }
        callback(msg)
      })
    } else {
      $(this.input).on(event, callback)
    }
  }
}

export default MsgUploader
