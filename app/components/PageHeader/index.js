/*
* Header
*
* This is the Header component.
*/

import React from 'react'
import { Nav, Navbar } from 'react-bootstrap'
import PropTypes from 'prop-types'
import LanguageChanger from 'containers/LanguageChanger/Loadable'
import DataLoader from 'containers/DataLoader/Loadable'

class PageHeader extends React.PureComponent {
  render () {
    return (
      <Navbar inverse collapseOnSelect fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='#'>{this.props.title}</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            {this.props.language ? <LanguageChanger locale /> : <div />}
            {this.props.data ? <DataLoader dataSelection /> : <div />}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired
}

export default PageHeader
