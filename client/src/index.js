import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import ReactGA from 'react-ga'

ReactGA.initialize('UA-136598251-5')
ReactGA.pageview(window.location.pathname)

ReactDOM.render(<App />, document.querySelector('#root'))
