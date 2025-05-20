import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Amplify } from 'aws-amplify'
import awsmobile from './aws-exports'
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(awsmobile)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
