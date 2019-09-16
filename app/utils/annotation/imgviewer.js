/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
*/
import $ from 'jquery'
import * as d3 from 'd3'
import 'utils/font_size.js'
import emitter from '../../utils/events'
import setTextPosition from '../../utils/annotation/an_box.js'

console.log('window', window)
window.d3 = d3
class ImgViewer {
  constructor (message) {
    let that = this
    this.configArr = []
    this.imgOriginal = null
    this.id = '#odresult'
    this.message = message
    this.imgResult = null
    this.imgReceived = null
    this.keysArr = []
    this.keysObj = {}
    this.heightImage = 0
    this.widthImage = 0
    this.widthMax = 0
    this.heightText = 0 // 100
    this.heightTimeline = 60
    this.duration = 800
    this.lengthConfigArr = null
    this.indexConfig = 0
    this.eventEmitter = emitter.addListener('clickSentence', (message) => {
      let indexConfig = message
      that.indexConfig = indexConfig
      let d = that.configArr[indexConfig]
      that.showSentence(d)
    })
    this.eventEmitterChangeSetting = emitter.addListener('changeSetting', (message) => {
      that.onChangeSetting(message[0], message[1])
    })
  }
  onChangeSetting (key, value) {
    let that = this
    this.configArr.forEach(d => {
      d[key] = value
    })
    console.warn('that.configArr', key, value, that.configArr)
    let d = that.configArr[that.indexConfig]
    this.showSentence(d)
  }
  getOriginal (img) {
    switch (this.message) {
      case 'OD_Image':
        $(`${this.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
      case 'OD_Demo':
        console.warn('Before:', img)
        this.imgOriginal = img
        break
    }
  }
  getColorMain (tmp) {
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
      // return colorArrSorted[0].color
      if (colorArrSorted[0].color === "white") {
        return colorArrSorted[1].color
      } else {
        return colorArrSorted[0].color
      }
    } else {
      return null
    }
  }
  getResult (img) {
    let that = this
    this.imgReceived = img
    let imgResult = []
    switch (that.message) {
      case 'OD_Image':
        $(`${that.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
      case 'OD_Demo':
        console.warn('After:', img)
        d3.select(`${that.id} .img`).html('')
        
        let src = `data:${that.imgOriginal.type};base64,${that.imgOriginal.data}`
        let gRoot = d3.select(`${that.id} .img`).append('g').attr('class', 'gRoot')
        // 用于添加背景
        gRoot.append('g').attr('class', 'gBackground')
        // 原始图片
        gRoot.append('g').attr('class', 'gImage').append('image').attr('xlink:href', src)
        // 用于高亮轴和图标等
        gRoot.append('g').attr('class', 'gAuxiliary')
        // 用于添加目标物体
        // d3.selectAll('.gPathTrend').remove()
        gRoot.append('g').attr('class', 'gTarget')
        // 用于添加趋势线
        // d3.selectAll('.gPathTrend').remove()
        gRoot.append('g').attr('class', 'gPathTrend').append('path')
        // 用于添加连接线
        // d3.selectAll('.gPathConnect').remove()
        gRoot.append('g').attr('class', 'gPathConnect')

        var i = new Image()
        i.onload = function () {
          console.warn(i.width + ', ' + i.height)
          let div = d3.select(`${that.id}`).node()
          that.widthDiv = div.clientWidth
          that.heightDiv = div.clientHeight
          that.heightTimeline = that.heightDiv / 10
          // that.heightText = 0
          that.heightText = that.heightDiv / 20
          let heightTimeline = that.heightTimeline
          let heightText = that.heightText
          that.widthImage = i.width
          that.heightImage = i.height
          
          // d3.select(`${that.id} .img`).attr('viewBox', '0, -' + that.heightText + ',' + i.width + ',' + (i.height + that.heightTimeline + that.heightText))  
          d3.select(`${that.id} .img`).attr('viewBox', '0, 0, ' + i.width + ',' + (i.height + that.heightTimeline + that.heightText))
          
          let gRoot = d3.select(`${that.id} .img .gRoot`)
          // 文本框允许的最大宽度
          let image = gRoot.select('.gImage image')
          let clientWidthImage = image.node().getBoundingClientRect().width
          that.widthMax = that.widthImage / clientWidthImage * that.widthDiv * 0.8
          console.log('%cwidthImage, heightImage', 'color: green', that.widthImage, that.heightImage, that.heightTimeline, that.heightText, that)

          // this.gRoot = gRoot
          gRoot.selectAll('.gTimeline').remove()
          // let gTimeline = gRoot.append('g').attr('class', 'gTimeline').style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, ' + (that.heightImage + that.heightTimeline * 0.5) + 'px)')
          let gTimeline = gRoot.append('g').attr('class', 'gTimeline')
            .style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, ' + (that.heightImage + that.heightText + that.heightTimeline * 0.5) + 'px)')
          // gTimeline.append('rect').attr('width', 100).attr('height', heightTimeline * 0.5)
          // 文本显示区域
          gRoot.selectAll('.gText').remove()
          let gText = gRoot.append('g').attr('class', 'gText')
            .style('display', 'none')
            .style('pointer-events', 'none')
            // .style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, -' + (that.heightText * 1) + 'px)')
            .style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, ' + (that.heightImage + that.heightText * 0.5) + 'px)')
          gText
            // .append('g').attr('class', '')
            .html(()=>{
              return '<foreignObject id="text-sentence-ruler" x="0" y="0" width="' + that.widthMax + '" height="' + that.heightImage + `">
                <div class="div-wrap"><div class="div-center">
                  <div id="ruler" class="text-sentence" xmlns="http://www.w3.org/1999/xhtml"></div>
                </div></div></foreignObject>
              <switch><foreignObject id="text-sentence" x="0" y="0" style="overflow: visible;" width="` + that.widthMax + '" height="' + that.heightImage + `">
                <div class="div-wrap"><div class="div-center">
                  <div class="text-sentence" xmlns="http://www.w3.org/1999/xhtml"></div>
                </div></div></foreignObject>
                <g id="g-text-sentence" style="transform: translate(`
              + 0 + `px, 0px)"><text class="text-sentence" x="20" y="20">Your SVG viewer cannot display html.</text></g></switch>`
            })
          // gText.append('text').attr('class', 'text-sentence')
        // }
        // i.src = src

        // entity对应的index供后面引用
        let keysObj = {}
        img['data'].forEach((d, i) => {
          let key = d['class']
          let tmp = d // {...d}
          tmp.index = i
          // 主要颜色部分
          tmp['colorMain'] = that.getColorMain(tmp)
          // tmp['colorMain_rgb'] = d['color_rgb'][tmp['colorMain']]
          
          if (keysObj[key]) {
            keysObj[key].push(i)
          } else {
            keysObj[key] = []
            keysObj[key].push(i)
          }
          imgResult.push(tmp)
        })
        that.keysObj = keysObj
        that.keysArr = Object.keys(keysObj)
        console.warn('image keysObj:', that.keysObj)
        console.warn('image keysArr:', that.keysArr)

        // label对应的index供后面引用
        let labelsObj = {}
        img['data'].forEach((d, i) => {
          let keys = d['label']
          keys.forEach(key => {
            if (labelsObj[key]) {
              labelsObj[key].push(i)
            } else {
              labelsObj[key] = []
              labelsObj[key].push(i)
            }
          })
        })
        that.labelsObj = labelsObj
        that.labelsArr = Object.keys(labelsObj)
        console.warn('image labelsObj:', that.labelsObj)
        console.warn('image labelsArr:', that.labelsArr)

        // colorMain对应的index供后面引用
        let colorMainObj = {}
        img['data'].forEach((d, i) => {
          let key = d['colorMain']
          if (colorMainObj[key]) {
            colorMainObj[key].push(i)
          } else {
            colorMainObj[key] = []
            colorMainObj[key].push(i)
          }
        })
        that.colorMainObj = colorMainObj
        that.colorMainArr = Object.keys(colorMainObj)
        console.warn('image colorMainObj:', that.colorMainObj)
        console.warn('image colorMainArr:', that.colorMainArr)

        // legend对应的index供后面引用
        // axis对应的index供后面引用
        that.mainX1 = 0
        that.mainX2 = that.widthImage
        that.mainY1 = 0
        that.mainY2 = that.heightImage
        let legendsObj = {}
        let axesObj = {}
        img['auxiliary'].forEach(d=>{
          if(d['class'] === 'legend') {
            let key = d['label']
            let color = that.getColorMain(d)
            if (color) {
              if (that.colorMainObj[color]) {
                if (legendsObj[key]) {
                } else {
                  legendsObj[key] = that.colorMainObj[color]
                }
              }
            }
          } else if(d['class'] === 'axis') {
            let key = d['label']
            if (axesObj[key]) {
            } else {
              let ticks = d['axis_data']['ticks']
              let direction = d['axis_data']['direction']
              let ticksArr = []
              // 万一后台判断错呢？可能实际上direction应该是90
              if(d['bbox']['height']>4*ticks[0]['bbox']['height']) {
                d['axis_data']['direction'] = 90
                direction = 90
              }
              if (direction === 0) {
                // 水平的轴
                ticks.forEach(tick => {
                  tick['value'] = tick['position']['x']
                })
                ticksArr = ticks.sort((a, b)=> (a['position']['x']-b['position']['x']))
                that.mainX1 = d['bbox']['x']
                that.mainX2 = d['bbox']['x'] + d['bbox']['width']
              } else if (direction === 90) {
                ticks.forEach(tick => {
                  tick['value'] = tick['position']['y']
                })
                // 这里按照y值从大到小，也就是轴上tick语义上的从小到大
                ticksArr = ticks.sort((a, b)=> (b['position']['y']-a['position']['y']))
                that.mainY1 = d['bbox']['y']
                that.mainY2 = d['bbox']['y'] + d['bbox']['height']
              }
              d['axis_data']['ticksSortedArr'] = ticksArr
              axesObj[key] = d
            }
          }
        })
        that.legendsObj = legendsObj
        that.legendsArr = Object.keys(legendsObj)
        console.warn('image legendsObj:', that.legendsObj)
        console.warn('image legendsArr:', that.legendsArr)

        that.axesObj = axesObj
        that.axesArr = Object.keys(axesObj)
        console.warn('image axesObj:', that.axesObj)
        console.warn('image axesArr:', that.axesArr)

        console.warn('main X1, X2, Y1, Y2:', that.mainX1, that.mainX2, that.mainY1, that.mainY2)

        // 颜色信息供后面引用
        let colorsObj = {}
        that.legendsArr.forEach(d => {
          if (that.legendsObj[d].length > 0) {
            let index = that.legendsObj[d][0]
            colorsObj[d] = img['data'][index]['colorMain']
          }
        })
        that.labelsArr.forEach(d => {
          if (that.labelsObj[d].length > 0) {
            let index = that.labelsObj[d][0]
            colorsObj[d] = img['data'][index]['colorMain']
          }
        })
        that.colorsObj = colorsObj
        console.warn('image colorsObj:', that.colorsObj)

        // 位置排序
        let l2rArr = [...imgResult].sort((a, b) => (a['position']['x'] - b['position']['x'])).map(d=>d.index)
        let t2bArr = [...imgResult].sort((a, b) => (a['position']['y'] - b['position']['y'])).map(d=>d.index)
        let s2lArr = [...imgResult].sort((a, b) => (a['size']['area'] - b['size']['area'])).map(d=>d.index)
        let ranking = {}
        ranking.l2rArr = l2rArr
        ranking.t2bArr = t2bArr
        ranking.s2lArr = s2lArr
        that.ranking = ranking
        that.imgResult = imgResult
        console.warn('imgResult:', imgResult)
        console.warn('ranking:', ranking)
      }
        i.src = src

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
        d3.select(`${this.id} .img`).append('g').attr('class', 'gPath').append('path')
          .attr('class', 'mask-path').attr('d', path)
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
  isOverlapped (bbox, range, direction) {
    let x1 = bbox.x
    let x2 = bbox.x + bbox.width
    let y1 = bbox.y
    let y2 = bbox.y + bbox.height
    let v1 = null
    let v2 = null
    // range是[low, high]
    let low = range[0]
    let high = range[1]
    if (direction === 90) {
      v1 = y1
      v2 = y2
    } else if (direction === 0) {
      v1 = x1
      v2 = x2
    }
    let flag = true
    if (v2<low) {
      flag = false
    }
    if (v1>high) {
      flag = false
    }
    return flag
  }
  getTickValue (ticks, value) {
    let that = this
    let i_tmp = 0
    let result = null
    for (let i=0; i<ticks.length; i++) {
      let tick = ticks[i]
      if (tick['text'] === value) {
        result = tick['value']
        break
      }
    }
    return result
  }
  getRange(labelAxis, direction, ticks, tick, relation) {
    let that = this
    let value = null
    let v1 = 0
    let v2 = 0
    let range = [0, 0]
    let low = 0
    let high = 0
    let i_tmp = 0
    if (direction === 0) {
      low = that.mainX1 // 0
      high = that.mainX2 // that.widthImage
    } else if (direction === 90) {
      // 先low high颠倒，return时再改顺序
      low = that.mainY2 // that.heightImage
      high = that.mainY1 // 0
    }
    switch(relation) {
      case 'at':
        value = tick['values'][0]
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === value) {
            if (i-1<0) {
            } else {
              low = ticks[i]['value']-(ticks[i]['value']-ticks[i-1]['value'])*0.5
            }
            if (i+1>ticks.length - 1) {
            } else {
              high = ticks[i]['value']+(ticks[i+1]['value']-ticks[i]['value'])*0.5
            }
            break
          }
        } 
        break
      case 'above':
        value = tick['values'][0]
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === value) {
            low = ticks[i]['value']
            break
          }
        }
        break
      case 'below':
        value = tick['values'][0]
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === value) {
            high = ticks[i]['value']
            break
          }
        }
        break
      case 'before':
        value = tick['values'][0]
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === value) {
            if (i-1<0) {
            } else {
              low = ticks[i]['value']-(ticks[i]['value']-ticks[i-1]['value'])*0.5
            }
            break
          }
        }
        break
      case 'after':
        value = tick['values'][0]
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === value) {
            if (i+1>ticks.length - 1) {
            } else {
              low = ticks[i]['value']+(ticks[i+1]['value']-ticks[i]['value'])*0.5
            }
            break
          }
        }
        break
      case 'from_to':
        v1 = tick['values'][0]
        v2 = tick['values'][1]
        i_tmp = 0
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === v1) {
            if (i-1<0) {
            } else {
              low = ticks[i]['value']-(ticks[i]['value']-ticks[i-1]['value'])*0.5
            }
            i_tmp = i
            break
          }
        }
        for (let i=i_tmp + 1; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === v2) {
            if (i+1>ticks.length - 1) {
            } else {
              high = ticks[i]['value']+(ticks[i+1]['value']-ticks[i]['value'])*0.5
            }
            break
          }
        }
        break
      case 'between':
        v1 = tick['values'][0]
        v2 = tick['values'][1]
        i_tmp = 0
        for (let i=0; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === v1) {
            low = ticks[i]['value']
            i_tmp = i
            break
          }
        }
        for (let i=i_tmp + 1; i<ticks.length; i++) {
          let tick = ticks[i]
          if (tick['text'] === v2) {
            high = ticks[i]['value']
            break
          }
        }
        break
      default: 
        break
    }
    // range = [low, high]
    if (direction === 0) {
      range = [low, high]
    } else if (direction === 90) {
      // 之前low high颠倒，return时再改顺序
      range = [high, low]
    }
    return range
  }
  filterObjectIndexArrByAxis(objectIndexArrOriginal, axis) {
    let that = this
    let objectIndexArr = objectIndexArrOriginal
    let len = axis.length
    let tickLinesArr = []
    for(let i = 0; i< len; i++) {
      let d = axis[i]
      console.log('axis[i]', i, axis[i])
      let labelAxis = d['label']
      if (d['ticks'].length>0) {
        let tick = d['ticks'][0]
        let relation = tick['relation']
        let ticks = that.axesObj[labelAxis]['axis_data']['ticksSortedArr']
        let direction = that.axesObj[labelAxis]['axis_data']['direction']
        let range = that.getRange(labelAxis, direction, ticks, tick, relation)
        objectIndexArr = objectIndexArr.filter(index=>{
          let bbox = that.imgResult[index]['bbox']
          return that.isOverlapped(bbox, range, direction)
        })
        console.log('====',relation, range, direction, objectIndexArr)
      }
    }
    return [objectIndexArr, tickLinesArr]
  }
  getContent (text) {
    let that = this
    let keys = Object.keys(that.colorsObj)
    let string = text
    keys.forEach(pattern => {
      let re = new RegExp(pattern, "gi");
      let color = that.colorsObj[pattern]
      let tag = 'b' // 'span'
      string = string.replace(re, '<' + tag + ' style="color: '+ color+';">$&</' + tag + '>')
    })
    console.log('~~~~~~~~~~~~getContent color keys', keys, '\n', text, '\n', string)
    return string
  }
  showContext(){
    let that = this
    d3.select(`${that.id}`).selectAll('#svg-img-context').remove()
    // 复制一份用于当背景
    let rootBackground = d3.select(`${that.id} .img`).clone(false).attr('id', 'svg-img-context').lower()
    let el = rootBackground.append('g').attr('class', 'gImgContext')
    let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
    let image = gImage.select('image').node().cloneNode()
    let target = [[that.mainX1, that.mainY1], [that.mainX1, that.mainY2], [that.mainX2, that.mainY2], [that.mainX2, that.mainY1]]
    let index = 0
    let path = 'M'
    path += target.map(d => '' + d.join(' ')).join('L')
    path += 'Z'
    let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
    el.append('defs')
      .append('clipPath').attr('id', 'index-context-' + index) //.attr('clipPathUnits', 'objectBoundingBox')
      .append('polygon').attr('points', polygonPoints)
    let gImageContext = el.append('g').attr('class', 'img-context')
    gImageContext.style('clip-path', 'url(#index-context-' + index + ')')
    gImageContext.node().appendChild(image)
    let ePath = el.append('path').attr('class', 'mask-path-context index-context-' + index).attr('d', path)
  }
  showSentences (message) {
    let that = this
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
    let sentences = message['sentences']
    let entities = message['entities']
    let keySentences = sentences.map(d=>d.id)
    let configArr = []
    // // 添加默认视图
    // let tmp = {
    //   default: true
    // }
    // target.push()
    // configArr.push(tmp)
    console.log('keySentences', keySentences)
    sentences.forEach((sentence, i) => {
      console.log('--------------sentence', i, sentence)
      let keySentence = sentence.id
      let tmp = {
        textFixed: false,
        valueContextFade: true,
        contextMode: 'context-transparency', // 'context-transparency', 'context-desaturate', 'context-brightness', 'context-depth-of-field'
        overlayColor: 'rgba(0, 0, 0, 0.2)',
        lineColor: 'rgba(108, 117, 125, 1)',
        borderColor: 'rgba(0, 0, 0, 0.5)', // 'transparent',
        shadowColor: 'rgba(0, 0, 0, 0.5)', // 'transparent',
        shadowShow: true,
        borderShow: false,
        transform: [],
        textDiv: {
          width: null,
          height: null,
          x_center: 0,
          y_center: 0,
        },
        path: {
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
        },
        target: [],
        target4label: [],
        target4legend: [],
        text: ''
      }
      // 处理entity
      let entity = entities[keySentence]
      tmp.index = i
      // tmp.text = sentence.content
      tmp.text = that.getContent(sentence.content)
      let keys = Object.keys(entity).sort((a, b)=>(a>b))
      console.log('keys entity', keys)

      keys.forEach(k=>{
        let objectKey = entity[k]['name']
        
        if (this.keysObj[objectKey]) {
          let objectIndexArr = this.keysObj[objectKey]
          if (entity[k]['color']) {
            let color = Object.keys(entity[k]['color'])[0]
            objectIndexArr = objectIndexArr.filter(d => (this.imgResult[d]['colorMain'] === color))
          }
          if (entity[k]['location']) {
            let location = Object.keys(entity[k]['location'])[0]
            objectIndexArr = this.selectLocation(objectIndexArr, location)
          }
          tmp.target.push(objectIndexArr)
        }
      })
      console.log('tmp.target', tmp.target)
      let objectIndexArr = null
      let target = null
      // 如果句子中有entity
      if (tmp.target.length > 0) {
        objectIndexArr = tmp.target[0][0]
        target = this.imgResult[objectIndexArr]
        console.log('target', target)
        tmp.path.x0 = this.widthImage * 0.5
        tmp.path.y0 = -20 // 200
        // tmp.path.x1 = target['position'].x
        // tmp.path.y1 = target['position'].y
        tmp.path.x1 = target['bbox'].x + target['bbox'].width * 0.5
        tmp.path.y1 = target['bbox'].y
      } else {
        // 句子中没有entity
      }

      // 处理labels
      let target4label = null
      keys.forEach(k=>{
        let objectKey = entity[k]['label']
        
        if (this.labelsObj[objectKey]) {
          let objectIndexArr = this.labelsObj[objectKey]
          tmp.target4label.push(objectIndexArr)
        }
      })
      console.log('tmp.target4label', tmp.target4label)
      // 如果句子中有label
      if (tmp.target4label.length > 0) {
        objectIndexArr = tmp.target4label[0][0]
        target4label = this.imgResult[objectIndexArr]
        console.log('target4label', target4label)
      }

      // let labels = message['labels']
      // if (labels) {
      //   if (labels[keySentence]) {
      //     let target4label = null
      //     let label = labels[keySentence]
      //     keys = Object.keys(label) // .sort((a, b)=>(a>b))
      //     console.log('keys label', keys)

      //     keys.forEach(k=>{
      //       let objectKey = k
      //       if (this.labelsObj[objectKey]) {
      //         let objectIndexArr = this.labelsObj[objectKey]
      //         tmp.target4label.push(objectIndexArr)
      //       }
      //     })
      //     console.log('tmp.target4label', tmp.target4label)
      //     // 如果句子中有label
      //     if (tmp.target4label.length > 0) {
      //       objectIndexArr = tmp.target4label[0][0]
      //       target4label = this.imgResult[objectIndexArr]
      //       console.log('target4label', target4label)
      //     }
      //   }
      // }

      // 处理legend
      let target4legend = null
      // 同时在这里处理ticklne辅助线吧...
      let tickLinesArr = null
      keys.forEach(k=>{
        let objectKey = entity[k]['legend']
        if (this.legendsObj[objectKey]) {
          let objectIndexArr = this.legendsObj[objectKey]
          console.log('***************', objectKey, objectIndexArr)
          let axis = entity[k]['axis']
          if (axis) {
            [objectIndexArr, tickLinesArr] = that.filterObjectIndexArrByAxis(objectIndexArr, axis)
            if (tmp.axis) {
              tmp.axis.push(axis)
            } else {
              tmp.axis = []
              tmp.axis.push(axis)
            }
          }
          tmp.target4legend.push(objectIndexArr)
        }
      })
      console.log('tmp.target4legend', tmp.target4legend)
      // 如果句子中有legend
      if (tmp.target4legend.length > 0) {
        objectIndexArr = tmp.target4legend[0][0]
        target4legend = this.imgResult[objectIndexArr]
        console.log('target4legend', target4legend)
      }
      let targetArr = [...tmp.target, ...tmp.target4label, ...tmp.target4legend]
      tmp.targetArr = targetArr
      
      configArr.push(tmp)
      
    })

    // let paddingPoint = Math.max(this.widthDiv/15, 50) * (that.widthImage/that.widthDiv) // 50
    let paddingPoint = (this.widthDiv/15) * (that.widthImage/that.widthDiv) // 50
    that.paddingPoint = paddingPoint
    that.rCircle = paddingPoint/5
    that.widthStroke = that.rCircle * 0.5
    that.fontSize = that.paddingPoint * 0.35
    let rCircle = that.rCircle
    let widthStroke = that.widthStroke
    console.warn('configArr', configArr)

    // 合适的文本框位置
    let rawLayoutData = that.imgReceived
    let highlightedData = {}
    highlightedData['sentences'] = sentences
    highlightedData['mainX1'] = that.mainX1
    highlightedData['mainX2'] = that.mainX2
    highlightedData['mainY1'] = that.mainY1
    highlightedData['mainY2'] = that.mainY2
    highlightedData['fontSize'] = that.fontSize + 'px'
    highlightedData['objects'] = configArr.map(d=>{
      let a = d['targetArr'].flatten()
      if (a.length < 1) {
        a = d3.range(that.imgResult.length)
      }
      return a
    })
    configArr.forEach((d, highlightIndex)=>{
      console.warn('----------------', {highlightedData, rawLayoutData, highlightIndex})
      let textDiv = setTextPosition (highlightedData, rawLayoutData, highlightIndex)
      // let textDiv = null
      if (textDiv) {
        d['textDiv'] = textDiv
      } else {
        d['textFixed'] = true
        d['textDiv']['width'] = this.widthImage
        d['textDiv']['x_center'] = this.widthImage * 0.5
        d['textDiv']['y_center'] = this.heightImage + this.heightText * 0.5
      }
    })

    this.configArr = configArr
    console.warn('configArr', configArr)
    let lengthConfigArr = configArr.length
    this.lengthConfigArr = lengthConfigArr

    let gRoot = d3.select(`${this.id} .img .gRoot`)
    let gTimeline = gRoot.select('.gTimeline')
    gTimeline.html('')
    let widthArrow = 6 //30
    let ratioHeight = 0.75
    gTimeline.append("svg:defs").append("svg:marker")
      .attr("id", "triangle")
      .attr("refX", widthArrow * 0.5)
      .attr("refY", widthArrow * ratioHeight * 0.5)
      .attr("markerWidth", widthArrow)
      .attr("markerHeight", widthArrow)
      // .attr("markerUnits","userSpaceOnUse")
      .attr("markerUnits","strokeWidth")
      .attr("orient", "auto")
      .append("path")
      .attr('class', 'markerTriangle')
      .attr("d", 'M0 0 ' + widthArrow + ' ' + widthArrow * ratioHeight * 0.5 + ' 0 ' + widthArrow * ratioHeight + ' ' + widthArrow * 0.5 + ' ' + widthArrow * ratioHeight * 0.5)
      // .style("fill", "black")
      // .style('opacity', 0.1)
    let cloned = gTimeline.select('marker').clone(true).attr('id', 'triangle-path-connect')
    cloned.select('path').attr('class', 'markerTrianglePathConnect')
    gTimeline.append('path').attr('class', 'path-timeline')
      .attr('d', 'M-' + (((lengthConfigArr+1)*0.5) * paddingPoint) + ' 0h' + ((lengthConfigArr+1) * paddingPoint) + '')
      .attr('marker-end', 'url(#triangle)')
      .style('stroke-width', widthStroke + 'px')
    let gPoint = gTimeline.selectAll('.gPoint').data(configArr).enter()
      .append('g').attr('class', 'gPoint')
      .style('transform', (d, i) => {
        return 'translate(' + ((i - (lengthConfigArr-1)*0.5) * paddingPoint) + 'px, 0px)'
      })
      .on('click', (d, i) => {
        that.clickSentence(i)
      })
    gPoint.append('circle').attr('class', (d, i) => ('circle-point index-' + i))
      .style('r', (rCircle) + 'px')


    that.showContext()

    // 始终显示auxiliary部分，包括legend和axes
    that.showAuxiliary()

    // 添加背景blur的东西，添加box-shadow效果
//     let filter = `<filter id="dropshadow" width="300%" height="300%">
//   <feGaussianBlur in="SourceGraphic" stdDeviation="5"/> <!-- stdDeviation is how much to blur -->
//   <feOffset dx="0" dy="0" result="offsetblur"/> <!-- how much to offset -->
//   <feComponentTransfer>
//     <feFuncA type="linear" slope="0.5"/> <!-- slope is the opacity of the shadow -->
//   </feComponentTransfer>
//   <feMerge> 
//     <feMergeNode/> <!-- this contains the offset blurred image -->
//     <!-- <feMergeNode in="SourceGraphic"/> --> <!-- this contains the element that the filter is applied to -->
//   </feMerge>
// </filter>`
    let filter = `<filter id="dropshadow" x="-100%" y="-50%" height="200%" width="400%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3"/> 
      <feOffset dx="` + (that.widthStroke) + `" dy="-` + (that.widthStroke / 2) + `" result="offsetblur"/> 
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/> 
      </feMerge>
    </filter>` // <feFlood flood-color="gray" flood-opacity="0.9" result="offsetColor"/>
    gTimeline.append('defs').html(filter)
    // gRoot.select
// <circle cx="170" cy="80" r="60" style="filter:url(#dropshadow)"/>


    d3.select('html').on('keydown', function(d, i) {
      if (d3.event.keyCode === 38 || d3.event.keyCode === 37) { // key: "ArrowUp"/"ArrowLeft"
        let indexConfig = (that.indexConfig + that.lengthConfigArr - 1) % that.lengthConfigArr
        that.clickSentence(indexConfig)
      } else if (d3.event.keyCode === 40 || d3.event.keyCode === 39) { // key: "ArrowDown"/"ArrowRight"
        let indexConfig = (that.indexConfig + 1) % that.lengthConfigArr
        that.clickSentence(indexConfig)
      }
      // console.log(d3.event, d3.event.keyCode, that.indexCurrent, that.indexLength)
    })
    
      
    // 只显示第一句话
    // that.indexConfig = 0
    // that.showSentence(configArr[0])
    that.clickSentence(0)
    // configArr = [configArr[0]]
    // configArr.forEach( config => {
    //   // if (config.default) {
    //   // } else {
    //   //   this.showSentence(config)
    //   // }
    //   this.showSentence(config)

    // })
  }
  clickSentence (index) {
    emitter.emit('clickSentence', index)
  }
  selectLocation(objectIndexArr, location) {
    console.log('+++++++++++++++++sort',  objectIndexArr, location)
    let sort = null
    switch(location) {
      case 'left':
        sort = objectIndexArr.sort((a, b) => {
          return this.imgResult[a]['position'].x - this.imgResult[b]['position'].x
        })
        console.log('=================sort', sort)
        return [sort[0]]
        break
      case 'right':
        sort = objectIndexArr.sort((a, b) => {
          return this.imgResult[b]['position'].x - this.imgResult[a]['position'].x
        })
        console.log('=================sort', sort)
        return [sort[0]]
        break
      case 'top':
        sort = objectIndexArr.sort((a, b) => {
          return this.imgResult[a]['position'].y - this.imgResult[b]['position'].y
        })
        console.log('=================sort', sort)
        return [sort[0]]
        break
      case 'bottom':
        sort = objectIndexArr.sort((a, b) => {
          return this.imgResult[b]['position'].y - this.imgResult[a]['position'].y
        })
        return [sort[0]]
        break
      default:
        console.log('=================sort', sort)
        return objectIndexArr
        break
    }
  }
  showRange(config, axis, gRoot) {
    // 同时在这个函数里面处理添加辅助线的功能吧。。。。
    let that = this
    let len = axis.length
    let tickLinesArr = []
    let overlayColor = config.overlayColor // 'rgba(0, 0, 0, 0.2)'
    for(let i = 0; i< len; i++) {
      let d = axis[i]
      console.log('axis[i]', i, axis[i])
      let labelAxis = d['label']
      if (d['ticks'].length>0) {
        let tick = d['ticks'][0]
        let relation = tick['relation']
        let ticks = that.axesObj[labelAxis]['axis_data']['ticksSortedArr']
        let direction = that.axesObj[labelAxis]['axis_data']['direction']
        if (relation === 'between' || relation=== 'from_to' || relation === 'after' || relation === 'before') {
          let range = that.getRange(labelAxis, direction, ticks, tick, relation)
          let gRect = gRoot.select('.gBackground').append('g').attr('class', 'gRectRange')
            .style('opacity', 0)
          if (direction === 0) {
            // 水平的轴上的tick
            gRect.append('rect').attr('class', 'rectRange')
              // .attr('x', range[0]).attr('y', that.mainY1)
              .attr('x', range[0]).attr('y', that.mainY2)
              // .attr('width', range[1]-range[0]).attr('height', that.mainY2 - that.mainY1)
              .attr('width', range[1]-range[0]).attr('height', 0)
              .style('stroke-width', that.widthStroke)
              .style('stroke-dasharray', that.widthStroke * 2)
              .style('fill', overlayColor)
              .transition().duration(that.duration)
              .attr('y', that.mainY1)
              .attr('height', that.mainY2 - that.mainY1)
            gRect
              .style('opacity', 0)
              .transition().duration(that.duration)
              .style('opacity', 1)

          } else {
            // 应该是direction===90, 但是默认是垂直的轴上的tick了
            gRect.append('rect').attr('class', 'rectRange')
              // .attr('x', that.mainX1).attr('y', range[0])
              .attr('x', that.mainX1).attr('y', range[0])
              // .attr('width', that.mainX2 - that.mainX1).attr('height', range[1]-range[0])
              .attr('width', 0).attr('height', range[1]-range[0])
              .style('stroke-width', that.widthStroke)
              .style('stroke-dasharray', that.widthStroke * 2)
              .style('fill', overlayColor)
              .transition().duration(that.duration)
              .attr('width', that.mainX2 - that.mainX1)
            gRect
              .style('opacity', 0)
              .transition().duration(that.duration)
              .style('opacity', 1)
          }
        } else if (relation === 'above' || relation === 'below') {
          let value = tick['values'][0]
          let result = that.getTickValue(ticks, value)
          let dString = ''
          let dStringInit = ''
          if (direction === 0) {
            dString = 'M' + result + ' ' + that.mainY1 + 'v' + (that.mainY2 - that.mainY1)
            dStringInit = 'M' + result + ' ' + that.mainY1 + 'v0'
          } else {
            dString = 'M' + that.mainX1 + ' ' + result + 'h' + (that.mainX2 - that.mainX1)
            dStringInit = 'M' + that.mainX1 + ' ' + result + 'h0'
          }
          gRoot.select('.gPathTrend').append('path').attr('class', 'lineTickValue')
            .attr('d', dStringInit)
            .style('stroke-width', that.widthStroke * 0.25)
            .style('stroke-dasharray', that.widthStroke * 2)
            .style('fill', config.lineColor)
            .transition().duration(that.duration)
            .attr('d', dString)
        }
      }
    }
  }
  showTargetArr(config, targetArr, gPath, gClipPath, gImage, gRoot, axis=null) {
    let that = this
    d3.selectAll('.gRectRange').remove()
    d3.selectAll('.lineTickValue').remove()
    gImage.classed('is-hidden', true)
    let svgImgContext = d3.select('#svg-img-context')
    let borderOpacity = 0
    let shadowOpacity = 0
    let borderColor = config.borderColor
    let shadowColor = config.shadowColor
    if (config.borderShow) {
      borderOpacity = 1
    }
    if (config.shadowShow) {
      shadowOpacity = 1
    }
    if (targetArr.length > 0) {
      // if (config.valueContextFade) {
      //   gImage
      //     .transition().duration(that.duration)
      //     .style('opacity', 0.1)
      //     // .classed('is-fade', true)
      // } else {
      //   gImage
      //     .transition().duration(that.duration)
      //     .style('opacity', 1)
      // }
      if (config.contextMode) {
        svgImgContext.attr('class', config.contextMode)
      }
      
      // 记得注释掉
      if (axis) {
        let axisFlat = axis.flat()
        that.showRange(config, axisFlat, gRoot)
      }
    } else {
      // 没有entities
      // gImage
      //   .transition().duration(that.duration)
      //   .style('opacity', 1)
        // .classed('is-fade', false)
      svgImgContext.attr('class', '')
      if (axis) {
        that.showRange(config, axis, gRoot)
      }
    }
    let data = targetArr.flatten()
    console.log('targetArr', targetArr, data)
    let gTarget = gRoot.select('.gTarget')
    let gNode = gTarget.selectAll('.g-index').data(data, function(d) {return d})
    let nodeExit = gNode.exit()
      .transition().duration(that.duration)
      .style('opacity', 0)
      .remove()
    let gNodeEnter = gNode.enter()
      .append('g').attr('class', d => 'g-index g-index-' + d)
    // gClipPath
    gNodeEnter.each(function(d) {
      let el = d3.select(this)
      let index = d
      let image = gImage.select('image').node().cloneNode()
      let target = that.imgResult[index]['mask'][0]
      let path = 'M'
      path += target.map(d => '' + d.join(' ')).join('L')
      path += 'Z'
      let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
      el.append('defs')
        .append('clipPath').attr('id', 'index-' + index) //.attr('clipPathUnits', 'objectBoundingBox')
        .append('polygon').attr('points', polygonPoints)
      let gImageForeground = el.append('g').attr('class', 'img-foreground')
      gImageForeground.style('clip-path', 'url(#index-' + index + ')')
        .style('opacity', 0)
      gImageForeground.node().appendChild(image)
      gImageForeground
        .transition().duration(that.duration)
        .style('opacity', 1)
      let ePath = el.append('path').attr('class', 'mask-path index-' + index).attr('d', path)
        .style('opacity', 0)
        .style('stroke-width', that.widthStroke * 0.5 + 'px')
      ePath.clone().lower()
          .style('opacity', 0)
          .style('stroke-width', that.widthStroke * 2 + 'px')
          .style('filter', 'url(#dropshadow)')
          .attr('class', 'stroke-background')
    })
    let gNodeUpdate = gNodeEnter.merge(gNode)
    gNodeUpdate.each(function(d) {
      let ePath = d3.select(this).select('.mask-path')
      ePath
        .transition().duration(that.duration / 2)
        .style('stroke', borderColor)
        .style('opacity', borderOpacity)
      d3.select(this).select('.stroke-background')
        // .transition().duration(that.duration / 2)
        .transition().duration(that.duration)
        // .style('stroke', ()=>{
        //   let a = borderColor.split(',')
        //   a.pop()
        //   let b = a.join(', ')
        //   return  (b + ', 1)')
        // })
        // .style('opacity', borderOpacity)
        .style('fill', shadowColor)
        .style('opacity', shadowOpacity)
    })

  }
  showTargetArr20190322(targetArr, gPath, gClipPath, gImage, gRoot, isEntity=false) {
    console.log('targetArr', targetArr)
    if (targetArr.length > 0) {
      gImage
        // .transition().duration(this.duration)
        // .style('opacity', 0)
      .classed('is-hidden', true)
      targetArr.forEach(objectIndexArr => {
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
          gPath.append('path').attr('class', 'is-hidden mask-path index-' + index).attr('d', path)
            // .style('display', 'none')
          let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
          gClipPath.append('clipPath').attr('id', 'index-' + index) //.attr('clipPathUnits', 'objectBoundingBox')
            .append('polygon').attr('points', polygonPoints)
        })
      })
      // 只显示某个区域
      // 多个clipPath

      d3.selectAll('.img-background')
        .remove()
      gImage.clone(true).attr('class', 'img-background') //.lower()
        // .style('opacity', 0)
        // .transition().duration(this.duration)
        .style('opacity', null)
      d3.selectAll('.img-foreground')
        .transition().duration(this.duration)
        .style('opacity', 0)
        .remove()
      targetArr.forEach(objectIndexArr => {
        objectIndexArr.forEach(index => {
          gRoot.selectAll('.mask-path.index-' + index)
            .classed('is-hidden', false)
            // .style('display', '')
          gImage.clone(true).attr('class', 'img-foreground').style('clip-path', 'url(#index-' + index + ')')
            // .style('opacity', 0)
            // .transition().duration(this.duration)
            .style('opacity', null)
        })
      })
      // context隐去
      // gImage
      //   .transition().duration(this.duration)
      //   .style('opacity', 0)

      // setTimeout(function () {
      //   gImage.classed('is-hidden', true)
      // }, this.duration)
    }
    else {
      if (isEntity) {
        gImage
          // .transition().duration(this.duration)
          // .style('opacity', null)
          .classed('is-hidden', false)
      }
    }
  }
  showAuxiliary () {
    let that = this
    let auxiliary = this.imgReceived['auxiliary']
    // let gRoot = this.gRoot
    let gRoot = d3.select(`${that.id} .img .gRoot .gAuxiliary`)
    gRoot.selectAll('.gPathAuxiliary').remove()
    gRoot.selectAll('.gClipPathAuxiliary').remove()
    gRoot.selectAll('.auxiliary-img-foreground').remove()
    let gPath = gRoot.append('g').attr('class', 'gPathAuxiliary')
    let gClipPath =gRoot.append('g').attr('class', 'gClipPathAuxiliary').append('defs')
    let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
      
    auxiliary.forEach((d, index) => {
      let target = d['mask'][0]
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
      gPath.append('path').attr('class', 'is-hidden mask-path auxiliary-index-' + index).attr('d', path)
        // .style('display', 'none')
      let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
      gClipPath.append('clipPath').attr('id', 'auxiliary-index-' + index) //.attr('clipPathUnits', 'objectBoundingBox')
        .append('polygon').attr('points', polygonPoints)
    })

    auxiliary.forEach((d, index) => {
      // gRoot.selectAll('.mask-path.auxiliary-index-' + index).style('display', '')
      // gImage.clone(true).attr('class', 'auxiliary-img-foreground').style('clip-path', 'url(#auxiliary-index-' + index + ')')
      let image = gImage.select('image').node().cloneNode()
      let gImageForeground = gRoot.append('g').attr('class', 'auxiliary-img-foreground')
      gImageForeground.style('clip-path', 'url(#auxiliary-index-' + index + ')')
        // .style('opacity', 0)
      gImageForeground.node().appendChild(image)
      gImageForeground
        // .transition().duration(that.duration)
        .style('opacity', 1)
    })
    // 显示主体以外的地方
    let others = [{
      id: 'top',
      points: [[0, 0], [that.mainX1, that.mainY1], [that.mainX2, that.mainY1], [that.mainX2, 0]]
    }, {
      id: 'left',
      points: [[0, 0], [0, that.heightImage], [that.mainX1, that.heightImage], [that.mainX1, 0]]
    }, {
      id: 'right',
      points: [[that.mainX2, 0], [that.mainX2, that.heightImage], [that.widthImage, that.heightImage], [that.widthImage, 0]]
    }, {
      id: 'bottom',
      points: [[0, that.mainY2], [0, that.heightImage], [that.widthImage, that.heightImage], [that.widthImage, that.mainY2]]
    }]
    others.forEach(d => {
      let target =  d['points']
      let path = 'M'
      path += target.map(d => '' + d.join(' ')).join('L')
      path += 'Z'
      // console.log('path', path)
      gPath.append('path').attr('class', 'is-hidden mask-path auxiliary-' + d['id']).attr('d', path)
      let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
      gClipPath.append('clipPath').attr('id', 'auxiliary-' + d['id']) //.attr('clipPathUnits', 'objectBoundingBox')
        .append('polygon').attr('points', polygonPoints)
      let image = gImage.select('image').node().cloneNode()
      let gImageForeground = gRoot.append('g').attr('class', 'auxiliary-img-foreground')
      gImageForeground.style('clip-path', 'url(#auxiliary-' + d['id'] + ')')
        // .style('opacity', 0)
      gImageForeground.node().appendChild(image)
      gImageForeground
        // .transition().duration(that.duration)
        .style('opacity', 1)
    })
  }
  showSentence (config) {
    console.warn('###############config', config)
    let that = this
    d3.selectAll('.gPath').remove()
    d3.selectAll('.gClipPath').remove()
    let gRoot = d3.select(`${this.id} .img .gRoot`)
    let gText = gRoot.select('.gText')
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + this.heightText + this.heightTimeline * 0.5) + 'px)')
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + this.heightText * 0.8) + 'px)')
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + this.heightText * 0.5) + 'px)')
      // .style('transform', 'translate(' + (config['textDiv']['x_center']) + 'px, ' + (config['textDiv']['y_center']) + 'px)')
      .style('display', '')
    let divTextSentence = gText.select('#text-sentence .text-sentence')
    divTextSentence.html(config.text)
      .style('font-size', (that.fontSize) + 'px')
    if (config.textFixed) {
      divTextSentence
        .transition().duration(this.duration)
        .style('width', '')
        .style('height', '')
    } else {
      divTextSentence
        .transition().duration(this.duration)
        .style('width', config['textDiv']['width'] + 'px')
        .style('height', config['textDiv']['height'] + 'px')
    }
      
    let gTextSentence = gText.select('#g-text-sentence .text-sentence')
    gTextSentence.text(config.text)
      .style('font-size', (that.fontSize) + 'px')

    let gPath = gRoot.append('g').attr('class', 'gPath')
    let gClipPath =gRoot.append('g').attr('class', 'gClipPath').append('defs')
    let gImage = d3.select(`${this.id} .img .gRoot .gImage`)

    // 显示context
    // gImage.style('opacity', null)

    // // 显示entity
    // that.showTargetArr(config.target, gPath, gClipPath, gImage, gRoot, true) 
    // // 显示label
    // that.showTargetArr(config.target4label, gPath, gClipPath, gImage, gRoot)
    // // 显示legend
    // that.showTargetArr(config.target4legend, gPath, gClipPath, gImage, gRoot)
    // 都显示
    
    // let targetArr = [...config.target, ...config.target4label, ...config.target4legend]
    let targetArr = config.targetArr
    that.showTargetArr(config, targetArr, gPath, gClipPath, gImage, gRoot, config.axis)

    d3.selectAll('.current')
      .style('r', (that.paddingPoint/5) + 'px')
      .classed('current', false)
    d3.select('.circle-point.index-' + config.index).classed('current', true)
      .style('r', (that.paddingPoint/10*3) + 'px')
    gText
      .raise()
      .style('opacity', 0)
      .transition().duration(this.duration)
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + 200 + 'px)')
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, -' + 20 + 'px)')
      .style('opacity', 1)
      // .style('transform', 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + this.heightText * 0.5) + 'px)')
      .style('transform', () => {
        if (config.textFixed) {
          return 'translate(' + (this.widthImage * 0.5) + 'px, ' + (this.heightImage + this.heightText * 0.5) + 'px)'
        } else {
          return 'translate(' + (config['textDiv']['x_center']) + 'px, ' + (config['textDiv']['y_center']) + 'px)'
        }
      })

    // setTimeout(function() {
    //   that.addPath(config.path)
    // }, this.duration)
  }
  addPath (path) {
    d3.selectAll('.gPathConnect').html('')
    d3.select('.gPathConnect').append('path')
      .attr('d', 'M' + path.x0 + ' ' + path.y0 + 'L' + path.x0 + ' ' + path.y0)
      .attr('marker-end', 'url(#triangle-path-connect)')
      .transition()
      .duration(this.duration)
      .attr('d', 'M' + path.x0 + ' ' + path.y0 + 'L' + path.x1 + ' ' + path.y1)

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
        console.warn('After:', img)
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
        console.warn('image keysObj:', this.keysObj)
        console.warn('image keysArr:', this.keysArr)
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
          width: 100,
          height: 100,
          x_center: 0,
          y_center: 0,
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
  getResult20190304 (img) {
    let that = this
    let imgResult = []
    switch (that.message) {
      case 'OD_Image':
        $(`${that.id} .img`).attr('src', `data:${img.type};base64,${img.data}`)
        break
      case 'OD_Mask':
        console.warn('After:', img)
        d3.select(`${that.id} .img`).html('')
        var i = new Image()
        i.onload = function () {
          console.warn(i.width + ', ' + i.height)
          let heightTimeline = that.heightTimeline
          let heightText = that.heightText
          that.widthImage = i.width
          that.heightImage = i.height
          console.log('%cwidthImage, heightImage', 'color: green', that.widthImage, that.heightImage, that.heightTimeline, that.heightText, that)
          d3.select(`${that.id} .img`).attr('viewBox', '0, -' + that.heightText + ',' + i.width + ',' + (i.height + that.heightTimeline + that.heightText))
          
          let gRoot = d3.select(`${that.id} .img .gRoot`)
          gRoot.selectAll('.gTimeline').remove()
          let gTimeline = gRoot.append('g').attr('class', 'gTimeline').style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, ' + (that.heightImage + that.heightTimeline * 0.5) + 'px)')
          // gTimeline.append('rect').attr('width', 100).attr('height', heightTimeline * 0.5)
          // 文本显示区域
          gRoot.selectAll('.gText').remove()
          let gText = gRoot.append('g').attr('class', 'gText')
            .style('display', 'none')
            .style('pointer-events', 'none')
            .style('transform', 'translate(' + (that.widthImage * 0.5) + 'px, -' + (that.heightText * 1) + 'px)')
          gText
            // .append('g').attr('class', '')
            .html(()=>{
              return '<switch><foreignObject id="text-sentence" x="0" y="0" width="' + (that.widthImage * 0.75) + '" height="' + (that.heightImage) + '"><div class="div-wrap"><div class="div-center"><div class="content" xmlns="http://www.w3.org/1999/xhtml"></div></div></div></foreignObject><g id="g-text-sentence" style="transform: translate(' 
              + 0 + 'px, 0px)"><text class="text-sentence" x="20" y="20">Your SVG viewer cannot display html.</text></g></switch>'
            })
          // gText.append('text').attr('class', 'text-sentence')
        }
        let src = `data:${that.imgOriginal.type};base64,${that.imgOriginal.data}`
        i.src = src
        d3.select(`${that.id} .img`).append('g').attr('class', 'gRoot').append('g').attr('class', 'gImage').append('image').attr('xlink:href', src)
        
        let keysObj = {}
        img['data'].forEach((d, i) => {
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
        that.keysObj = keysObj
        that.keysArr = Object.keys(keysObj)
        console.warn('image keysObj:', that.keysObj)
        console.warn('image keysArr:', that.keysArr)
        // 位置排序
        let l2rArr = [...imgResult].sort((a, b) => (a['position']['x'] - b['position']['x'])).map(d=>d.index)
        let t2bArr = [...imgResult].sort((a, b) => (a['position']['y'] - b['position']['y'])).map(d=>d.index)
        let s2lArr = [...imgResult].sort((a, b) => (a['size']['area'] - b['size']['area'])).map(d=>d.index)
        let ranking = {}
        ranking.l2rArr = l2rArr
        ranking.t2bArr = t2bArr
        ranking.s2lArr = s2lArr
        that.ranking = ranking
        that.imgResult = imgResult
        console.warn('imgResult:', imgResult)
        console.warn('ranking:', ranking)
        break
    }
  }
  showAuxiliary20190312 () {
    let that = this
    let auxiliary = this.imgReceived['auxiliary']
    // let gRoot = this.gRoot
    let gRoot = d3.select(`${that.id} .img .gRoot`)

    let gPath = gRoot.append('g').attr('class', 'gPathAuxiliary')
    let gClipPath =gRoot.append('g').attr('class', 'gClipPathAuxiliary').append('defs')
    let gImage = d3.select(`${this.id} .img .gRoot .gImage`)
    auxiliary.forEach((d, index) => {
      let target = d['mask'][0]
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
      gPath.append('path').attr('class', 'mask-path auxiliary-index-' + index).attr('d', path)
        .style('display', 'none')
      let polygonPoints = target.map(d => '' + d.join(' ')).join(' ')
      gClipPath.append('clipPath').attr('id', 'auxiliary-index-' + index) //.attr('clipPathUnits', 'objectBoundingBox')
        .append('polygon').attr('points', polygonPoints)
    })
    // 只显示某个区域
    // 多个clipPath
    // d3.selectAll('.auxiliary-img-background').remove()
    // gImage.clone(true).attr('class', 'auxiliary-img-background') //.lower()
    auxiliary.forEach((d, index) => {
      // gRoot.selectAll('.mask-path.auxiliary-index-' + index).style('display', '')
      gImage.clone(true).attr('class', 'auxiliary-img-foreground').style('clip-path', 'url(#auxiliary-index-' + index + ')')
    })
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
}

export default ImgViewer
