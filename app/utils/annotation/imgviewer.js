import $ from 'jquery'

class ImgViewer {
  constructor () {
    this.id = '#odresult'
    $(`${this.id} svg`).hide()
  }
  getImg (img) {
    $(`${this.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
  }
  show (visible = true) {
    if (visible === true) {
      $(this.id).show()
    } else {
      $(this.id).hide()
    }
  }
}

export default ImgViewer
