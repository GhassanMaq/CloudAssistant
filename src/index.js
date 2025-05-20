import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Amplify } from 'aws-amplify'
import awsExports from './aws-exports'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(awsExports)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
