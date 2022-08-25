import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  Clock,
  CubeTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Renderer,
  Scene,
  ShaderMaterial,
  sRGBEncoding,
  Texture,
  UnsignedByteType,
  WebGLRenderer,
  AnimationAction,
  AnimationMixer
} from 'three'
import { getGLTFLoader, getTextureLoader } from '../cgi/loaders'
import styles from '../styles/Home.module.css'

import portalFragment from '../shaders/portal-frag.glsl';
import portalVertex from '../shaders/portal-vert.glsl';

const Home: NextPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const isServer = typeof window === 'undefined';
    if (isServer || !canvasRef.current) {
      return;
    }

    const scene = new Scene();
    const textureLoader = getTextureLoader();
    const bakedTexture = textureLoader.load('baked.jpg');
    const bakedManTexture = textureLoader.load('man_baked.jpg');
    const bakedDogTexture = textureLoader.load('dog_baked.jpg');
    bakedTexture.flipY = false;
    bakedTexture.encoding = sRGBEncoding;
    bakedManTexture.flipY = false;
    bakedManTexture.encoding = sRGBEncoding;
    bakedDogTexture.flipY = false;
    bakedDogTexture.encoding = sRGBEncoding;

    let human: Group;
    let manAnimation: AnimationAction;
    let dogAnimation: AnimationAction;

    const bakedMaterial = new MeshBasicMaterial({ map: bakedTexture });
    const bakedManMaterial = new MeshBasicMaterial({ map: bakedManTexture });
    const bakedDogMaterial = new MeshBasicMaterial({ map: bakedDogTexture });
    const portalMaterial =  new ShaderMaterial({
      fragmentShader: portalFragment,
      vertexShader: portalVertex,
      transparent: true,
      uniforms: { uTime: { value: 0 }}
    });
    const lampMaterial = new MeshBasicMaterial({ color: 0xE8C182 });

    const gltfLoader = getGLTFLoader(true);
    gltfLoader.load('threejsjourney.glb', (gltf) => {
      console.log(gltf);
      gltf.scene.traverse(item => {
        const child = item as Mesh;
        if (!child.isMesh) {
          return;
        }

        child.material = bakedMaterial;

        if (child.name === 'portalFill') {
          child.material = portalMaterial;
        }

        if (child.name === 'lamp1' || child.name === 'lamp2') {
          child.material = lampMaterial;
        }


      });
      scene.add(gltf.scene);

      renderer.render(scene, camera);
    });


    let manAnimationMixer: AnimationMixer;

    gltfLoader.load('man.glb', (gltf) => {
      human = gltf.scene;
      gltf.scene.traverse(item => {
        const child = item as Mesh;
        if (!child.isMesh) {
          return;
        }

        child.material = bakedManMaterial;
      });
      ;

      if (gltf.animations.length) {

        manAnimationMixer = new AnimationMixer(gltf.scene);
        manAnimation = manAnimationMixer.clipAction(gltf.animations[0]);
        manAnimation.clampWhenFinished = true;
        manAnimation.play();
      }

      scene.add(gltf.scene);

      renderer.render(scene, camera);
    });

    let dogAnimationMixer: AnimationMixer;
    gltfLoader.load('dog.glb', (gltf) => {
      human = gltf.scene;
      gltf.scene.traverse(item => {
        const child = item as Mesh;
        if (!child.isMesh) {
          return;
        }

        child.material = bakedDogMaterial;
      });

      console.log(gltf.animations.length);
      if (gltf.animations.length) {
        dogAnimationMixer = new AnimationMixer(gltf.scene);
        dogAnimation = dogAnimationMixer.clipAction(gltf.animations[0]);
        dogAnimation.clampWhenFinished = true;
        dogAnimation.play();
      }

      scene.add(gltf.scene);

      renderer.render(scene, camera);
    });

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width/height;


    const camera = new PerspectiveCamera(50, aspectRatio, 0.1, 100);
    camera.position.z = 12;
    camera.position.y = 8;
    camera.position.x = 6;
    camera.lookAt(0, 0, 0);
    const renderer = new WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = sRGBEncoding;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setSize(width, height);
    renderer.render(scene, camera);

    const time = new Clock();
    const tick = () =>
    {
        if (manAnimationMixer) {
          var dt = time.getDelta()
          manAnimationMixer.update(dt);
        }
        if (dogAnimationMixer) {
          var dt = time.getDelta()
          dogAnimationMixer.update(dt);
        }

        // Update controls
        // Render
        renderer.render(scene, camera)
        portalMaterial.uniforms.uTime.value = time.getElapsedTime();
        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()

  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <canvas id={styles.scene} ref={canvasRef}/>
    </div>
  )
}

export default Home;
