import React, { useState, useEffect } from 'react'
import axios from 'axios'

async function getDirTree(){
  let options = {
    method: 'get',
    url: 'http://localhost:3450/data'
  }
  let res = await axios(options)
  return res.data
}

function CodeRoadView() {
  const [dirTree, setDirTree] = useState({})
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await getDirTree()
      setDirTree(result)
    }
    fetchData()
  }, [])

  return <div>{JSON.stringify(dirTree)}</div>
}

export default CodeRoadView
