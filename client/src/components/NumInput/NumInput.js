import React, { useState } from 'react'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
import IconButton from '@material-ui/core/IconButton'

const styles = {
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '5px'
  },
  inputNumber: {
    color: '#fff',
    textAlign: 'center'
  }
}

function NumInput(props) {
  const { onChange } = props
  const [inputNumber, setNumber] = useState(props.value)

  function handleChange(c){
    let newNumber = inputNumber + c
    setNumber(newNumber)
    onChange(newNumber)
  }
  return (
    <div style={styles.inputContainer}>
      <IconButton color="secondary" onClick={() => handleChange(1)}>
        <AddIcon fontSize="small" />
      </IconButton>
      <div style={styles.inputNumber}>{inputNumber}</div>
      <IconButton color="secondary" onClick={() => handleChange(-1)}>
        <RemoveIcon />
      </IconButton>
    </div>
  )
}

export default NumInput
