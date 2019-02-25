/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
*/
import $ from 'jquery'
import * as d3 from 'd3'
console.log('window', window)
window.d3 = d3
class ImgViewer {
  constructor (message) {
    this.imgOriginal = null
    this.id = '#odresult'
    this.message = message
    this.imgResult = null
    this.keysArr = []
    this.keysObj = {}
    this.heightImage = 0
    this.widthImage = 0
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
    let imgResult = []
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
          let heightTimeline = 60
          let heightText = 50
          d3.select(`${this.id} .img`).attr('viewBox', '0, -' + heightText + ',' + i.width + ',' + (i.height + heightTimeline + heightText))
          this.widthImage = i.width
          this.heightImage = i.height
          console.log('%cwidthImage, heightImage', 'color: green', this.widthImage, this.heightImage)
          let gRoot = d3.select(`${this.id} .img .gRoot`)
          gRoot.selectAll('.gTimeline').remove()
          let gTimeline = gRoot.append('g').attr('class', 'gTimeline').style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + heightTimeline * 0.5) + 'px)')
          // gTimeline.append('rect').attr('width', 100).attr('height', heightTimeline * 0.5)
          // 文本显示区域
          gRoot.selectAll('.gText').remove()
          let gText = gRoot.append('g').attr('class', 'gText').style('transform', 'translate(' + 0 + 'px, -' + (heightText * 1) + 'px)')
          gText
            // .append('g').attr('class', '')
            .html(()=>{
              return '<switch><foreignObject id="text-sentence" x="0" y="0" width="' + this.widthImage + '" height="' + this.heightImage + '"><div class="div-wrap"><div class="div-center"><div class="content" xmlns="http://www.w3.org/1999/xhtml"></div></div></div></foreignObject><g style="transform: translate(' 
              + (this.widthImage * 0.5) + 'px, 0px)"><text class="text-sentence" x="20" y="20">Your SVG viewer cannot display html.</text></g></switch>'
            })
          // gText.append('text').attr('class', 'text-sentence')
        }
        let src = `data:${this.imgOriginal.type};base64,${this.imgOriginal.data}`
        i.src = src
        d3.select(`${this.id} .img`).append('g').attr('class', 'gRoot').append('g').attr('class', 'gImage').append('image').attr('xlink:href', src)
        
        let keysObj = {}
        img.forEach((d, i) => {
          let key = d['class']
          let tmp = {...d}
          tmp.index = i
          // 主要颜色部分
          let colors = ['black', 'gray', 'white', 'red', 'orange', 'brown', 'yellow', 'green', 'blue', 'purple', 'pink']
          let colorArr = []
          colors.forEach(c => {
            if (tmp['color'][c]) {
              let t = {}
              t.color = c
              t.value = tmp['color'][c]
              colorArr.push(t)
            }
          })
          if (colorArr.length > 0) {
            let colorArrSorted = colorArr.sort((a, b) => (Number(b.value)-Number(a.value)))
            tmp['colorMain'] = colorArrSorted[0].color
          } else {
            tmp['colorMain'] = null
          }
          if (keysObj[key]) {
            keysObj[key].push(i)
          } else {
            keysObj[key] = []
            keysObj[key].push(i)
          }
          imgResult.push(tmp)
        })
        this.keysObj = keysObj
        this.keysArr = Object.keys(keysObj)
        console.info('image keysObj:', this.keysObj)
        console.info('image keysArr:', this.keysArr)
        // 位置排序
        let l2rArr = [...imgResult].sort((a, b) => (a['position']['x'] - b['position']['x'])).map(d=>d.index)
        let t2bArr = [...imgResult].sort((a, b) => (a['position']['y'] - b['position']['y'])).map(d=>d.index)
        let s2lArr = [...imgResult].sort((a, b) => (a['size']['area'] - b['size']['area'])).map(d=>d.index)
        let ranking = {}
        ranking.l2rArr = l2rArr
        ranking.t2bArr = t2bArr
        ranking.s2lArr = s2lArr
        this.ranking = ranking
        this.imgResult = imgResult
        console.info('imgResult:', imgResult)
        console.info('ranking:', ranking)
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
  showObjAuto (message=null) {
    let gRoot = d3.select(`${this.id} .img .gRoot`)
    console.log('%cd3', 'color: green', d3)
    gRoot.selectAll('.gPath').remove()
    if (message && this.imgResult) {
      let keys = this.keysArr
      let msg = message.toLowerCase()
      for (let i=0; i<keys.length; i++) {
        let objectKey = keys[i]
        if (msg.indexOf(objectKey.toLowerCase()) > -1) {
          d3.selectAll('.gPath').remove()
          d3.selectAll('.gClipPath').remove()
          let gRoot = d3.select(`${this.id} .img .gRoot`)
          let gPath = gRoot.append('g').attr('class', 'gPath')
          let gClipPath =gRoot.append('g').attr('class', 'gClipPath').append('defs')
          this.keysObj[objectKey].forEach(index => {
            let gClip4Id = gClipPath.append('clipPath').attr('id', 'index-'+index) //.attr('clipPathUnits', 'objectBoundingBox')
            this.imgResult[index]['mask'].forEach(mask=>{
              let target = mask //this.imgResult[index]['mask'][0]
              let path = 'M'
              path += target.map(d => '' + d.join(' ')).join('L')
              path += 'Z'
              // console.log('path', path)
              gPath.append('path').attr('class', 'mask-path index-' + index).attr('d', path)
                .style('display', 'none')
              let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
              
              gClip4Id.append('polygon').attr('points', polygonPoints)
              })
            
          })
          let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
          // 只显示某个区域
          // 多个clipPath
          d3.selectAll('.img-background').remove()
          gImage.clone(true).attr('class', 'img-background') //.lower()
          d3.selectAll('.img-foreground').remove()
          this.keysObj[objectKey].forEach(index => {
            gRoot.selectAll('.mask-path.index-' + index).style('display', '')
            gImage.clone(true).attr('class', 'img-foreground').style('clip-path', 'url(#index-' + index + ')')
          })
          gImage.classed('is-hidden', true)
          break
        }
      }
        
    }
  }
  showSentences (sentences, entities) {
    // The yellow cars are good. All the red cars belong to Mr. Lee.
    // let sentences = [{
    //   'content': 'The yellow cars are good.',
    //   'id': 'st_0'
    // }, {
    //   'content': 'All the red cars belong to Mr. Lee.',
    //   'id': 'st_1'
    // }

    // let entities = {
    //   'st_0': {
    //     'et_2': {
    //       'name': 'car',
    //       'color': {
    //         'yellow': true
    //       }
    //     }
    //   },
    //   'st_1': {
    //     'et_5': {
    //       'name': 'car',
    //       'color': {
    //         'red': true
    //       }
    //     }
    //   }
    // }
    let keySentences = sentences.map(d=>d.id)
    let configArr = []
    console.log('keySentences', keySentences)
    sentences.forEach((sentence, i) => {
      let keySentence = sentence.id
      let entity = entities[keySentence]
      let tmp = {
        transform: [],
        textDiv: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
        line: {
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
        },
        target: [],
        text: ''
      }
      tmp.index = i
      tmp.text = sentence.content
      let keys = Object.keys(entity).sort((a, b)=>(a>b))
      keys.forEach(k=>{
        let objectKey = entity[k]['name']
        let color = Object.keys(entity[k]['color'])[0]
        let objectIndexArr = this.keysObj[objectKey].filter(d => (this.imgResult[d]['colorMain'] === color))
        tmp.target.push(objectIndexArr)
      })
      console.log('tmp.target', tmp.target)
      configArr.push(tmp)
    })
    this.configArr = configArr
    let lengthConfigArr = configArr.length
    let paddingPoint = 50
    let gRoot = d3.select(`${this.id} .img .gRoot`)
    let gTimeline = gRoot.select('.gTimeline')
    gTimeline.html('')
    let widthArrow = 30
    let ratioHeight = 0.7
    gTimeline.append("svg:defs").append("svg:marker")
      .attr("id", "triangle")
      .attr("refX", widthArrow * 0.5)
      .attr("refY", widthArrow * ratioHeight * 0.5)
      .attr("markerWidth", widthArrow)
      .attr("markerHeight", widthArrow)
      .attr("markerUnits","userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr('class', 'markerTriangle')
      .attr("d", 'M0 0 ' + widthArrow + ' ' + widthArrow * ratioHeight * 0.5 + ' 0 ' + widthArrow * ratioHeight + ' ' + widthArrow * 0.5 + ' ' + widthArrow * ratioHeight * 0.5)
      // .style("fill", "black")
      // .style('opacity', 0.1)
    gTimeline.append('path').attr('class', 'path-timeline')
      .attr('d', 'M-' + (((lengthConfigArr+1)*0.5) * paddingPoint) + ' 0h' + ((lengthConfigArr+1) * paddingPoint) + '')
      .attr("marker-end", "url(#triangle)")
    let gPoint = gTimeline.selectAll('.gPoint').data(configArr).enter()
      .append('g').attr('class', 'gPoint')
      .style('transform', (d, i) => {
        return 'translate(' + ((i - (lengthConfigArr-1)*0.5) * paddingPoint) + 'px, 0px)'
      })
      .on('click', (d, i) => {
        this.showSentence(d)
      })
    gPoint.append('circle').attr('class', (d, i) => ('circle-point index-' + i))
      
    // 只显示第一句话
    configArr = [configArr[0]]
    configArr.forEach( config => {
      this.showSentence(config)
    })
  }
  showSentence (config) {
    d3.selectAll('.gPath').remove()
    d3.selectAll('.gClipPath').remove()
    let gRoot = d3.select(`${this.id} .img .gRoot`)
    gRoot.select('.gText .text-sentence').text(config.text)
    gRoot.select('.gText #text-sentence .content').html(config.text)
    let gPath = gRoot.append('g').attr('class', 'gPath')
    let gClipPath =gRoot.append('g').attr('class', 'gClipPath').append('defs')
    let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
    if (config.target.length > 0) {
      config.target.forEach(objectIndexArr => {
        objectIndexArr.forEach(index => {
          let target = this.imgResult[index]['mask'][0]
          // this.imgResult[index] = {
          //   'bbox': {'x': 810.78759765625, 'y': 387.4099426269531, 'width': 206.381591796875, 'height': 153.94271850585938},
          //   'class': 'car',
          //   'color': {'black': 0.2817, 'gray': 0.1314, 'white': 0.04, 'yellow': 0.0374, 'green': 0.4958},
          //   'mask': [[[0, 0], [0, 0]]],
          //   'score': 0.9613808989524841,
          // }
          let path = 'M'
          path += target.map(d => '' + d.join(' ')).join('L')
          path += 'Z'
          // console.log('path', path)
          gPath.append('path').attr('class', 'mask-path index-' + index).attr('d', path)
            .style('display', 'none')
          let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
          gClipPath.append('clipPath').attr('id', 'index-'+index)//.attr('clipPathUnits', 'objectBoundingBox')
            .append('polygon').attr('points', polygonPoints)
        })
      })

      // 只显示某个区域
      // 多个clipPath
      d3.selectAll('.img-background').remove()
      gImage.clone(true).attr('class', 'img-background') //.lower()
      d3.selectAll('.img-foreground').remove()
      config.target.forEach(objectIndexArr => {
        objectIndexArr.forEach(index => {
          gRoot.selectAll('.mask-path.index-' + index).style('display', '')
          gImage.clone(true).attr('class', 'img-foreground').style('clip-path', 'url(#index-' + index + ')')
        })
      })
      gImage.classed('is-hidden', true)
    } else {
      gImage.classed('is-hidden', false)
    }
    // 添加趋势线
    d3.selectAll('.gPathTrend').remove()
    gRoot.append('g').attr('class', 'gPathTrend').append('path')
    d3.selectAll('.current').classed('current', false)
    d3.select('.circle-point.index-' + config.index).classed('current', true)
  }
  show (visible = true) {
    if (visible === true) {
      $(this.id).show()
    } else {
      $(this.id).hide()
    }
  }
  getResult20190217 (img) {
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
        d3.select(`${this.id} .img`).append('g').attr('class', 'gRoot').append('g').attr('class', 'gImage').append('image').attr('xlink:href', src)
        
        let keysObj = {}
        img.forEach((d, i) => {
          let key = Object.keys(d)
          if (keysObj[key]) {
            keysObj[key].push(i)
          } else {
            keysObj[key] = []
            keysObj[key].push(i)
          }
        })
        this.keysObj = keysObj
        this.keysArr = Object.keys(keysObj)
        console.info('image keysObj:', this.keysObj)
        console.info('image keysArr:', this.keysArr)
        break
    }
  }
  showObjAuto20190217 (message=null) {
    let gRoot = d3.select(`${this.id} .img .gRoot`)
    console.log('%cd3', 'color: green', d3)
    gRoot.selectAll('.gPath').remove()
    if (message && this.imgResult) {
      let keys = this.keysArr
      let msg = message.toLowerCase()
      for (let i=0; i<keys.length; i++) {
        let objectKey = keys[i]
        if (msg.indexOf(objectKey.toLowerCase()) > -1) {
          let gPath = gRoot.append('g').attr('class', 'gPath')
          let gClipPath =gRoot.append('g').attr('class', 'gClipPath').append('defs')

          this.keysObj[objectKey].forEach(index => {
            let target = this.imgResult[index][objectKey]['mask'][0]
            let path = 'M'
            path += target.map(d => '' + d.join(' ')).join('L')
            // console.log('path', path)
            gPath.append('path').attr('class', 'mask-path index-' + index).attr('d', path)
              .style('display', 'none')
            let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
            gClipPath.append('clipPath').attr('id', 'index-'+index)//.attr('clipPathUnits', 'objectBoundingBox')
              .append('polygon').attr('points', polygonPoints)
          })
          let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
          gImage.clone(true).attr('class', 'img-background').lower()
          // 只显示某个区域
          gRoot.selectAll('.mask-path.index-' + this.keysObj[objectKey][0]).style('display', '')
          gImage.style('clip-path', 'url(#index-' + this.keysObj[objectKey][0] + ')')
          break
        }
      }
        
    }
  }
  showSentences20190221 (sentences, entities) {
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
    // let sentences = [{
    //   'content': 'The yellow cars are good.',
    //   'id': 'st_0'
    // }, {
    //   'content': 'All the red cars belong to Mr. Lee.',
    //   'id': 'st_1'
    // }
    let configArr = []
    let keys = Object.keys(entities).sort((a, b)=>(a>b))
    console.log('keys', keys)
    keys.forEach(k => {
      let tmp = {
        transform: [],
        textDiv: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
        line: {
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
        },
        target: []
      }
      let objectKey = entities[k]['name']
      let color = Object.keys(entities[k]['color'])[0]
      let objectIndexArr = this.keysObj[objectKey].filter(d => (this.imgResult[d]['colorMain'] === color))
      console.log('objectIndexArr', objectIndexArr)
      tmp.target = objectIndexArr
      configArr.push(tmp)
    })
    // 只显示第一句话
    // configArr = [configArr[0]]
    configArr.forEach( config => {
      let objectIndexArr = config.target
      d3.selectAll('.gPath').remove()
      d3.selectAll('.gClipPath').remove()
      let gRoot = d3.select(`${this.id} .img .gRoot`)
      let gPath = gRoot.append('g').attr('class', 'gPath')
      let gClipPath =gRoot.append('g').attr('class', 'gClipPath').append('defs')
      objectIndexArr.forEach(index => {
        let target = this.imgResult[index]['mask'][0]
        // this.imgResult[index] = {
        //   'bbox': {'x': 810.78759765625, 'y': 387.4099426269531, 'width': 206.381591796875, 'height': 153.94271850585938},
        //   'class': 'car',
        //   'color': {'black': 0.2817, 'gray': 0.1314, 'white': 0.04, 'yellow': 0.0374, 'green': 0.4958},
        //   'mask': [[[0, 0], [0, 0]]],
        //   'score': 0.9613808989524841,
        // }
        let path = 'M'
        path += target.map(d => '' + d.join(' ')).join('L')
        path += 'Z'
        // console.log('path', path)
        gPath.append('path').attr('class', 'mask-path index-' + index).attr('d', path)
          .style('display', 'none')
        let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
        gClipPath.append('clipPath').attr('id', 'index-'+index)//.attr('clipPathUnits', 'objectBoundingBox')
          .append('polygon').attr('points', polygonPoints)
      })
      let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
      // 只显示某个区域
      // 多个clipPath
      d3.selectAll('.img-background').remove()
      gImage.clone(true).attr('class', 'img-background') //.lower()
      d3.selectAll('.img-foreground').remove()
      objectIndexArr.forEach(index => {
        gRoot.selectAll('.mask-path.index-' + index).style('display', '')
        gImage.clone(true).attr('class', 'img-foreground').style('clip-path', 'url(#index-' + index + ')')
      })
      gImage.classed('is-hidden', true)
    })
  }
}

export default ImgViewer
