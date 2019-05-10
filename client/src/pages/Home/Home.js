import React, { Component } from 'react'
// import Paper from '@material-ui/core/Paper'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import IconButton from '@material-ui/core/IconButton'
import Fab from '@material-ui/core/Fab'
import NavigationIcon from '@material-ui/icons/Navigation'
import Dialog from '@material-ui/core/Dialog'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'
import CodeRoadView from '../CodeRoadView/CodeRoadView'
import axios from 'axios'
import Snackbar from '@material-ui/core/Snackbar'
import ReactGA from 'react-ga'
import SvgIcon from '@material-ui/core/SvgIcon'

const styles = {
  bg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#e16262',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  main: {
    color: '#fff',
    fontSize: '25px',
    // border: '1px solid #fff',
    width: '600px',
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },
  logo: {
    width: '100px',
    height: '100px',
    backgroundSize: '100% 100%',
    backgroundImage: 'url(/coderoad-icon.png)',
    cursor: 'pointer'
    // position: 'relative',
  },
  logoText: {
    // position: 'absolute',
    // bottom: '-30px'
    cursor: 'pointer',
    fontWeight: 800
  },
  descText: {
    marginTop: '15px',
    color: '#ffffff60',
    fontSize: '20px',
    fontFamily: 'monospace',
    textAlign: 'center'
  },
  link: {
    textDecoration: 'none',
    color: '#fff',
    fontFamily: 'monospace'
  },
  footer: {
    position: 'fixed',
    bottom: '20px'
  }
}

function Transition(props) {
  return <Slide direction="up" {...props} />
}

export default class Home extends Component {
  constructor() {
    super()

    this.state = {
      snackopen: false,
      open: false,
      projectName: '',
      projectList: ['vue', 'react']
    }
    this.baseUrl =
      process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3450/'

    this.initData()
  }

  async initData() {
    try {
      let res = await axios.get(`${this.baseUrl}projectlist`)
      let projectList = res.data.map(v => v.name)
      this.setState({
        projectList
      })
    } catch (e) {
      this.setState({ snackopen: true })
      console.log(e)
    }
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleClickOpen = () => {
    this.setState({ open: true })
    ReactGA.event({
      category: 'Home',
      action: 'Click Go',
      label: this.state.projectName
    })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleError = () => {
    this.setState({ snackopen: true })
  }

  renderDialog() {
    return (
      <Dialog
        fullScreen
        open={this.state.open}
        onClose={this.handleClose}
        TransitionComponent={Transition}
      >
        <CodeRoadView
          name={this.state.projectName}
          onError={this.handleError}
        />
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            color: '#aaa'
          }}
        >
          <IconButton
            color="inherit"
            onClick={this.handleClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </Dialog>
    )
  }

  handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ snackopen: false })
  }

  renderSnackbar() {
    return (
      <Snackbar
        style={
          {
            // backgroundColor: '#ffa000'
          }
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={this.state.snackopen}
        autoHideDuration={6000}
        onClose={this.handleCloseSnack}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">Something went wrong...try again</span>}
      />
    )
  }

  render() {
    return (
      <div style={styles.bg}>
        <div style={styles.main}>
          <a href="https://github.com/waningflow/CodeRoad/" target="blank">
            <div style={styles.logo} />
          </a>
          <a
            href="https://github.com/waningflow/CodeRoad/"
            target="blank"
            style={styles.link}
          >
            <div style={styles.logoText}>CodeRoad</div>
          </a>
          <div style={styles.descText}>Read code with visualized structure</div>
          <div style={{ marginTop: '80px' }}>
            <Select
              style={{ width: '200px', color: '#fff' }}
              value={this.state.projectName}
              onChange={this.handleChange}
              input={
                <OutlinedInput
                  labelWidth={0}
                  name="projectName"
                  id="outlined-age-simple"
                />
              }
            >
              {this.state.projectList.map(v => (
                <MenuItem value={v} key={v}>
                  {v}
                </MenuItem>
              ))}
            </Select>
            <Fab
              variant="extended"
              aria-label="Delete"
              color="primary"
              style={{ marginLeft: '15px' }}
              onClick={this.handleClickOpen}
            >
              <NavigationIcon />
              Start
            </Fab>
            {/* <IconButton
              color="secondary"
              style={{ fontSize: '50px', cursor: 'pointer' }}
              // onClick={this.handleClickLock('unlock')}
            >
              <VisibilityIcon />
            </IconButton> */}
          </div>
        </div>
        {this.renderDialog()}
        {this.renderSnackbar()}
        <div style={styles.footer}>
          <a href="https://github.com/waningflow/CodeRoad" target="blank">
            <IconButton aria-label="Github" color="secondary">
              <SvgIcon style={{ color: '#000' }}>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </SvgIcon>
            </IconButton>
          </a>
        </div>
      </div>
    )
  }
}
