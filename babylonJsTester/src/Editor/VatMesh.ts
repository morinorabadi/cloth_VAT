import { Mesh } from "@babylonjs/core";
import Editor from "./Editor";
import VatMaterial from "./VatMaterial";

type MetaData = {
    index: number;
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
    min_z: number;
    max_z: number;
}

export default class VatMesh {
    mesh: Mesh
    constructor(assetName: string, textureAssetName: string) {
        const { assetManager } = Editor.GetInstance()
        this.mesh = assetManager.getInstance(assetName).rootNodes[0].getChildMeshes()[0] as Mesh;

        this.processMetaData(this.mesh.metadata.gltf.extras.vertexData)

        this.mesh.material = new VatMaterial("test", textureAssetName)

    }

    private processMetaData(data: MetaData[]) {
        const indexX: number[] = [] // store index
        const minMaxX: number[] = [] // store min max X
        const minMaxY: number[] = [] // store min max X
        const minMaxZ: number[] = [] // store min max X

        data.forEach(info => {
            indexX.push(info.index)
            minMaxX.push(info.min_x, info.max_x)
            minMaxY.push(info.min_y, info.max_y)
            minMaxZ.push(info.min_z, info.max_z)
        })

        this.mesh.setVerticesData("indexX", indexX, false, 1)
        this.mesh.setVerticesData("minMaxX", minMaxX, false, 2)
        this.mesh.setVerticesData("minMaxY", minMaxY, false, 2)
        this.mesh.setVerticesData("minMaxZ", minMaxZ, false, 2)
    }
}
