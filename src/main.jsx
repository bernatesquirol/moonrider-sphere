import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { MediaStreamProvider } from './contexts/MediaStreamContext';
import { AudioAnalyserProvider } from './contexts/AudioAnalyserContext';
import { InputAudioProvider } from './contexts/InputAudioContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MediaStreamProvider video={false} audio={true}>
      <InputAudioProvider>
        <AudioAnalyserProvider>
          <App />
        </AudioAnalyserProvider>
      </InputAudioProvider>
    </MediaStreamProvider>
  </React.StrictMode>,
)
