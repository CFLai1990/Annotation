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
import ImageView from 'containers/ImageView/Loadable'
import DescriptionView from 'containers/DescriptionView/Loadable'

import { Layout, Steps, Menu, Upload, Tag, Collapse, Switch, Form, Input,ColorPicker, Select } from 'element-react'
import { Button } from 'element-react'
import { Card } from 'element-react'
import { Icon } from 'element-react'
import emitter from '../../utils/events'


class HomePageBody extends React.PureComponent {
    // eslint-disable-line react/prefer-stateless-function
  constructor (props) {
    super(props)
    this.state = {
      form: null,
      contextMode: 'context-transparency',
      overlayColor: 'rgba(0, 0, 0, 0.2)',
      borderShow: false,
      borderColor: 'rgba(0, 0, 0, 0.5)',
      active: 1,
      spanImage: 22,
      spanDescription: 10,
      spanSetting: 1,
      isImageUploaded: false,
      valueContextFade: true
    }
    this.optionsImageContext = [{
      value: 'context-transparency',
      label: 'Transparency'
    }, {
      value: 'context-desaturate',
      label: 'Desaturate'
    }, {
      value: 'context-brightness',
      label: 'Brightness'
    }, {
      value: 'context-depth-of-field',
      label: 'Depth of field'
    }, {
      value: 'context-none',
      label: 'No fading effect'
    }],
    this.View_Dsp = {
      sizeRatio: {w: 0.9, h: 0.9}
    }

    this.View_Img = {
      sizeRatio: {w: 0.9, h: 0.9}
    }
    this.eventEmitter = emitter.addListener('doneOD', (message) => {
      console.log('filesocket eventEmitter', message)
      this.setState({'active': 2, 'isImageUploaded': true})
      this.setState({spanImage: 11})
    })
    this.sentenceProcessed = []
    this.eventEmitterSentence = emitter.addListener('doneNLP', (message) => {
      console.log('+++++++++++++doneNLP -> HomePage', message)
      let sentenceProcessed = message['sentences'].map(d => d['content'])
      this.sentenceProcessed = sentenceProcessed
    })
    this.eventEmitterClickSentence = emitter.addListener('clickSentence', (message) => {
      console.log('+++++++++++++clickSentence -> HomePage', message)
      d3.selectAll('.index-sentence-active').classed('index-sentence-active', false)
      d3.selectAll('.index-sentence-' + message).classed('index-sentence-active', true)
    })
  }
  changeSetting (key, value) {
    let message = [key, value]
    this.setState({[key]: value})
    emitter.emit('changeSetting', message)
  }
  clickSentence (index) {
    emitter.emit('clickSentence', index)
  }
  switchSetting () {
    if (this.state.spanImage === 22 || this.state.spanImage === 18) {
      if (this.state.spanSetting === 1) {
        this.setState({spanImage: 18, spanSetting: 4})
      } else {
        this.setState({spanImage: 22, spanSetting: 1})
      }
    }
  }
  next() {
    let active = this.state.active + 1;
    if (active > 1) {
      this.setState({spanImage: 11})
      if (active === 3) {
        emitter.emit('submitDescription', 'submitDescription')
        this.setState({spanImage: 22})
      }
      if (active > 3) {
        active = 3
      // active = 0
      // this.setState({spanImage: 22})
      }
    }
    this.setState({ active });
  }
  previous() {
    let active = this.state.active - 1;
    if (active < 3) {
      this.setState({spanImage: 11})
      if (active < 2) {
        emitter.emit('clearOD', 'clearOD')
        this.setState({spanImage: 22, 'isImageUploaded': false})
        if (active < 1) {
          active = 1
        }
      }
    }
    this.setState({ 'active': active});
  }
  onSubmit(e) {
    e.preventDefault();
  }
  render () {
    let DOM = this.sentenceProcessed.map((item, index) => (<li key={index} className={'index-sentence-' + index} onClick={() => this.clickSentence(index)}>{(index+1) + '. ' + item}</li>))
    return (
      <Row size={{'w': '100', 'h': '100'}}>
      <div style={{'width': '100%', 'height': '100%', 'display': 'flex', 'flexDirection': 'column', 'flexGrow': '1', 'border': '1px #aaa solid', 'overflow': 'hidden'}}>
        <div>
          <Menu theme="dark" defaultActive="0" className="el-menu-demo" mode="horizontal">
            <Menu.Item index="1" style={{'fontSize': '2rem', 'fontWeight': 'bold'}}>Vis Annotation</Menu.Item>
          </Menu>
        </div>
        <div style={{'position': 'relative'}}>
        
        <div style={{'width': '100%', 'transform': 'translateX(15%)', 'margin': '20px'}}>
          <Steps active={this.state.active}>
            <Steps.Step title="step 1" icon="picture"></Steps.Step>
            <Steps.Step title="step 2" icon="edit"></Steps.Step>
            <Steps.Step title="step 3" icon="upload"></Steps.Step>
          </Steps>
        </div>
        </div>
        <div className="main-container">
          <Layout.Row style={{'width': '100%', 'height': '100%'}}>
          <Layout.Col span={ 4 } offset={ 0 } style={{'position': 'absolute', 'height': '90%'}}>
              <Card className="is-transition" bodyStyle={{ padding: 0 }} style={{'overflow': 'visible', 'width': '100%', 'height': '100%', 'transform': ((this.state.spanSetting===1)?'translateX(-100%)': '')}}>
                <div className="my-scroll  d-flex flex-column" style={{'width': '100%', 'height': '100%'}}>
                {/*<div style={{'max-height': '60%'}}>
                  <Menu defaultActive="1" className="el-menu-vertical-demo">
                    <Menu.SubMenu index="1" title={<span><i className="el-icon-message"></i>导航一</span>}>
                      <div className="list-sentence inside-menu" style={{'overflow': 'auto'}}>
                        {DOM}
                      </div>
                    </Menu.SubMenu>
                  </Menu>
                </div>
                <div >
                  <Menu defaultActive="1" className="el-menu-vertical-demo">
                  <Menu.Item index="2"><i className="el-icon-setting"></i>导航二</Menu.Item>
                  </Menu>
                </div>
                <div className="d-flex flex-column">
                  <ColorPicker value='rgba(0, 0, 0, 0.2)' showAlpha></ColorPicker>
                    
                  <Select value={this.state.contextMode} onChange={(value)=>{console.log('contextMode', value)}}>
                    {
                      this.optionsImageContext.map(el => {
                        return <Select.Option key={el.value} label={el.label} value={el.value} />
                      })
                    }
                  </Select>
                  <div style={{'overflow': 'auto'}}>
                  </div>
                  </div>*/}
                  <Menu defaultOpeneds={["1", "2"]} className="el-menu-vertical-demo" model={this.state.form} labelWidth="80">
                  <Menu.SubMenu style={{'overflow': 'visible'}} index="1" title={<span><i className="el-icon-setting"></i>Style Configuration</span>}>
                      <div className="inside-menu" >
                        <Form labelPosition='top' labelWidth="" model={this.state.form} onSubmit={(e)=>{e.preventDefault()}} className="demo-form-stacked">
                          <Form.Item label="Context Fading">
                            <Select value={this.state.contextMode} onChange={(value)=>{this.changeSetting('contextMode', value)}}>
                              {
                              this.optionsImageContext.map(el => {
                                return <Select.Option key={el.value} label={el.label} value={el.value} />
                              })
                            }
                            </Select>
                          </Form.Item>
                          <Form.Item label="Overlay Rectangle Color">
                            <ColorPicker value={this.state.overlayColor} showAlpha onChange={(value)=>{this.changeSetting('overlayColor', value)}}></ColorPicker>
                          </Form.Item>
                          <Form.Item label="Show Border">
                            <Switch
                              value={this.state.borderShow}
                              onValue={true}
                              offValue={false}
                              onChange={(value)=>{this.changeSetting('borderShow', value)}}
                              >
                            </Switch>
                            <div className="inline-element mx-3" style={{'visibility': ((this.state.borderShow)?'':'hidden')}}>
                              <ColorPicker value={this.state.borderColor} showAlpha onChange={(value)=>{this.changeSetting('borderColor', value)}}></ColorPicker>
                            </div>
                          </Form.Item>
                        </Form>
                      </div>
                    </Menu.SubMenu>
                    <Menu.SubMenu index="2" title={<span><i className="el-icon-information"></i>Sentences</span>}>
                      <div className="list-sentence inside-menu" style={{'overflow': 'auto'}}>
                        {DOM}
                      </div>
                    </Menu.SubMenu>
                  
        </Menu>
                  </div>
                {/* <Collapse value={['1', '2']}> */}
                {/*<Collapse value={'1'} accordion>
                  <Collapse.Item title="Sentences" name="1">
                    {DOM}
                  </Collapse.Item>
                  <Collapse.Item title="Style Configuration" name="2">
                    <Form labelPosition='top' labelWidth="" model={this.state.form} className="demo-form-stacked">
                    <Form.Item label="Overlay Rectangle Color">
                      <ColorPicker value='rgba(0, 0, 0, 0.2)' showAlpha></ColorPicker>
                    </Form.Item>
                      <Form.Item label="Context Fading">
                        <Switch
                          value={this.state.valueContextFade}
                          onValue={true}
                          offValue={false}
                          onChange={(value)=>{this.changeSetting('valueContextFade', value)}}
                          >
                        </Switch>
                        <Select value={this.state.contextMode} onChange={(value)=>{console.log('contextMode', value)}}>
                          {
                          this.optionsImageContext.map(el => {
                            return <Select.Option key={el.value} label={el.label} value={el.value} />
                          })
                        }
                        </Select>
                      </Form.Item>

                      <Form.Item label="活动展开形式">
                      </Form.Item>
                    </Form>
                    
                  </Collapse.Item>
                  <Collapse.Item title="效率 Efficiency" name="3">
                    <div>简化流程：设计简洁直观的操作流程；</div>
                    <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
                    <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
                  </Collapse.Item>
                  <Collapse.Item title="可控 Controllability" name="4">
                    <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
                    <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
                  </Collapse.Item>
                </Collapse>*/}
              </Card>
              <div style={{'position': 'absolute', 'left': '0%', 'top': '0%', 'transform': 'translateY(-100%)', 'fontSize': '2rem', 'display': (((this.state.spanImage===22 || this.state.spanImage===18)&&(this.state.isImageUploaded))? '':'none')}} onClick={()=>{this.switchSetting()}}>
                <Tag type="gray"><i className={(this.state.spanSetting===1)?'el-icon-caret-right':'el-icon-caret-left'}></i></Tag>
              </div>
            </Layout.Col>
            <Layout.Col span={ this.state.spanSetting } offset={ 0 } style={{'opacity': '0', 'width': ((this.state.spanSetting===1)?'0%': null), 'height': '100%', 'pointerEvents': 'none'}}>
              <Card bodyStyle={{ padding: 0 }} style={{'width': '100%', 'height': '90%'}}>
                <div style={{'width': '100%', 'height': '100%'}}></div>
              </Card>
            </Layout.Col>
            <Layout.Col span={ this.state.spanImage } offset={ 1 } style={{'height': '100%'}}>
              <Card bodyStyle={{ padding: 0 }} style={{'width': '100%', 'height': '90%'}}>
                <ImageView style={{'width': '100%', 'height': '100%'}} switchView={this.state.isImageUploaded} />
              </Card>
              <div className="my-3" style={{'width': '100%', 'height': '10%'}} >
                <Button className="float-left m-3" onClick={() => this.previous()} style={{'display': (((this.state.spanImage===22)&&(this.state.isImageUploaded))? '':'none')}}>Previous</Button>
                <Button className="float-right m-3" onClick={() => this.next()} style={{'display': (((this.state.spanImage===22)&&(this.state.isImageUploaded)&&(this.state.active<3))? '':'none')}}>Next</Button>
              </div>
            </Layout.Col>
            <Layout.Col span={ this.state.spanDescription } offset={ 1 } style={{'height': '100%'}}>
              <Card 
                className="card4description"
                bodyStyle={{ padding: 0 }} style={{'width': '100%', 'height': '90%'}}
              >
                <DescriptionView style={{'width': '100%', 'height': '100%'}} />
              </Card>
              <div className="my-3" style={{'width': '100%', 'height': '10%'}} >
                <Button className="float-left m-3" onClick={() => this.previous()} style={{'display': (((this.state.spanImage===11)&&(this.state.isImageUploaded))? '':'none')}}>Previous</Button>
                <Button className="float-right m-3" onClick={() => this.next()} style={{'display': (((this.state.spanImage===11)&&(this.state.isImageUploaded))? '':'none')}}>Next</Button>
              </div>
            </Layout.Col>
          </Layout.Row>
          </div>
      </div>
      </Row>
    )
  }
}

export default HomePageBody
