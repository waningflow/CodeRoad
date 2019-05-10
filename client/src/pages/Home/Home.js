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
    fontFamily: 'monospace'
  },
  link: {
    textDecoration: 'none',
    color: '#fff',
    fontFamily: 'monospace'
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
        <div style={{ position: 'absolute', top: '6px', left: '6px' ,color: '#aaa'}}>
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
      </div>
    )
  }
}
