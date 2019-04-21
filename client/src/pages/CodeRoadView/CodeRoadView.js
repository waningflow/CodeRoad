import React, { Component } from 'react'
import axios from 'axios'
import ChartController from './Chart'
import './CodeRoadView.css'
import Switch from '@material-ui/core/Switch'
import AceEditor from 'react-ace'

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
      editorNodeContent: ''
    }

    this.fileContent = {}

    this.containerSvg
    this.initData()

    this.chartCtrller = null
  }

  componentDidMount() {
    // const { dirTree } = this.state
    // this.chart(this.svg, dirTree)
  }

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

  async handleClickNode(node) {
    console.log(node)
    if (node.data.type === 'file') {
      if (!this.fileContent[node.data.path]) {
        let content = await this.getFileContent(node.data.path)
        this.fileContent[node.data.path] = content
      }
      this.setState({
        editorNodePath: node.data.path,
        editorNodeContent: this.fileContent[node.data.path]
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
      let resDir = resDep.dirtrees
      let resDepModules = resDep.modules
      this.setState({
        dirTree: resDir,
        depCruise: resDepModules
      })
    } catch (e) {
      console.log(e)
    }
  }

  handleChangeSwitch = name => event => {
    this.setState({
      [name]: event.target.checked
    })
  }

  render() {
    const { showCodeboard, editorNodePath, editorNodeContent } = this.state

    return (
      <div className="CodeRoadMainContainer">
        <div
          className="CodeRoadMainChart"
          ref={ele => (this.containerSvg = ele)}
        >
          <svg ref={element => (this.svg = element)} />
          <div className="CoadRoadToolsBar">
            <Switch
              checked={showCodeboard}
              onChange={this.handleChangeSwitch('showCodeboard').bind(this)}
              value="showCodeboard"
            />
          </div>
        </div>
        {showCodeboard && (
          <div className="CodeRoadCodeBoard">
            <div className="CodeRoadDragHandler" />
            <div className="CodeRoadCodeEditor">
              <div className="CodeRoadCodeHeader" >
              {editorNodePath}
              </div>
              <div className="CodeRoadCodeContainer">
                <AceEditor
                  width="100%"
                  height="100%"
                  mode="javascript"
                  theme="monokai"
                  name="CodeRoadEditor"
                  fontSize={13}
                  showGutter={true}
                  highlightActiveLine={true}
                  value={editorNodeContent}
                  tabSize={2}
                  readOnly={true}
                  setOptions={{
                    showLineNumbers: true,
                    useWorker: false
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
