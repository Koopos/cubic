/*
 * @Author: 娄松 
 * @Date: 2024-12-02 15:17:21
 * @LastEditors: 娄松 
 * @LastEditTime: 2024-12-09 10:59:05
 * @FilePath: \mofang\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {CameraControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'


function Box(props) {
  const ref=useRef()
  const [clicked, changeClick] = useState(false)
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const {camera, scene} = useThree()

  const [position, setPosition] = useState(props.position)

  const handleClick = (event) => {
    if(isAnimating) {
      return
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
      // Toggle selection on the box when clicked
      // intersects[0].object.material=new Array(6).fill({color: 0xffffff})

      const axis = ['x','y','z'][Math.floor(Math.random()*9999999)%3]
      // const axis = Math.random()>0.5?'z': 'x'
      const selectedPosition = intersects[0].object.position
      const {x,y,z} = selectedPosition
      props.handleAction({
        axis,
        value: axis==='x'? x :axis==='y'?y:z
      })
    }

    // 绘制射线
    // drawRay(raycaster.ray.origin, raycaster.ray.direction);
    changeClick(!clicked)
  }

  const [isAnimating, setIsAnimating] = useState(false)
  let angle = 0

  const endAnimation = () => {
    props.handleAction({
      axis: '',
      value: ''
    })
    setIsAnimating(false)
    angle = 0
  }

  const speed = Math.PI /20

  useFrame(() => {
    if(isAnimating && ref.current) {
      const {x,y,z} = position
      if(props.axis === 'x') {
        angle += (speed)
        const newPosition = [ x,
          y * Math.cos(angle) - z * Math.sin(angle),
          y * Math.sin(angle) + z * Math.cos(angle)]
        ref.current.position.set(newPosition[0], newPosition[1], newPosition[2])
        // ref.current.rotation.x+=(speed)
        ref.current.rotateOnWorldAxis(new THREE.Vector3(1,0,0), speed)
        if(Math.abs(angle-Math.PI/2)<0.001) {
          endAnimation()
          return
        }
      } else if(props.axis === 'y') {
        if(Math.abs(angle)>Math.PI/2) {
          endAnimation()
          return
        }
        angle += (speed)
        const newPosition = [ x * Math.cos(angle) + z * Math.sin(angle),
          y,
          -x * Math.sin(angle) + z * Math.cos(angle)]
        ref.current.position.set(newPosition[0], newPosition[1], newPosition[2])
        ref.current.rotateOnWorldAxis(new THREE.Vector3(0,1,0), speed)
        if(Math.abs(angle-Math.PI/2)<0.001) {
          endAnimation()
          return
        }
      } else if(props.axis === 'z') {
        angle += (speed)
        const newPosition = [ x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle),
          z
         ]
        ref.current.position.set(newPosition[0], newPosition[1], newPosition[2])
        ref.current.rotateOnWorldAxis(new THREE.Vector3(0,0,1), speed)
        if(Math.abs(angle-Math.PI/2)<0.001) {
          endAnimation()
          return
        }
      }
    }
  })

  useEffect(() => {
    const currentPosition= ref.current.position
    const {x,y,z} = currentPosition
    if(props.axis && (Math.abs(currentPosition[props.axis] - props.value)<=0.1) && ref.current && !isAnimating) {
      setPosition({x,y,z})
      setIsAnimating(true)
    }
  }, [props.axis, props.value, props.position])
  //  const sprinpProps = useSpring({
  //   to: {
  //     rotation: rotateAngle, // 根据 rotationAngle 变量设置旋转
  //     position: position, // 根据 position 变量设置位置
  //   },
  //   from: {
  //     rotation: [0,0,0], // 初始旋转
  //     position: [0,0,0], // 初始位置
  //   },
  //   config: { duration: 1000 }, // 动画持续时间 1 秒
  // });

  let materials = [
    { color: 0xff8000 }, // 正面（橙色）
    { color: 0xff0000 }, // 背面（红色）
    { color: 0x0000ff }, // 左面（蓝色）
    { color: 0x00ff00 }, // 右面（绿色）
    { color: 0xffffff }, // 顶面（白色）
    { color: 0xffff00 }, // 底面（黄色）

  ];
  const black = {color: 0x000000}

  // 正面为黑
  if(props.position[0]< 1) {
    materials[0] = black
  }
  // 背面为黑
  if(props.position[0]> -1) {
    materials[1] = black
  }

  // 顶面为黑
  if(props.position[1]< 1) {
    materials[2] = black
  }

  // 底面为黑
  if(props.position[1]> -1) {
    materials[3] = black
  }

  // 左面为黑
  if(props.position[2]< 1) {
    materials[4] = black
  }

  // 右面为黑
  if(props.position[2]> -1) {
    materials[5] = black
  }

  return (
    <>
    <mesh {...props} ref={ref} onClick={handleClick}>
      <boxGeometry args={[0.9,0.9,0.9]} />
      {materials.map((material, index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} {...material} />
      ))}
    </mesh>
    </>
   
  )
}

const positionList = []

for(let i=-1;i<2;i++){
  for(let j=-1;j<2;j++){
    for(let k=-1;k<2;k++){
      positionList.push([i,j,k])
    }
  }
}

function App() {

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [axis, setAxis] = useState('')
  const [value, setValue] = useState('')
  


  const handleAction = ({axis, value}) => {
    setAxis(axis)
    setValue(value)
  }

  return (
    <div id="canvas-container">
      <Canvas onCreated={(state) => {
          state.gl.setSize(size.width, size.height); // Set initial canvas size
        }}>
        <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.6} />  
        <PerspectiveCamera makeDefault position={[0,0,8]} />
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10,10,10]} angel={0.15} intensity={Math.PI} penumbra={1} decay={0} />
        <pointLight position={[-10,-10,-10]} decay={0} intensity={Math.PI/2} />
        {
          positionList.map(v=>(<Box key={v.join(',')} position={v} handleAction={handleAction} axis={axis} value={value} />))
        }
      </Canvas>
    </div>
  )
}

export default App
