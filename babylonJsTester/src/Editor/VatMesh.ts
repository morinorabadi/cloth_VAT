import { Mesh } from "@babylonjs/core";
import Editor from "./Editor";
import VatMaterialPlugin from "./VatMaterialPlugin";
// import VatMaterialPlugin from "./VatMaterialPlugin";

type MetaData = {
    index: number;
    nx: number;
    xx: number;
    ny: number;
    xy: number;
    nz: number;
    xz: number;
    nxn: number;
    xxn: number;
    nyn: number;
    xyn: number;
    nzn: number;
    xzn: number;
}

export default class VatMesh {
    mesh: Mesh
    constructor(assetName: string, textureAssetName: string, normalAssetName: string) {
        const { assetManager, scene } = Editor.GetInstance()
        this.mesh = assetManager.getInstance(assetName).rootNodes[0].getChildMeshes()[0] as Mesh;

        this.processMetaData(this.mesh.metadata.gltf.extras.vertexData)

        const texture = assetManager.getTexture(textureAssetName)
        const normalTexture = assetManager.getTexture(normalAssetName)
        const vatMaterialPlugin = new VatMaterialPlugin(this.mesh.material!, texture, normalTexture)

        let a = 0
        scene.onBeforeRenderObservable.add(() => {
            a += 0.002
            if (a > 1) a = 0.0
            vatMaterialPlugin.frame = a
        })

        // this.mesh.material = new VatMaterial("test", textureAssetName)

    }

    private processMetaData(data: MetaData[]) {
        const indexX: number[] = [];

        const minMaxX: number[] = [];
        const minMaxY: number[] = [];
        const minMaxZ: number[] = [];

        const minMaxNX: number[] = [];
        const minMaxNY: number[] = [];
        const minMaxNZ: number[] = [];

        data.forEach(info => {
            indexX.push(info.index)

            minMaxX.push(info.nx, info.xx)
            minMaxY.push(info.ny, info.xy)
            minMaxZ.push(info.nz, info.xz)

            minMaxNX.push(info.nxn, info.xxn)
            minMaxNY.push(info.nyn, info.xyn)
            minMaxNZ.push(info.nzn, info.xzn)
        })

        this.mesh.setVerticesData("indexX", indexX, false, 1)

        this.mesh.setVerticesData("minMaxX", minMaxX, false, 2)
        this.mesh.setVerticesData("minMaxY", minMaxY, false, 2)
        this.mesh.setVerticesData("minMaxZ", minMaxZ, false, 2)

        this.mesh.setVerticesData("minMaxNX", minMaxNX, false, 2)
        this.mesh.setVerticesData("minMaxNY", minMaxNY, false, 2)
        this.mesh.setVerticesData("minMaxNZ", minMaxNZ, false, 2)
    }
}
