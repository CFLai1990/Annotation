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
import io from 'socket.io-client'
import FSocket from 'utils/annotation/filesocket.js'
import Flex from 'components/Flex/index'
const ViewPort = Flex.Box.extend`
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
ViewPort.defaultProps = {
  parentSize: [0, 0], // The size of its parent node
  size: { w: 90, h: 90 }, // The size of the whole svg
  sizeRatio: { w: 0.9, h: 0.9 }, // The size ratio of the svg in its parent node
  margin: { w: 0, h: 0 } // Margin of the svg
}

const msg = new MsgBox('IMAGE_VIEW')
/* message:
  'OD_Image': get the image with masks
  'OD_Mask': get the mask parameters
*/
// const MESSAGE = 'OD_Image'
const MESSAGE = 'OD_Mask'
const VERSION = 'dl'

class DescriptionView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  componentDidMount () {
    this.initSocket()
  }

  initSocket () {
    let socket
    switch (VERSION) {
      case 'local':
        socket = io('http://localhost:2020/api/annotation')
        break
      case 'db':
        socket = io('http://192.168.10.9:2020/api/annotation')
        break
      case 'dl':
        socket = io('http://192.168.10.21:2020/api/annotation')
        break
      case 'public':
        break
    }
    this.socket = socket
    let fsocket = new FSocket(this.socket, MESSAGE)
    this.socket.on('connect', () => { fsocket.callback() })
  }

  render () {
    return (
      <ViewPort>
        <div id='odtest' style={{'width': '80%', 'height': '80%'}}>
          <input id='odtest-input' type='file' className='file' data-preview-file-type='text' />
        </div>
        <div id='odresult' style={{'width': '80%', 'height': '80%', 'display': 'none'}}>
          {((message) => {
            switch (message) {
              case 'OD_Image':
                return <img className='img' style={{'maxWidth': '100%', 'maxHeight': '100%'}} />
              case 'OD_Mask':
                return <svg className='img' style={{'width': '100%', 'height': '100%'}} />
            }
          })(MESSAGE)}
        </div>
      </ViewPort>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default View.Decorator(
  connect(mapStateToProps)(DescriptionView)
)
