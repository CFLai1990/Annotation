function setTextPosition (highlightedData, rawLayoutData, highlightIndex) {
  let tmpRectData = rawLayoutData['data']
  tmpRectData = tmpRectData // .filter((d)=>(d.class=='rectangle'))
  let data = []
  for (let i = 0; i < tmpRectData.length; i++) {
    data.push({
      bbox: {
        x: +tmpRectData[i].bbox.x,
        y: +tmpRectData[i].bbox.y,
        width: +tmpRectData[i].bbox.width,
        height: +tmpRectData[i].bbox.height
      }
    })
  }

  // let C = 20
  let C = Math.max(highlightedData['mainX2'] - highlightedData['mainX1'], highlightedData['mainY2'] - highlightedData['mainY1']) * 0.022
  let sentenceRegion = {x: 200, y: 100}
  // let annotationText = 'anofi ivn3ir vmo3pr n0vior23 vrio2 vnior noc3'
  let annotationText = highlightedData['sentences'][highlightIndex]['content']
  // let boxAspectRatios = [1/4, (Math.sqrt(5) - 1) / 2, 1/3, 1/4, (Math.sqrt(5) + 1) / 2]
  // 20190916
  let boxAspectRatios = [(Math.sqrt(5) - 1) / 2, 1/3, (Math.sqrt(5) + 1) / 2, 1/4, 3]
  // let fontSize = '38px'
  for (let aspectIndex = 0; aspectIndex < boxAspectRatios.length; aspectIndex++) {
    let boxAspectRatio = boxAspectRatios[aspectIndex]
    let fontSize = highlightedData['fontSize']
    let annotationHeight = getAnnotationSize(annotationText, fontSize) // 默认宽度200
    // console.log('annotation text height:', annotationHeight)
    // let annotationWidth = Math.floor( Math.sqrt( 200 * annotationHeight * (Math.sqrt(5)+1) / 2 ) )
    let annotationWidth = Math.floor( Math.sqrt( 200 * annotationHeight / boxAspectRatio ) )
    annotationHeight = getAnnotationSize(annotationText, fontSize, annotationWidth)
    // console.log('annotationWidth:', annotationWidth)
    // console.log('annotation text height:', annotationHeight)
    sentenceRegion.x = annotationWidth
    sentenceRegion.y = annotationHeight

    let result = setTextPositionWithTextSize(highlightedData, rawLayoutData, highlightIndex, sentenceRegion, C, data)
    // console.log("result", result)
    if (result.x_center != null && result.y_center != null) {
      return result
    }
  }
  return null

  function getAnnotationSize (annotationText, fontSize, textWidth = 200) {
    let annotationDiv = document.getElementById('annotation-size-div')
    if (annotationDiv == null) {
        annotationDiv = document.createElement('div')
        annotationDiv.id = 'annotation-size-div'
        annotationDiv.style.visibility = 'hidden'
        annotationDiv.style.whiteSpace = 'break-word'
        document.body.appendChild(annotationDiv)
    } else {
        annotationDiv.style.display = 'inline-block'
    }
    annotationDiv.style.fontSize = fontSize
    annotationDiv.style.width = textWidth + 'px'
    annotationDiv.innerText = annotationText
    let textHeight = parseFloat( window.getComputedStyle( document.getElementById('annotation-size-div') ).height )
    annotationDiv.style.display = 'none'
    return textHeight
  }
}

function setTextPositionWithTextSize (highlightedData, rawLayoutData, highlightIndex, sentenceRegion, C, data) {
  let highlightedBars = highlightedData.objects[highlightIndex]
  let mainX1 = highlightedData['mainX1']
  let mainX2 = highlightedData['mainX2']
  let mainY1 = highlightedData['mainY1']
  let mainY2 = highlightedData['mainY2']

  let forceCenter = {
    x: 0,
    y: 0
  }
  for (let i = 0; i < highlightedBars.length; i++) {
    forceCenter.x += data[ highlightedBars[i] ].bbox.x + data[ highlightedBars[i] ].bbox.width / 2
    forceCenter.y += data[ highlightedBars[i] ].bbox.y + data[ highlightedBars[i] ].bbox.height / 2
  }
  forceCenter.x /= highlightedBars.length;
  forceCenter.y /= highlightedBars.length;
  // console.log('forceCenter.x', forceCenter.x)
  // console.log('forceCenter.y', forceCenter.y)

  // -----------------------
  // -----------------------
  let newData = []
  for (let i = 0; i < data.length; i++) {
    // let bboxX = Math.max(data[i].bbox.x - C - sentenceRegion.x / 2, mainX1)
    // let bboxY = Math.max(data[i].bbox.y - C - sentenceRegion.y / 2, mainY1)
    // let bboxWidth = Math.min( data[i].bbox.x + data[i].bbox.width + C + sentenceRegion.x / 2, mainX2 ) - bboxX
    // let bboxHeight = Math.min( data[i].bbox.y + data[i].bbox.height + C + sentenceRegion.y / 2, mainY2 ) - bboxY
    let bboxX = Math.max(data[i].bbox.x - C - sentenceRegion.x / 2, mainX1 + C + sentenceRegion.x / 2)
    let bboxY = Math.max(data[i].bbox.y - C - sentenceRegion.y / 2, mainY1 + C + sentenceRegion.y / 2)
    let bboxWidth = Math.min( data[i].bbox.x + data[i].bbox.width + C + sentenceRegion.x / 2, mainX2 - C - sentenceRegion.x / 2 ) - bboxX
    let bboxHeight = Math.min( data[i].bbox.y + data[i].bbox.height + C + sentenceRegion.y / 2, mainY2 - C - sentenceRegion.y / 2 ) - bboxY
    // 20190916 有可能是负值
    bboxWidth = Math.max(0, bboxWidth)
    bboxHeight = Math.max(0, bboxHeight)
    let tmpItem = {
      bbox: {
        x: bboxX,
        y: bboxY,
        width: bboxWidth,
        height: bboxHeight
      }
    }
    newData.push(tmpItem)
  }

  // todo: 201903301450
  // legend的位置
  let tmpLegendRect = rawLayoutData['auxiliary']
  tmpLegendRect = tmpLegendRect.filter((d)=>(d.class=='legend'))
  let legendPos = []
  for (let i = 0; i < tmpLegendRect.length; i++) {
    let bboxX = Math.max(tmpLegendRect[i].bbox.x - C - sentenceRegion.x / 2, mainX1 + C + sentenceRegion.x / 2)
    let bboxY = Math.max(tmpLegendRect[i].bbox.y - C - sentenceRegion.y / 2, mainY1 + C + sentenceRegion.y / 2)
    let bboxWidth = Math.min( tmpLegendRect[i].bbox.x + tmpLegendRect[i].bbox.width + C + sentenceRegion.x / 2, mainX2 - C - sentenceRegion.x / 2 ) - bboxX
    let bboxHeight = Math.min( tmpLegendRect[i].bbox.y + tmpLegendRect[i].bbox.height + C + sentenceRegion.y / 2, mainY2 - C - sentenceRegion.y / 2 ) - bboxY
    // 20190916 有可能是负值
    bboxWidth = Math.max(0, bboxWidth)
    bboxHeight = Math.max(0, bboxHeight)
    let tmpItem = {
      bbox: {
        x: bboxX,
        y: bboxY,
        width: bboxWidth,
        height: bboxHeight
      }
    }
    legendPos.push(tmpItem)
  }

  // console.log('newData', newData)

  let discretList = []
  let discretXList = []
  let discretYList = []
  for (let i = 0; i < highlightedBars.length; i++) {
    discretList.push( {
      xraw1: newData[ highlightedBars[i] ].bbox.x,
      xraw2: newData[ highlightedBars[i] ].bbox.x + newData[ highlightedBars[i] ].bbox.width,
      yraw1: newData[ highlightedBars[i] ].bbox.y,
      yraw2: newData[ highlightedBars[i] ].bbox.y + newData[ highlightedBars[i] ].bbox.height
    } )
    discretXList.push( {
      xraw: newData[ highlightedBars[i] ].bbox.x,
      xpos: 1,
      barIndex: i,
      role: 'content'
    } )
    discretXList.push( {
      xraw: newData[ highlightedBars[i] ].bbox.x + newData[ highlightedBars[i] ].bbox.width,
      xpos: 2,
      barIndex: i,
      role: 'content'
    } )
    discretYList.push( {
      yraw: newData[ highlightedBars[i] ].bbox.y,
      ypos: 1,
      barIndex: i,
      role: 'content'
    } )
    discretYList.push( {
      yraw: newData[ highlightedBars[i] ].bbox.y + newData[ highlightedBars[i] ].bbox.height,
      ypos: 2,
      barIndex: i,
      role: 'content'
    } )
  }
  for (let i = 0; i < legendPos.length; i++) {
    discretList.push( {
      xraw1: legendPos[ i ].bbox.x,
      xraw2: legendPos[ i ].bbox.x + legendPos[ i ].bbox.width,
      yraw1: legendPos[ i ].bbox.y,
      yraw2: legendPos[ i ].bbox.y + legendPos[ i ].bbox.height
    } )
    discretXList.push( {
      xraw: legendPos[ i ].bbox.x,
      xpos: 1,
      barIndex: highlightedBars.length + i,
      role: 'content'
    } )
    discretXList.push( {
      xraw: legendPos[ i ].bbox.x + legendPos[ i ].bbox.width,
      xpos: 2,
      barIndex: highlightedBars.length + i,
      role: 'content'
    } )
    discretYList.push( {
      yraw: legendPos[ i ].bbox.y,
      ypos: 1,
      barIndex: highlightedBars.length + i,
      role: 'content'
    } )
    discretYList.push( {
      yraw: legendPos[ i ].bbox.y + legendPos[ i ].bbox.height,
      ypos: 2,
      barIndex: highlightedBars.length + i,
      role: 'content'
    } )
  }
  discretXList.push( {
    xraw: mainX1 + C + sentenceRegion.x / 2,
    role: 'boundary'
  } )
  discretXList.push( {
    xraw: mainX2 - C - sentenceRegion.x / 2,
    role: 'boundary'
  } )
  discretYList.push( {
    yraw: mainY1 + C + sentenceRegion.y / 2,
    role: 'boundary'
  } )
  discretYList.push( {
    yraw: mainY2 - C - sentenceRegion.y / 2,
    role: 'boundary'
  } )

  // 计算横坐标顺序
  discretXList.sort((a,b)=>a.xraw-b.xraw)
  // console.log('discretXList', discretXList)
  let xOrder = 0
  let xOrder2xRaw = [discretXList[0].xraw] // 写成YList
  for (let i = 0; i < discretXList.length; i++) {
    if (i > 0 && Math.abs(discretXList[i].xraw - discretXList[i-1].xraw) > 1e-7) {
      xOrder += 1
      xOrder2xRaw.push(discretXList[i].xraw)
    }
    if (discretXList[i].role == 'content') {
      discretList[ discretXList[i].barIndex ]['x' + discretXList[i].xpos + 'Order'] = xOrder
    }
  }
  // console.log('max xorder:', xOrder)
  // console.log('xOrder2xRaw:', xOrder2xRaw)

  // 计算纵坐标顺序
  discretYList.sort((a,b)=>a.yraw-b.yraw)
  // console.log('discretYList', discretYList)
  let yOrder = 0
  let yOrder2yRaw = [discretYList[0].yraw]
  for (let i = 0; i < discretYList.length; i++) {
    if (i > 0 && Math.abs(discretYList[i].yraw - discretYList[i-1].yraw) > 1e-7) {
      yOrder += 1
      yOrder2yRaw.push(discretYList[i].yraw)
    }
    if (discretYList[i].role == 'content') {
      discretList[ discretYList[i].barIndex ]['y' + discretYList[i].ypos + 'Order'] = yOrder
    }
  }
  // console.log('max yorder:', yOrder)
  // console.log('yOrder2yRaw:', yOrder2yRaw)

  // console.log('discretList', discretList)

  // 计算哪些矩形没有被覆盖
  let discreMatrix = []
  for (let i = 0; i < yOrder; i++) {
    let rowVec = []
    for (let j = 0; j < xOrder; j++) {
      rowVec.push(0)
    }
    discreMatrix.push(rowVec)
  }
  // console.log('raw discreMatrix', discreMatrix)
  for (let i = 0; i < discretList.length; i++) {
    let x1Order = discretList[i].x1Order
    let x2Order = discretList[i].x2Order
    let y1Order = discretList[i].y1Order
    let y2Order = discretList[i].y2Order
    // console.log('order:', x1Order, x2Order, y1Order, y2Order)
    for (let j = y1Order; j < y2Order; j++) { // 之前是let j = x1Order; j < y2Order; j++
      for (let k = x1Order; k < x2Order; k++) { // 之前是let k = y1Order; k < x2Order; k++
        discreMatrix[j][k] = 1
      }
    }
  }
  // console.log('discreMatrix', discreMatrix)


  // 计算矩形到圆心的最近位置
  let minPosX = null
  let minPosY = null
  let minDist = (mainX2 - mainX1) * (mainX2 - mainX1)
              + (mainY2 - mainY1) * (mainY2 - mainY1)
  let isInner = false
  for (let i = 0; i < yOrder2yRaw.length - 1; i++) {
    if (isInner) {
      break
    }
    for (let j = 0; j < xOrder2xRaw.length - 1; j++) {
      if (discreMatrix[i][j] == 0) {
        let bboxX1 = xOrder2xRaw[j]
        let bboxX2 = xOrder2xRaw[j+1]
        let bboxY1 = yOrder2yRaw[i]
        let bboxY2 = yOrder2yRaw[i+1]
        let tangentable = false
        if (bboxX1 <= forceCenter.x && forceCenter.x <= bboxX2 && bboxY1 <= forceCenter.y && forceCenter.y <= bboxY2) {
          minDist = 0
          minPosX = forceCenter.x
          minPosY = forceCenter.y
          isInner = true
          break
        }
        if (bboxX1 <= forceCenter.x && forceCenter.x <= bboxX2) {
          tangentable = true
          // 上边
          let tmpDist = Math.abs( bboxY1 - forceCenter.y )
          if (tmpDist < minDist) {
            minDist = tmpDist
            minPosX = forceCenter.x
            minPosY = bboxY1
          }
          // 下边
          tmpDist = Math.abs( bboxY2 - forceCenter.y )
          if (tmpDist < minDist) {
            minDist = tmpDist
            minPosX = forceCenter.x
            minPosY = bboxY2
          }
        }
        if (bboxY1 <= forceCenter.y && forceCenter.y <= bboxY2) {
          tangentable = true
          // 左边
          let tmpDist = Math.abs( bboxX1 - forceCenter.x)
          if (tmpDist < minDist) {
            minDist = tmpDist
            minPosX = bboxX1
            minPosY = forceCenter.y
          }
          // 右边
          tmpDist = Math.abs( bboxX2 - forceCenter.x)
          if (tmpDist < minDist) {
            minDist = tmpDist
            minPosX = bboxX2
            minPosY = forceCenter.y
          }
        }
        if (!tangentable) {
          let xList = [bboxX1, bboxX2]
          let yList = [bboxY1, bboxY2]
          for (let indexX = 0; indexX <= 1; indexX++) {
            for (let indexY = 0; indexY <= 1; indexY++) {
              let tmpDist = Math.sqrt( (xList[indexX] - forceCenter.x) * (xList[indexX] - forceCenter.x) + (yList[indexY] - forceCenter.y) * (yList[indexY] - forceCenter.y) )
              if (tmpDist < minDist) {
                minDist = tmpDist
                minPosX = xList[indexX]
                minPosY = yList[indexY]
              }
            }
          }

        }
      }
    }
  }

  // console.log('isInner', isInner)
  // console.log('minPosX', minPosX)
  // console.log('minPosY', minPosY)
  // console.log('minDist', minDist)

  let createSVG = false
  if (createSVG && minPosX != null) {
    let width = mainX2 + 100
    let height = mainY2 + 100
    var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', 
              'translate(' + 0 + ',' + 0 + ')')

    // append the rectangles for the bar chart
    svg.selectAll('.no-highlighted-bar')
        .data(data)
      .enter().append('rect')
        .attr('class', 'no-highlighted-bar')
        .attr('x', function(d) { return d.bbox.x; })
        .attr('width', d=>d.bbox.width)
        .attr('y', function(d) { return d.bbox.y; })
        .attr('height', function(d) { return d.bbox.height; })

    // svg.selectAll('.highlighted-bar')
    //     .data(highlightedBars)
    //   .enter().append('rect')
    //     .attr('class', 'highlighted-bar')
    //     .attr('x', function (d) { return data[d].bbox.x  - C - sentenceRegion.x / 2})
    //     .attr('width', d => data[d].bbox.width + 2 * C + sentenceRegion.x)
    //     .attr('y', function (d) { return data[d].bbox.y - C - sentenceRegion.y / 2 })
    //     .attr('height', function (d) { return data[d].bbox.height + 2 * C + sentenceRegion.y })

    svg.selectAll('.highlighted-bar')
        .data(highlightedBars)
      .enter().append('rect')
        .attr('class', 'highlighted-bar')
        .attr('x', function (d) { return data[d].bbox.x })
        .attr('width', d => data[d].bbox.width )
        .attr('y', function (d) { return data[d].bbox.y })
        .attr('height', function (d) { return data[d].bbox.height })

    for (let i = 0; i < yOrder2yRaw.length - 1; i++) {
      for (let j = 0; j < xOrder2xRaw.length - 1; j++) {
        svg.append('rect')
          .attr('class', discreMatrix[i][j] == 0 ? 'test-matrix-empty' : 'test-matrix-nonempty')
          .attr('x', xOrder2xRaw[j] + 1)
          .attr('y', yOrder2yRaw[i] + 1)
          .attr('width', xOrder2xRaw[j + 1] - xOrder2xRaw[j] - 2)
          .attr('height', yOrder2yRaw[i + 1] - yOrder2yRaw[i] - 2)
      }
    }

    svg.append('rect')
      .attr('x', minPosX - sentenceRegion.x / 2)
      .attr('y', minPosY - sentenceRegion.y / 2)
      .attr('width', sentenceRegion.x)
      .attr('height', sentenceRegion.y)
      .attr('class', 'an-box')

    svg.append('circle')
      .attr('cx', forceCenter.x)
      .attr('cy', forceCenter.y)
      .attr('r', 20)
      .attr('class', 'force-center')

    svg.append('circle')
      .attr('cx', minPosX)
      .attr('cy', minPosY)
      .attr('r', 20)
      .attr('class', 'force-center')

  }

  return {width: sentenceRegion.x, height: sentenceRegion.y, x_center: minPosX, y_center: minPosY}
}

export default setTextPosition