import { Mesh, VertexBuffer } from "@babylonjs/core";
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
    constructor(assetName: string) {
        const { assetManager } = Editor.GetInstance()
        this.mesh = assetManager.getInstance(assetName).rootNodes[0].getChildMeshes()[0] as Mesh;

        this.processMetaData(this.mesh.metadata.gltf.extras.vertexData)

        this.mesh.material = new VatMaterial("test", "VAT_texture")

    }

    private processMetaData(data: MetaData[]) {
        const uv2: number[] = [] // store index
        const uv3: number[] = [] // store min max X
        const uv4: number[] = [] // store min max X
        const uv5: number[] = [] // store min max X

        data.forEach(info => {
            uv2.push(info.index, 0.0)
            uv3.push(info.min_x, info.max_x)
            uv4.push(info.min_y, info.max_y)
            uv5.push(info.min_z, info.max_z)
        })

        this.mesh.setVerticesData(VertexBuffer.UV2Kind, uv2)
        this.mesh.setVerticesData(VertexBuffer.UV3Kind, uv3)
        this.mesh.setVerticesData(VertexBuffer.UV4Kind, uv4)
        this.mesh.setVerticesData(VertexBuffer.UV5Kind, uv5)
    }
}
