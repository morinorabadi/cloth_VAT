import {
	Color3,
	Color4,
	CubeTexture,
	DirectionalLight,
	HemisphericLight,
	Scene,
	Vector3,
} from "@babylonjs/core";
import Editor from "./Editor";

type ILights = {
	environmentIntensity: number;
	hemisphericLightIntensity: number;
	directionalLightIntensity: number;
	exposure: number;
	contrast: number;
};

const configurations: Record<string, ILights> = {
	base: {
		environmentIntensity: 0.64,
		hemisphericLightIntensity: 0.6,
		directionalLightIntensity: 0.4,
		exposure: 1,
		contrast: 1,
	},
	soheil: {
		environmentIntensity: 0.77,
		hemisphericLightIntensity: 1,
		directionalLightIntensity: 2,
		exposure: 0.6,
		contrast: 1.5,
	},
	new: {
		environmentIntensity: 0.4,
		hemisphericLightIntensity: 1.2,
		directionalLightIntensity: 2,
		exposure: 0.7,
		contrast: 2.7,
	},
};

export default class Environment {
	// shadowGenerator!: ShadowGenerator;

	constructor() {
		const scene = Editor.GetInstance().scene;

		const configuration = configurations.base;

		scene.imageProcessingConfiguration.exposure = configuration.exposure;
		scene.imageProcessingConfiguration.contrast = configuration.contrast;

		// clear color
		scene.clearColor = new Color4(0.8, 0.8, 0.8, 1.0);

		scene.fogMode = Scene.FOGMODE_LINEAR;
		scene.fogColor = new Color3(0.9, 0.98, 1.0);
		scene.fogDensity = 0.05;
		scene.fogStart = 350.0;
		scene.fogEnd = 1500;

		const hdrTexture = new CubeTexture("/env/environmentLight.env", scene);
		const skybox = scene.createDefaultSkybox(hdrTexture, true, 1500)!;
		scene.environmentIntensity = configuration.environmentIntensity;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		skybox.material.disableLighting = true;

		const hemisphericLight = new HemisphericLight(
			"HemisphericLight",
			new Vector3(0, 10, 0),
			scene,
		);
		hemisphericLight.diffuse = new Color3(1, 1, 1);
		hemisphericLight.groundColor = new Color3(0.2, 0.2, 0.2);
		hemisphericLight.specular = new Color3(0.5, 0.5, 0.5);
		hemisphericLight.intensity = configuration.hemisphericLightIntensity;
		hemisphericLight.direction = new Vector3(1.5, 2, -1);
		hemisphericLight.specular = new Color3(0.5, 0.5, 0.5);

		const directionalLight = new DirectionalLight(
			"directionalLight",
			new Vector3(-1, -2, 2),
		);
		directionalLight.intensity = configuration.directionalLightIntensity;
		directionalLight.position.set(0, 40, 0);
	}
}
