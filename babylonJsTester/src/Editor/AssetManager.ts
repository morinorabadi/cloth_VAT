import {
	AssetsManager as AM,
	type AbstractAssetTask,
	ContainerAssetTask,
	type AssetContainer,
	Mesh,
	Scene,
	TransformNode,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { softRandomId } from "../utils/random.utils";

export default class AssetManager extends AM {
	useDefaultLoadingScreen = false;
	private assetContainers = new Map<string, AssetContainer>();
	private meshInstance: Mesh[] = [];
	private meshParent: TransformNode[] = [];

	constructor(scene: Scene) {
		super(scene);
		["plane"].forEach((name) => {
			const url = `${window.location.origin}/gltfs/${name}.glb`;
			this.addContainerTask(name, "", "", url);
		});
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

	onFinish = (tasks: AbstractAssetTask[]) => {
		tasks.forEach((task) => {
			if (task instanceof ContainerAssetTask) {
				this.assetContainers.set(task.name, task.loadedContainer);
			}
		});

		// const addMeshInstance = (name: string) => {
		// 	const model = this.getMesh(name, false, true).getChildMeshes()[0] as Mesh;
		// 	model.isVisible = false;
		// 	model.setParent(null);
		// 	model.name = name;
		// 	model.id = randomId();
		// 	this.meshInstance.push(model);
		// };
	};
}
