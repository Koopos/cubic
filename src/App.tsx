/*
 * @Author: 娄松 
 * @Date: 2024-12-02 15:17:21
 * @LastEditors: 娄松 
 * @LastEditTime: 2024-12-05 17:00:56
 * @FilePath: \mofang\src\App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {CameraControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useSpring, animated } from '@react-spring/three';

function Box(props) {
  const ref=useRef()
  const [clicked, changeClick] = useState(false)
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const {camera, scene} = useThree()

  const [position, setPosition] = useState(props.position)
  const [rotateAngle, setRotateAngel] = useState([0,0,0])

  const handleClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([ref.current]);
    
    if (intersects.length > 0) {
      // Toggle selection on the box when clicked
      // intersects[0].object.material=[{color: 0x000000}]

      // const axis = ['x','y','z'][Math.floor(Math.random()*9999999)%3]
      const axis = 'z'
      
      props.handleAction({
        axis,
        value: axis==='x'? intersects[0].normal.x :axis==='y'?intersects[0].normal.y:intersects[0].normal.z
      })
    }



    // 绘制射线
    // drawRay(raycaster.ray.origin, raycaster.ray.direction);
    changeClick(!clicked)
  }

  useEffect(() => {
    const currentPosition= ref.current.position
    const {x,y,z} = currentPosition
    if(props.axis && currentPosition[props.axis] === props.value && ref.current) {
      if(props.axis === 'x') {
        setPosition([x,-z,y])
        setRotateAngel([-Math.PI/2,0, 0])
      } else if(props.axis === 'y') {
        setPosition([-z,y,x])
        setRotateAngel([0, -Math.PI/2, 0])

      } else if(props.axis === 'z') {
        setPosition([-y,x,z])
        setRotateAngel([0, 0, Math.PI/2])
        ref.current.position.set(-y,x,z)
      } 
    }
  }, [props.axis, props.value, props.position])

   // 使用 useSpring 来实现动画
   const sprinpProps = useSpring({
    to: {
      rotation: rotateAngle, // 根据 rotationAngle 变量设置旋转
      position: position, // 根据 position 变量设置位置
    },
    from: {
      rotation: [0, 0, 0], // 初始旋转
      position: props.position, // 初始位置
    },
    config: { duration: 1000 }, // 动画持续时间 1 秒
  });

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
     <animated.mesh {...sprinpProps} ref={ref} onClick={handleClick}>
      <boxGeometry args={[0.9,0.9,0.9]} />
      {materials.map((material, index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} {...material} />
      ))}
    </animated.mesh>
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


function LODDemo(props) {
  const { camera } = useThree();
  const [lodIndex, setLodIndex] = useState(0); // LOD 索引

  const lod = new THREE.LOD();

  const lowDetailGeometry = useMemo(() => new THREE.IcosahedronGeometry(5, 0), []);
  const mediumDetailGeometry = useMemo(() => new THREE.IcosahedronGeometry(5, 2), []);
  const highDetailGeometry = useMemo(() => new THREE.IcosahedronGeometry(5, 5), []);
  const arr = [lowDetailGeometry, mediumDetailGeometry, highDetailGeometry]
  const colors = ['orange','red', 'green']
  for( let i = 0; i < 3; i++ ) {
    const geometry = arr[i]
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial({color: colors[i]}) );
    lod.addLevel( mesh, i * 30 );
  }

   // 根据 LOD 索引返回不同的几何体
   const geometry = useMemo(() => {
    if (lodIndex === 0) return lowDetailGeometry;
    if (lodIndex === 1) return mediumDetailGeometry;
    return highDetailGeometry;
  }, [lodIndex, highDetailGeometry,lowDetailGeometry, mediumDetailGeometry]);
  
  return  <primitive object={lod} />
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

    setTimeout(() => {
      setAxis(0)
      setValue(0)
    }, 1200)
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
        {/* <LODDemo /> */}
      </Canvas>
    </div>
  )
}

export default App
