import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { TextureLoader } from 'three';


export const getTextureLoader = () => {
	return new TextureLoader();
}

export const getGLTFLoader = (withDraco = false) => {
	const gltfLoader = new GLTFLoader();

	if (withDraco) {
		const dracoLoader = getDracoLoader();
		gltfLoader.setDRACOLoader(dracoLoader);
	}

	return gltfLoader;
}

const getDracoLoader = () => {
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('draco/'); // use a full url path

	return dracoLoader;
}
