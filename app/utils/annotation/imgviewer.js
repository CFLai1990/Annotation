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
    this.imgResult = null
    this.keysArr = []
    this.keysObj = {}
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
    this.imgResult = img
    switch (this.message) {
      case 'OD_Image':
        $(`${this.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
        console.info('After:', img)
        d3.select(`${this.id} .img`).html('')
        var i = new Image()
        i.onload = function () {
          console.warn(i.width + ', ' + i.height)
          d3.select(`${this.id} .img`).attr('viewBox', '0,0,' + i.width + ',' + i.height)
        }
        let src = `data:${this.imgOriginal.type};base64,${this.imgOriginal.data}`
        i.src = src
        d3.select(`${this.id} .img`).append('g').append('image').attr('xlink:href', src)
        
        let keysObj = {}
        img.forEach((d, i) => {
          let key = Object.keys(d)
          keysObj[key] = i
        })
        this.keysObj = keysObj
        this.keysArr = Object.keys(keysObj)
        console.info('image keysObj:', this.keysObj)
        console.info('image keysArr:', this.keysArr)
        break
    }
  }
  showObj (objectKey=null) {
    d3.select(`${this.id} .img`).selectAll('.gPath').remove()
    if (objectKey && this.imgResult) {
      let keys = this.keysArr
      if (keys.includes(objectKey)){
        let target = this.imgResult[this.keysObj[objectKey]][objectKey]['mask'][0]
        let path = 'M'
        path += target.map(d => '' + d.join(' ')).join('L')
        console.log('path', path)
        d3.select(`${this.id} .img`).append('g').attr('class', 'gPath').append('path').attr('class', 'mask-path').attr('d', path)
      }
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
