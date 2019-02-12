/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
*/
import $ from 'jquery'
import * as d3 from 'd3'

class ImgViewer {
  constructor (message) {
    this.imgOriginal = null
    this.id = '#odresult'
    this.message = message
  }
  getOriginal (img) {
    switch (this.message) {
      case 'OD_Image':
        $(`${this.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
        console.info('Before:', img)
        this.imgOriginal = img
        break
    }
  }
  getResult (img) {
    switch (this.message) {
      case 'OD_Image':
        $(`${this.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
        console.info('After:', img)
        let target = img[0][Object.keys(img[0])[0]]['mask'][0]
        let path = 'M'
        path += target.map(d => '' + d.join(' ')).join('L')
        console.log('path', path)
        var i = new Image()

        i.onload = function () {
          console.warn(i.width + ', ' + i.height)
          d3.select(`${this.id} .img`).attr('viewBox', '0,0,' + i.width + ',' + i.height)
        }
        let src = `data:${this.imgOriginal.type};base64,${this.imgOriginal.data}`
        i.src = src
        d3.select(`${this.id} .img`).append('g').append('image').attr('xlink:href', src)

        d3.select(`${this.id} .img`).append('g').append('path').attr('class', 'mask-path').attr('d', path)

        break
    }
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
