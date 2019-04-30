// @flow
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
    borderRadius: '22px'
  },
  inputNumber: {
    color: '#fff',
    textAlign: 'center'
  }
}

type Props = {
  min: number,
  max: number,
  step: number,
  value: number,
  onChange: Function
}

function NumInput(props: Props) {
  const { onChange, min, max, step } = props
  const [inputNumber, setNumber] = useState(props.value)

  function handleChange(c) {
    let newNumber = inputNumber + step * c
    if (newNumber < min) {
      newNumber = min
    }
    if (newNumber > max) {
      newNumber = max
    }
    if (newNumber === inputNumber) {
      return
    }
    setNumber(newNumber)
    onChange(newNumber)
  }
  return (
    <div style={styles.inputContainer}>
      <IconButton
        color="secondary"
        onClick={() => handleChange(1)}
        disabled={inputNumber === max}
      >
        <AddIcon fontSize="small" />
      </IconButton>
      <div style={styles.inputNumber}>{inputNumber}</div>
      <IconButton
        color="secondary"
        onClick={() => handleChange(-1)}
        disabled={inputNumber === min}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

NumInput.defaultProps = {
  min: 1,
  max: 100,
  step: 1
}

export default NumInput
