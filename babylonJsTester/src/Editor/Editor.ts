import useStore from "@/store/store.index";
import {
	ArcRotateCamera,
	CreateBox,
	Engine,
	Scene,
	Vector3,
} from "@babylonjs/core";
import Environment from "./Environment";
import AssetManager from "./AssetManager";
import VatMesh from "./VatMesh";

export default class Editor {
	private static instance: Editor | undefined;

	static GetInstance() {
		if (!this.instance) {
			this.instance = new Editor();
		}
		return this.instance;
	}

	static ClearInstance() {
		useStore.getState().reset();
		this.instance?.cleanUp();
		this.instance = undefined;
	}

	canvas!: HTMLCanvasElement;
	engine!: Engine;
	scene!: Scene;

	environment!: Environment;
	assetManager!: AssetManager;

	camera!: ArcRotateCamera;

	isInitialized = false;
	async init(canvas: HTMLCanvasElement) {
		try {
			if (this.isInitialized) return;
			this.isInitialized = true;

			this.canvas = canvas;
			this.engine = new Engine(canvas, true);
			this.scene = new Scene(this.engine);

			this.camera = new ArcRotateCamera("main_camera", 0, 0, 4, new Vector3(0,2,0));
			this.camera.attachControl();
			this.camera.lowerRadiusLimit = 2
			this.camera.upperRadiusLimit= 10

			this.assetManager = new AssetManager(this.scene);
			await this.assetManager.loadAsync();

			new VatMesh("tset_cloth", "cloth_VAT_texture")

			for (let i = -20; i < 20; i++) {
				const box = CreateBox("test")
				box.scaling.set(0.1, 0.1, 0.1)
				if (i % 5 === 0) box.scaling.set(0.2, 0.2, 0.2)
				if (i === 0) box.scaling.set(0, 0, 0)
				box.position.y = i
			}

			await this.scene.whenReadyAsync();

			this.environment = new Environment();

			useStore.getState().loadingOver();

			this.engine.runRenderLoop(() => this.scene.render());
		} catch (error) {
			console.error(error);
		}
	}

	cleanUp() {
		this.engine.stopRenderLoop();
		this.engine.dispose();
	}
}
