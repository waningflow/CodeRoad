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
import Tooltip from '@material-ui/core/Tooltip'
import LinearProgress from '@material-ui/core/LinearProgress'
import SvgIcon from '@material-ui/core/SvgIcon'
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
      showDependent: false,
      completed: false
    }

    this.baseUrl =
      process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3450/'
    this.fileContent = {}

    this.containerSvg
    this.initData()

    this.chartCtrller = null
  }

  componentDidMount() {}

  componentDidUpdate() {
    const { dirTree, depCruise } = this.state
    if (
      !this.chartCtrller &&
      this.svg &&
      this.containerSvg &&
      dirTree.hasOwnProperty('name')
    ) {
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

    if (node.data.type === 'file') {
      if (this.editor) {
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
        url: this.baseUrl + 'file',
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
          let options = {
            method: 'GET',
            url: this.baseUrl + v
          }
          if (this.props.name) {
            options.params = {
              name: this.props.name
            }
          }
          let res = await axios(options)
          return res.data
        })
      )
      this.setState({
        dirTree: resDep.dirtrees,
        depCruise: resDep.modules,
        basePath: resDep.basePath,
        completed: true
      })
    } catch (e) {
      console.log(e)
      this.setState({
        completed: true
      })
      if(this.props.onError){
        this.props.onError()
      }
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
          this.editor.editor.gotoLine(1)
        }
        if (name === 'showDependent' && this.chartCtrller) {
          this.chartCtrller.updateDepConfig(this.state.depLevel, status)
        }
      }
    )
  }

  handleClickLock = type => () => {
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
      basePath,
      completed
    } = this.state

    return (
      <div className="CodeRoadMainContainer">
        {!completed && (
          <LinearProgress
            color="secondary"
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          />
        )}
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
            <div style={{ flexGrow: 1 }} />
            <a href="https://github.com/waningflow/CodeRoad" target="blank">
              <IconButton aria-label="Github" color="secondary">
                <SvgIcon style={{ color: '#000' }}>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </SvgIcon>
              </IconButton>
            </a>
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
              <div className="CodeRoadCodeHeader">
                {editorNodePath.replace(basePath, '.')}
              </div>
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
