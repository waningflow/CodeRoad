import React, { Component } from 'react'
import axios from 'axios'
import ChartController from './Chart'
import './CodeRoadView.css'
import Switch from '@material-ui/core/Switch'
import LockIcon from '@material-ui/icons/Lock'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import AceEditor from 'react-ace'
import Resizable from 're-resizable'
import IconButton from '@material-ui/core/IconButton'
import Input from '@material-ui/core/Input'
import TextField from '@material-ui/core/TextField'
import InputBase from '@material-ui/core/InputBase'
import Tooltip from '@material-ui/core/Tooltip'

import NumInput from '../../components/NumInput'

import 'brace/mode/javascript'
import 'brace/theme/monokai'

export default class CodeRoadView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      dirTree: {},
      depCruise: {},
      showCodeboard: false,
      editorNodePath: '',
      editorNodeContent: '',
      startFileLocked: false,
      startFileLockPath: '',
      editorWidth: window.innerWidth * 0.4,
      depLevel: 3,
      showDependent: false
    }

    this.fileContent = {}

    this.containerSvg
    this.initData()

    this.chartCtrller = null
  }

  componentDidMount() {}

  componentDidUpdate() {
    const { dirTree, depCruise } = this.state
    if (!this.chartCtrller && this.svg && this.containerSvg) {
      let size = this.containerSvg.getBoundingClientRect()
      this.chartCtrller = new ChartController({
        domsvg: this.svg,
        dirTree: dirTree,
        depCruise: depCruise,
        size: size,
        depLevel: 3
      })
      this.chartCtrller.initCollapseClusterChart()
      this.chartCtrller.onEvent('clickNode', this.handleClickNode.bind(this))
    }
  }

  async handleClickNode(params) {
    const { clickNode: node, startNode } = params
    if (!node) {
      return
    }
    // console.log(node)
    // console.log(startNode)
    if (node.data.type === 'file') {
      if (this.editor) {
        console.log('file change')
        this.editor.editor.gotoLine(1)
      }
      if (!this.fileContent[node.data.path]) {
        let content = await this.getFileContent(node.data.path)
        this.fileContent[node.data.path] = content
      }
      this.setState({
        editorNodePath: node.data.path,
        editorNodeContent: this.fileContent[node.data.path],
        clickedNodeType: 'file',
        clickedNodePath: node.data.path
      })
    } else {
      this.setState({
        clickedNodeType: 'directory',
        clickedNodePath: node.data.path
      })
    }

    if (startNode) {
      console.log(startNode.data.path)
      this.setState({
        startNodePath: startNode.data.path
      })
    } else {
      this.setState({
        startNodePath: ''
      })
    }
  }

  async getFileContent(filepath) {
    try {
      let options = {
        method: 'GET',
        url: 'http://localhost:3450/file',
        params: {
          filepath: filepath
        }
      }
      let res = await axios(options)
      return res.data
    } catch (e) {
      return ''
    }
  }

  async initData() {
    try {
      let [resDep] = await Promise.all(
        ['depcruise'].map(async v => {
          let res = await axios({
            method: 'GET',
            url: `http://localhost:3450/${v}`
          })
          console.log(res)
          return res.data
        })
      )
      this.setState({
        dirTree: resDep.dirtrees,
        depCruise: resDep.modules,
        basePath: resDep.basePath
      })
    } catch (e) {
      console.log(e)
    }
  }

  handleChangeSwitch = name => event => {
    const status = event.target.checked
    this.setState(
      {
        [name]: status
      },
      () => {
        if (this.editor) {
          console.log('editor change')
          this.editor.editor.gotoLine(1)
        }
        if (name === 'showDependent' && this.chartCtrller) {
          this.chartCtrller.updateDepConfig(this.state.depLevel, status)
        }
      }
    )
  }

  handleClickLock = type => () => {
    console.log(type)
    let locked = Boolean(type === 'lock')
    this.setState({
      startFileLocked: locked
    })
    if (this.chartCtrller) {
      this.chartCtrller.lockStartFile(locked)
    }
  }

  handleChangeDepLevel = level => {
    if (this.chartCtrller) {
      this.chartCtrller.updateDepConfig(level, this.state.showDependent)
    }
  }

  render() {
    const {
      showCodeboard,
      editorNodePath,
      editorNodeContent,
      startFileLocked,
      startNodePath,
      editorWidth,
      depLevel,
      showDependent,
      basePath
    } = this.state

    return (
      <div className="CodeRoadMainContainer">
        <div
          className="CodeRoadMainChart"
          ref={ele => (this.containerSvg = ele)}
        >
          <svg ref={element => (this.svg = element)} />
          <div className="CoadRoadToolsBar">
            <Tooltip title="Toggle editor" placement="left">
              <Switch
                checked={showCodeboard}
                onChange={this.handleChangeSwitch('showCodeboard')}
                value="showCodeboard"
              />
            </Tooltip>
            <Tooltip
              title={showDependent ? 'Show dependencies' : 'Show dependents'}
              placement="left"
            >
              <Switch
                checked={showDependent}
                onChange={this.handleChangeSwitch('showDependent')}
                value="showDependent"
              />
            </Tooltip>
            {startFileLocked ? (
              <Tooltip title="Unlock starter file" placement="left">
                <IconButton
                  color="secondary"
                  style={{ fontSize: '30px', cursor: 'pointer' }}
                  onClick={this.handleClickLock('unlock')}
                >
                  <LockIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Lock starter file" placement="left">
                <div>
                  <IconButton
                    color="secondary"
                    style={{ fontSize: '30px', cursor: 'pointer' }}
                    onClick={this.handleClickLock('lock')}
                    disabled={!startNodePath}
                  >
                    <LockOpenIcon />
                  </IconButton>
                </div>
              </Tooltip>
            )}
            <Tooltip title="Change depth" placement="left">
              <div>
                <NumInput
                  value={depLevel}
                  min={1}
                  max={10}
                  onChange={this.handleChangeDepLevel}
                />
              </div>
            </Tooltip>
          </div>
        </div>
        {showCodeboard && (
          <Resizable
            className="CodeRoadCodeBoard"
            defaultSize={{
              width: editorWidth
            }}
            minWidth={10}
            enable={{
              top: false,
              right: false,
              bottom: false,
              left: true,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            onResizeStop={(e, direction, ref, d) => {
              this.setState({
                editorWidth: this.state.editorWidth + d.width
              })
              this.editor.editor.resize()
            }}
            // handleWrapperStyle={{
            //   width: '18px',
            //   background: '#1d1e22'
            // }}
            handleWrapperClass="CodeRoadDragHandler"
          >
            {/* <div className="CodeRoadDragHandler" /> */}
            <div className="CodeRoadCodeEditor">
              <div className="CodeRoadCodeHeader">{editorNodePath.replace(basePath, '.')}</div>
              <div className="CodeRoadCodeContainer">
                <AceEditor
                  width="100%"
                  height="100%"
                  mode="javascript"
                  theme="monokai"
                  name="CodeRoadEditor"
                  cursorStart={1}
                  fontSize={13}
                  showPrintMargin={false}
                  showGutter={true}
                  highlightActiveLine={true}
                  value={editorNodeContent}
                  tabSize={2}
                  readOnly={true}
                  editorProps={{
                    $blockScrolling: Infinity
                  }}
                  setOptions={{
                    showLineNumbers: true,
                    useWorker: false
                  }}
                  ref={ref => (this.editor = ref)}
                />
              </div>
            </div>
          </Resizable>
        )}
      </div>
    )
  }
}
