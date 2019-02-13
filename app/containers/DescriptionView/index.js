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
const DspDiv = Flex.Box.extend`
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
DspDiv.defaultProps = {
  parentSize: [0, 0], // The size of its parent node
  size: { w: 90, h: 90 }, // The size ratio of the whole viewpoint
  margin: { w: 0, h: 0 } // Margin of the viewpoint
}

const msg = new MsgBox('DESCRIPTION_VIEW')
// const annyang = window.annyang

class DescriptionView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    let sizeRatio = props.inner.sizeRatio
    props.inner.size = { w: sizeRatio.w * 100, h: sizeRatio.h * 100 }
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
  }

  render () {
    return (
      <DspDiv parentSize={this.props.parentSize} {...this.props.inner} id='nlptest' >
        <h1>Please input a description:</h1>
        <textarea className='content' style={{'width': '100%', 'border': '1px #aaa solid'}} />
      </DspDiv>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default View.Decorator(
  connect(mapStateToProps)(DescriptionView)
)
