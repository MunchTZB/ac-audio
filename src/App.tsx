import React from "react";
import logo from "./logo.svg";
import Pinyin from "tiny-pinyin";
import { alphabet } from "./audio";
import {SimpleFilter, SoundTouch} from './soundTouch';
import "./App.css";
console.log(SimpleFilter);
// https://www.reddit.com/r/javascript/comments/af9nip/how_to_pitch_shift_in_js/
const PINGYING_REG = /([^aoeiuv]?h?)([iuv]?)(ai|ei|ao|ou|er|ang?|eng?|ong|a|o|e|i|u|ng|n)?/;
const aCtx = new AudioContext();
const pitchProcessor = aCtx.createScriptProcessor(4096, 1, 1);
pitchProcessor.onaudioprocess = function (audioProcessingEvent) {
  // console.log(audioProcessingEvent);
  const inputBuffer = audioProcessingEvent.inputBuffer;
  const outputBuffer = audioProcessingEvent.outputBuffer;
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);

    // Loop through the 4096 samples
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      // make output equal to the same as the input
      outputData[sample] = inputData[sample];

      // add noise to each output sample
      // outputData[sample] += (Math.random() * 2 - 1) * 0.2;
    }
  }
  // for (let sample = 0; sample < inputBuffer.length; sample++) {
  //   const inputData = inputBuffer.getChannelData(0);
  //   const outputData = outputBuffer.getChannelData(0);
  //   // make output equal to the same as the input
  //   outputData[sample] = inputData[sample];

  //   // add noise to each output sample
  //   // outputData[sample] += (Math.random() * 2 - 1) * 0.2;
  // }
};
pitchProcessor.connect(aCtx.destination);
async function getAudioData(url: string) {
  let arrayBuffer = await (await fetch(url)).arrayBuffer();
  return await aCtx.decodeAudioData(arrayBuffer);
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
  audioDatas.forEach((item) => {
    const source = aCtx.createBufferSource();
    source.buffer = item;
    pitchProcessor.disconnect();
    source.connect(pitchProcessor);
    // pitchProcessor.connect(aCtx.destination)
    // source.connect(aCtx.destination)
    source.playbackRate.value = playbackRate;
    source.start(currentTime);
    currentTime += item.duration / playbackRate;
  });
}

function App() {
  const [inputValue, setInputValue] = React.useState("");
  const genAudio = React.useCallback(async () => {
    const zhStr = inputValue.replace(/[^\u4E00-\u9FA5]/g, "");
    const arr = Pinyin.parse(zhStr);
    const pinyinArr = arr.map((item) => {
      const str = item.target.toLowerCase();
      return str.split("");
    });
    const flattedPinyinArr = pinyinArr.flat();
    const audioArr = await Promise.all(
      flattedPinyinArr.map((item) => getAudioData(alphabet[item]))
    );
    playAudio(audioArr, 1);
  }, [inputValue]);

  return (
    <div className="App">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
      />
      <button onClick={genAudio}>gen!</button>
    </div>
  );
}

export default App;
