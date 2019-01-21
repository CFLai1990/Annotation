/*
 * DropDown
 *
 * This is a dropdown component.
 */

import React, { PropTypes } from 'react'
import { MenuItem, NavDropdown } from 'react-bootstrap'

class DropDown extends React.PureComponent {
  constructor (props) {
    super(props)
  }
  render () {
    return (
      <NavDropdown
        title={this.props.title}
        id='basic-nav-dropdown'
        onSelect={this.props.onSelect.bind(this)}
        activeKey={this.props.activeKey}
      >
        {this.props.options.map(opt => (
          <MenuItem eventKey={opt.event} key={opt.key}> {opt.description} </MenuItem>
        ))}
      </NavDropdown>
    )
  }
}

DropDown.propTypes = {
  title: PropTypes.string,
  options: PropTypes.array,
  activeKey: PropTypes.string,
  onSelect: PropTypes.func
}

export default DropDown
