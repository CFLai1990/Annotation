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
import styled from 'styled-components'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

import Flex from 'components/Flex/index'
import { Page, Header, Body, Row, Col } from 'components/Page/index'
import View from 'components/View/index'
import SVGView from 'components/SVGView/index'
import { CanvasView, Canvas } from 'components/CanvasView/index'
import ExampleSVGView from 'containers/ExampleSVGView/Loadable'
import ExampleCanvasView from 'containers/ExampleCanvasView/Loadable'

class HomePageHeader extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
  render () {
    return (
      <Header title={this.props.intl.formatMessage({ id: 'app.components.title' })} language data />
    )
  }
}

HomePageHeader.propTypes = {
  intl: intlShape.isRequired
}

class HomePageBody extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    // Row 1
    this.R1 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.6) // The real (vw, vh)
    this.R1_View1 = this.R1.child(0.4, 1.0)
    this.R1_View1_SVG = {
      sizeRatio: {w: 0.8, h: 0.8}
    }
    this.R1_C2 = this.R1.child(0.4, 1.0)
    this.R1_C2_View1 = this.R1_C2.child(1.0, 0.4)
    this.R1_C2_View2 = this.R1_C2.child(1.0, 0.6)
    this.R1_View3 = this.R1.child(0.2, 1.0)
    this.R1_View3_Canvas = {
      sizeRatio: {w: 0.8, h: 0.8},
      viewBox: {w: 1000, h: 1000}
    }
    // Row 2
    this.R2 = new Flex.Unit(Body.style.viewWidth, Body.style.viewHeight * 0.4) // The real (vw, vh)
    this.R2_View1 = this.R2.child(1.0, 1.0)
  }
  render () {
    return (
      <Body>
        <Row size={this.R1.size}>
          <ExampleSVGView size={this.R1_View1.size} inner={this.R1_View1_SVG} />
          <Col size={this.R1_C2.size}>
            <View size={this.R1_C2_View1.size} />
            <View size={this.R1_C2_View2.size} />
          </Col>
          <ExampleCanvasView size={this.R1_View3.size} inner={this.R1_View3_Canvas} />
        </Row>
        <Row size={this.R2.size}>
          <View size={this.R2_View1.size} />
        </Row>
      </Body>
    )
  }
}

export default Page(injectIntl(HomePageHeader), HomePageBody)
