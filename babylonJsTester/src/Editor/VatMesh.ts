import { Mesh, VertexBuffer } from "@babylonjs/core";
import Editor from "./Editor";
import VatMaterial from "./VatMaterial";

export default class VatMesh {
    mesh: Mesh
    constructor(assetName: string) {
        const { assetManager } = Editor.GetInstance()
        this.mesh = assetManager.getInstance(assetName).rootNodes[0].getChildMeshes()[0] as Mesh;
        this.setUV2()

        this.mesh.material = new VatMaterial("test", "VAT_texture")

    }

    private setUV2() {
        const positions = this.mesh.getVerticesData(VertexBuffer.PositionKind)!
        const count = positions.length
        const uv2 = []
        for (let i = 0; i < positions.length; i += 3) {
            uv2.push(i / count, 0.0)
        }

        this.mesh.setVerticesData(VertexBuffer.UV2Kind, uv2)
    }
}
