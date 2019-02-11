/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
*/
import $ from 'jquery'
import * as d3 from 'd3'

class ImgViewer {
  constructor (message) {
    this.id = '#odresult'
    this.message = message
  }
  showImg (data) {
    switch (this.message) {
      case 'OD_Image':
        $(`${this.id} .img`).attr('src', `data:${data.type};base64,${data.data}`)
        break
      case 'OD_Mask':
        d3.select(`${this.id} .img`)
        .selectAll('.content')
        .data([data])
        .enter()
        .append('image')
        .attr('class', 'content')
        .attr('src', (d) => { return `data:${d.type};base64,${d.data}` })
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
