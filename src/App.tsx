import React from 'react';
import logo from './logo.svg';
import Pinyin from 'tiny-pinyin'
import {alphabet} from './audio'
import './App.css';

const PINGYING_REG = /([^aoeiuv]?h?)([iuv]?)(ai|ei|ao|ou|er|ang?|eng?|ong|a|o|e|i|u|ng|n)?/;
const aCtx = new AudioContext();
const biquadFilter = aCtx.createBiquadFilter();
async function getAudioData(url: string) {
  let arrayBuffer = await (await fetch(url)).arrayBuffer();
  return await aCtx.decodeAudioData(arrayBuffer)
}

// function playAudio(audioData: AudioBuffer, time?: number) {
//   const source = aCtx.createBufferSource();
//   source.buffer = audioData;
//   source.connect(aCtx.destination);
//   source.playbackRate.value = 2
//   source.start(time);
// }

function playAudio(audioDatas: AudioBuffer[], playbackRate: number) {
  let currentTime = aCtx.currentTime;
  audioDatas.forEach(item => {
    const source = aCtx.createBufferSource();
    source.buffer = item;
    source.connect(aCtx.destination)
    source.playbackRate.value = playbackRate;
    source.start(currentTime);
    currentTime += item.duration / playbackRate;
  })
}

function App() {
  const [inputValue, setInputValue] = React.useState('');
  const genAudio = React.useCallback(async () => {
    const zhStr = inputValue.replace(/[^\u4E00-\u9FA5]/g,'');
    const arr = Pinyin.parse(zhStr);
    const pinyinArr = arr.map(item => {
      const str = item.target.toLowerCase();
      return str.split('');
    })
    const flattedPinyinArr = pinyinArr.flat()
    const audioArr = await Promise.all(flattedPinyinArr.map(item => getAudioData(alphabet[item])))
    playAudio(audioArr, 2)
  }, [inputValue])

  return (
    <div className="App">
      <input type="text" value={inputValue} onChange={(e) => {
        setInputValue(e.target.value)
      }}/>
      <button onClick={genAudio}>gen!</button>
    </div>
  );
}

export default App;
