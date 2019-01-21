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
import * as THREE from 'three'

import { CanvasView, Canvas } from 'components/CanvasView/index'

import MsgBox from 'components/MsgBox'
const msg = new MsgBox('TEST_VIEW')

class ExampleCanvasView extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    // Resize the canvas to fit the window
    window.addEventListener('resize', () => {
      props.resize(this.canvas)
    })
  }
  componentDidMount () {
    let { w: width, h: height } = this.props.viewBox
    let scene = new THREE.Scene()
    let camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000)
    let renderer = new THREE.WebGLRenderer({canvas: this.canvas})
    renderer.setClearColor(new THREE.Color(1, 1, 1))
    let material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0),
      opacity: 0.3,
      transparent: true,
      wireframe: true
    })
    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let cube = new THREE.Mesh(geometry, material)
    geometry = new THREE.SphereGeometry(Math.sqrt(3) / 2, 60, 60)
    material.wireframe = false
    let circle = new THREE.Mesh(geometry, material)
    scene.add(cube, circle)
    camera.position.z = 5
    let animate = function () {
      requestAnimationFrame(animate)
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      renderer.render(scene, camera)
    }
    animate()
  }
  render () {
    return (<Canvas
      innerRef={canvas => { this.canvas = canvas }}
      width={this.props.viewBox.w}
      height={this.props.viewBox.h}
      {...this.props}
      />
    )
  }
}

export default CanvasView.Decorator(ExampleCanvasView)
