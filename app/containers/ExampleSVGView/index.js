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
import * as d3 from 'd3'
import { createSelector } from 'reselect'
import { makeSelectData } from './selectors'
import { connect } from 'react-redux'

import SVGView from 'components/SVGView/index'

import MsgBox from 'components/MsgBox'
const msg = new MsgBox('PROJECTION_VIEW')

class ExampleSVGView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  componentDidMount () {
    d3.select(this.refs.main)
      .append('circle')
      .attr('cx', 50)
      .attr('cy', 50)
      .attr('r', 5)
      .attr('fill', '#0f0')
  }

  render () {
    msg.prior('Data:').log(this.props.dataBody)
    return (<g ref='main' >
      <circle cx='25'
        cy='25'
        r='25'
        fill='#000' />
      <circle cx='75'
        cy='75'
        r='25'
        fill='#000' />
    </g>)
  }
}

const mapStateToProps = createSelector(makeSelectData(), dataBody => ({
  dataBody
}))

export default SVGView.Decorator(
  connect(mapStateToProps)(ExampleSVGView)
)
