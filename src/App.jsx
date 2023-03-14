import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import { MathUtils } from "three";
// import './scene.css';
import { useAudioAnalyser } from './contexts/AudioAnalyserContext';
import { useMediaStream } from './contexts/MediaStreamContext';
import vertexShader from './vertexShader';
import fragmentShader from './fragmentShader';

const normalize = (n,max=180,min=0)=>{
  let interval = Math.max(1,max-min)
  return Math.max(n-min,0)/interval
}

const Blob = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef();
  const hover = useRef(false);
  const audioIntensity = useRef(0);
  const { analyser } = useAudioAnalyser();
  const uniforms = useMemo(
    () => ({
      u_intensity: {
        value: 0.3,
      },
      u_time: {
        value: 0.0,
      },
    }),
    []
  );
  const params = useMemo(()=>{
    const urlParams = new URLSearchParams(window.location.search)
    let max = urlParams.get('max')?parseInt(urlParams.get('max')):null
    let min = urlParams.get('min')?parseInt(urlParams.get('min')):null
    let log = urlParams.get('log')?urlParams.get('log')==='true':null
    return {max, min, log}
  })  
  useFrame((state) => {
    const { clock } = state;
    mesh.current.material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
    const data = new Uint8Array(analyser?.frequencyBinCount||0);
    analyser?.getByteTimeDomainData(data);
    let mean = data.reduce((acc,item)=>acc+item,0)/(data.length+1)
    if (params.log){
      console.log(Math.floor(mean))
    }
    let meanNormalized = normalize(mean, params.max??255,params.min??0)
    mesh.current.material.uniforms.u_intensity.value = MathUtils.lerp(
      mesh.current.material.uniforms.u_intensity.value,
      meanNormalized,// hover.current ? 0.85 : 0.15,
      0.02
    );
  });

  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
      scale={1.5}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

const Scene = () => {
  const { stream, start, stop } = useMediaStream();
  const toggleMic = () => stream ? stop() : start();
  return (
    <div onClick={toggleMic}>
    <Canvas camera={{ position: [0.0, 0.0, 16.0] }} style={{height:'100vh', width:'100vw', background: "black"}}>
      <Blob />
      <axesHelper />
      <OrbitControls />
    </Canvas>
    </div>
  );
};

export default Scene;
