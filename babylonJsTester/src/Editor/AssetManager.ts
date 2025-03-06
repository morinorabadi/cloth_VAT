import {
	AssetsManager as AM,
	type AbstractAssetTask,
	ContainerAssetTask,
	type AssetContainer,
	Mesh,
	Scene,
	TransformNode,
	TextureAssetTask,
	Texture,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { softRandomId } from "../utils/random.utils";

export default class AssetManager extends AM {
	useDefaultLoadingScreen = false;
	private assetContainers = new Map<string, AssetContainer>();
	private meshInstance: Mesh[] = [];
	private meshParent: TransformNode[] = [];
	private textures = new Map<string, Texture>();

	constructor(scene: Scene) {
		super(scene);
		// glb files
		["plane"].forEach((name) => {
			const url = `${window.location.origin}/gltfs/${name}.glb`;
			this.addContainerTask(name, "", "", url);
		});

		// texture files
		["VAT_texture"].forEach(name => {
			const url = `${window.location.origin}/textures/${name}.png`;
			this.addTextureTask(name, url, undefined, undefined, Texture.NEAREST_SAMPLINGMODE);
		})
	}

	getInstance(
		assetName: string,
		nameFunction = (name: string) => name,
		cloneMaterials = false,
		doNotInstantiate = true,
	) {
		const model = this.assetContainers.get(assetName);

		if (!model)
			throw new Error(`Asset with name "${assetName}" was not found.`);

		return model.instantiateModelsToScene(nameFunction, cloneMaterials, {
			doNotInstantiate,
		});
	}

	getMesh(
		assetName: string,
		cloneMaterials = false,
		setCenterPosition = false,
	) {
		const rootNodes = this.getInstance(
			assetName,
			(name) => name,
			cloneMaterials,
		).rootNodes;
		const mesh = rootNodes[0]! as Mesh;

		if (setCenterPosition)
			mesh.getChildMeshes().forEach((child) => child.position.set(0, 0, 0));
		return mesh;
	}

	/**
	 * * warning multi materials are not instantiated
	 */
	getMeshInstance(assetName: string) {
		const mesh = this.meshInstance.find((a) => a.name === assetName);
		const parent = this.meshParent.find((a) => a.name === assetName);

		if (mesh === undefined && parent === undefined)
			throw Error(assetName + " this mesh is not exist");

		const name = `${assetName}__${softRandomId()}`;

		if (mesh !== undefined) {
			const instance = mesh.createInstance(name);
			return instance;
		}

		const instance = parent!.clone(name, null) as TransformNode;

		return instance;
	}

	getTexture(name: string) {
		const texture = this.textures.get(name)
		if (texture === undefined) throw new Error("cant find this texture " + name)
		return texture
	}

	onFinish = (tasks: AbstractAssetTask[]) => {
		tasks.forEach((task) => {
			if (task instanceof ContainerAssetTask) {
				this.assetContainers.set(task.name, task.loadedContainer);
			}

			if (task instanceof TextureAssetTask) {
				this.textures.set(task.name, task.texture)
			}
		});
	};
}
