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
      <div style={{'width': '100%', 'height': '100%', 'padding': '50px'}}>
        <div id='odtest' style={{'width': '100%', 'height': '100%', 'display': this.props.switchView? 'none':''}}>
          <input id='odtest-input' type='file' className='file' data-preview-file-type='text' style={{'width': '100%', 'height': '100%'}}/>
        </div>
        <div id='odresult' style={{'position': 'relative', 'width': '100%', 'height': '100%', 'display': 'none', 'display': this.props.switchView? '':'none'}}>
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
      </div>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default ImageView
