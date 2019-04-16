import React, { Component } from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CodeRoadView from './pages/CodeRoadView'

const theme = createMuiTheme({
  palette: {
    primary: {
      light: 'rgba(36, 123, 160, 0.1)',
      main: 'rgba(36, 123, 160, 1)',
      contrastText: '#fff'
    },
    secondary: {
      light: 'rgba(178, 219, 191, 0.3)',
      main: 'rgba(178, 219, 191, 1)',
      contrastText: '#fff'
    }
  },
  status: {
    danger: 'rgba(255, 22, 84, 1)'
  },
  typography: {
    useNextVariants: true,
    htmlFontSize: 16
  }
})

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <CodeRoadView />
        </div>
      </MuiThemeProvider>
    )
  }
}

export default App
