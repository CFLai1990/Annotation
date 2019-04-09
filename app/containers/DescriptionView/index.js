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

import $ from 'jquery'
import React from 'react'
import { createSelector } from 'reselect'
import { makeSelectData } from './selectors'
import { connect } from 'react-redux'

import View from 'components/View/index'

import MsgBox from 'components/MsgBox'
import Flex from 'components/Flex/index'
import emitter from '../../utils/events'
import ClientIO from 'utils/annotation/csocketio.js'
import MSocket from 'utils/annotation/msgsocket.js'
import { Button } from 'element-react'


const msg = new MsgBox('DESCRIPTION_VIEW')
// const annyang = window.annyang
const MESSAGE = 'NLP'
const MACHINE = 'dl'

class DescriptionView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    this.state = {
      valueText: ''
    }
    this.initSocket()

  }
  handleSubmit (message) {
    console.log('DescriptionView handleSubmit', message)
    emitter.emit('doneDescription', message);
  }
  initSocket () {
    let that = this
    /* message:
      'NLP': get the nlp result of the text
    */
    const MESSAGE = 'NLP'
    const MACHINE = 'dl'
    // const VERSION = 'dev'
    const VERSION = 'public'
    this.socket = new ClientIO({
      'address': MACHINE,
      'port': VERSION === 'dev' ? 2018 : 2019,
      'namespace': 'api/annotation'
    })
    this.msocket = new MSocket(this.socket, MESSAGE)
    this.socket.on('connect', () => {
      // add more callbacks if necessary
      this.msocket.onConnect()
    })
    this.eventEmitter = emitter.addListener('doneOD', (message) => {
      console.log('filesocket eventEmitter', message)
      that.dataFromOD = message
      that.msocket.sendDataFromOD(that.dataFromOD)
    })
  }
  handleChange (event) {
    // console.log('event', event)
    this.setState({valueText: event.target.value})
  }

  initSpeechRecognition () {
    this.paragraph = ''
    this.description = ''
    this.dspText = $('#nlptest .content')
    const SphRcg = window.SpeechRecognition || window.webkitSpeechRecognition
    const sphRcg = new SphRcg()
    sphRcg.interimResults = true
    sphRcg.lang = 'en-US'
    sphRcg.addEventListener('result', (event) => {
      const result = event.results
      const transcript = Array.from(result)
        .map(rst => rst[0])
        .map(rst => rst.transcript)
        .join('')
      this.paragraph = transcript
      if (result[0].isFinal) {
        this.description += `${this.paragraph} `
        this.paragraph = ''
      }
      this.dspText.val(this.description + this.paragraph)
    })
    sphRcg.addEventListener('end', sphRcg.start)
    sphRcg.start()
    this.sphRcg = sphRcg
  }

  componentDidMount () {
    // this.initSpeechRecognition()
    /*    if (annyang) {
          let commands = {
            'hello': function () {
              msg.log('Hello world!')
            }
          }
          // Add our commands to annyang
          annyang.addCommands(commands)
          // Start listening. You can call this here, or attach this call to an event, button, etc.
          annyang.start()
        } */
    this.eventEmitter = emitter.addListener('doneNLP', (message) => {
      console.log('DescriptionView eventEmitter', message)
      console.log('this.fsocket', this.fsocket)

      if (this.msocket.data) {
        // if (message.search(/dog/i) >=0) {
        //   console.log('this.fsocket.handleShow dog')
        //   this.fsocket.handleShow('dog')
        // } else if (message.search(/cat/i) >= 0) {
        //   console.log('this.fsocket.handleShow cat')
        //   this.fsocket.handleShow('cat')
        // }
        this.handleSubmit (message)

      } else {
        alert('NLP error!')
      }
      
    })
  }

  render () {
    return (
      <div id='nlptest' style={{'width': '100%', 'height': '100%', 'padding': '5%'}}>
        <div style={{'width': '100%', 'height': '100%'}}>
          <div className="my-3">
            <h3>Please input a description:</h3>
          </div>
          <textarea id="nlptest-input" className='content my-3' spellCheck='false' style={{'width': '100%', 'height': '90%', 'border': '1px #ddd solid', 'fontSize': '1.65rem'}} value={this.state.valueText} onChange={this.handleChange.bind(this)} />
            {/* <button type="button" id="nlptest-submit" className="btn btn-primary" onClick={this.handleSubmit.bind(this, this.state.valueText)}>OK</button> */}
            {/* <button type="button" id="nlptest-submit" className="btn btn-primary">OK</button>*/}
            {/*<Button type="primary" id="nlptest-submit">OK</Button>*/}
        </div>
      </div>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default DescriptionView
