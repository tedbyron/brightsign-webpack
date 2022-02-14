import axios from 'axios'
import axiosRetry from 'axios-retry'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

function IndexPage (): JSX.Element {
  const [clickCount, setClickCount] = useState(0)
  const [process, setProcess] = useState('Loading...')

  useEffect(() => {
    const axiosRetryConfig = { retries: 5, retryDelay: axiosRetry.exponentialDelay }
    axiosRetry(axios, axiosRetryConfig)

    axios('http://localhost:9001/node')
      .then((json) => {
        setProcess(JSON.stringify(json, null, 2))
      })
      .catch((err) => {
        console.error(err)
        setProcess(`Error: failed to fetch from local endpoint; tried ${axiosRetryConfig.retries} times.`)
      })
  }, [])

  return (
    <div className='container my-3 flex flex-col space-y-6 text-indigo-600'>
      <div className='mx-auto flex space-x-3 text-6xl'>
        <input
          type='text'
          name='click-count'
          value={clickCount}
          readOnly
          disabled
        />
        <input
          type='button'
          value='+1'
          onPointerDown={() => setClickCount(clickCount + 1)}
          className='font-bold'
        />
      </div>

      <div className='mx-auto flex items-center space-x-3 text-2xl'>
        <svg
          className={classNames('animate-spin h-5 w-5', { hidden: process !== 'Loading...' })}
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle className='opacity-10' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
          <path className='opacity-100' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
        </svg>
        <span>{process}</span>
      </div>

      <span className='mx-auto text-2xl'>{navigator.userAgent}</span>
    </div>
  )
}

export default IndexPage
