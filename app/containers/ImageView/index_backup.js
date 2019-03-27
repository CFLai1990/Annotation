/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react'
import { createSelector } from 'reselect'
import { makeSelectData } from './selectors'
import { connect } from 'react-redux'

import View from 'components/View/index'

import MsgBox from 'components/MsgBox'
import ClientIO from 'utils/annotation/csocketio.js'
import FSocket from 'utils/annotation/filesocket.js'
import Flex from 'components/Flex/index'
import emitter from '../../utils/events'

const ImgDiv = Flex.Box.extend`
    width: ${props =>
        Flex.width(props.size, props.margin, props.parentSize)}vw;
    height: ${props =>
        Flex.height(props.size, props.margin, props.parentSize)}vh;
    min-width: ${props =>
        Flex.minWidth(props.size, props.margin, props.parentSize)};
    min-height: ${props =>
        Flex.minHeight(props.size, props.margin, props.parentSize)};
    background: ${props => props.background};
    margin: ${props => props.margin.h + 'vh ' + props.margin.w + 'vw'};
`
ImgDiv.defaultProps = {
  parentSize: [0, 0], // The size of its parent node
  size: { w: 90, h: 90 }, // The size ratio of the whole viewpoint
  margin: { w: 0, h: 0 } // Margin of the viewpoint
}

const msg = new MsgBox('IMAGE_VIEW')
/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
  'OD_Demo': 用于测试饼图。详见label_recognition.text
*/
// const MESSAGE = 'OD_Image'
// const MESSAGE = 'OD_Mask'
const MESSAGE = 'OD_Demo'

const MACHINE = 'dl'

class ImageView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    let sizeRatio = props.inner.sizeRatio
    props.inner.size = { w: sizeRatio.w * 100, h: sizeRatio.h * 100 }
  }

  componentDidMount () {
    this.initSocket()
    this.eventEmitter = emitter.addListener('doneDescription', (message) => {
      console.log('ImageView eventEmitter', message)
      console.log('this.fsocket', this.fsocket)
      if (this.fsocket.data) {
        // if (message.search(/dog/i) >=0) {
        //   console.log('this.fsocket.handleShow dog')
        //   this.fsocket.handleShow('dog')
        // } else if (message.search(/cat/i) >= 0) {
        //   console.log('this.fsocket.handleShow cat')
        //   this.fsocket.handleShow('cat')
        // }
        // this.fsocket.handleShowAuto(message)
        this.fsocket.handleShowSentences(message)
      } else {
        alert('Please upload an image file first!')
      }
      
    })
  }

  initSocket () {
    this.socket = new ClientIO({
      'address': MACHINE,
      'port': 2020,
      'namespace': 'api/annotation'
    })
    this.fsocket = new FSocket(this.socket, MESSAGE)
    this.socket.on('connect', () => {
      // add more callbacks if necessary
      this.fsocket.onConnect()
    })
  }

  render () {
    return (
      <ImgDiv parentSize={this.props.parentSize} {...this.props.inner} style={{'overflow': 'hidden'}}>
        <div id='odtest' style={{'width': '100%', 'height': '100%'}}>
          <input id='odtest-input' type='file' className='file' data-preview-file-type='text' />
        </div>
        <div id='odresult' style={{'position': 'relative', 'width': '100%', 'height': '100%', 'display': 'none'}}>
          {((message) => {
            switch (message) {
              case 'OD_Image':
                return <img className='img' style={{'maxWidth': '100%', 'maxHeight': '100%'}} />
              case 'OD_Mask':
              case 'OD_Demo':
                return <svg className='img' style={{'width': '100%', 'height': '100%', 'position': 'absolute', 'top': '0px', 'left': '0px'}} />
            }
          })(MESSAGE)}
        </div>
      </ImgDiv>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default View.Decorator(
  connect(mapStateToProps)(ImageView)
)
