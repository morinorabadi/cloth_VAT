import { createCanvas } from "canvas"
import { readFile } from "fs/promises"
import { createWriteStream } from "fs"

const jsonAddress = "../data/data.json"

/**
 *  utils functions
 */
function findMax(numbers: number[]) {
    let max = numbers[0]
    numbers.forEach(num => {
        if (num > max) max = num
    });
    return max
}

function findMin(numbers: number[]) {
    let min = numbers[0]
    numbers.forEach(num => {
        if (num < min) min = num
    });
    return min
}

function float32ToRGBA(floatValue: number): [number, number, number, number] {
    const buffer = new ArrayBuffer(4); // Allocate 4 bytes
    const floatArray = new Float32Array(buffer);
    const uint8Array = new Uint8Array(buffer);

    // Store the float32 value in the buffer
    floatArray[0] = floatValue;

    // Extract the 4 bytes as RGBA values
    return [
        uint8Array[0], // R
        uint8Array[1], // G
        uint8Array[2], // B
        uint8Array[3], // A
    ];
}

function toStringg(number : number ){
    const string = number.toString(16)
    if (string.length === 1){
        return "0" + string 
    }
    return string
}
/**
 * read json data file
 */
type IVertexData = [number, number, number][][]
async function readJsonData() {
    const data = await readFile(jsonAddress, "utf8")
    return JSON.parse(data) as IVertexData
}

function groupVertex(data: IVertexData) {
    const result: IVertexData = []
    for (let frame = 0; frame < data.length; frame++) {
        const vertexPos = data[frame]
        for (let index = 0; index < vertexPos.length; index++) {
            const position = vertexPos[index];
            if (result[index] !== undefined) {
                result[index].push(position)
            } else {
                result[index] = [position]
            }
        }
    }
    return result
}

function createImage(data: IVertexData) {
    return new Promise((r) => {
        const width = data.length;
        const height = 6//data[0].length + 8;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        for (let index = 0; index < data.length; index++) {
            const vertexData = data[index];

            const minX = findMin(vertexData.map(a => a[0]))
            const maxX = findMax(vertexData.map(a => a[0]))

            const minY = findMin(vertexData.map(a => a[1]))
            const maxY = findMax(vertexData.map(a => a[1]))

            const minZ = findMin(vertexData.map(a => a[2]))
            const maxZ = findMax(vertexData.map(a => a[2]))

            const bufferNumber: number[] = [];

            // const minmax = [minX, maxX, minY, maxY, minZ, maxZ]
            const minmax = [0, 1, 2, 3, 4, 5]

            minmax.forEach(a => {
                const buffer = float32ToRGBA(a)
                buffer.forEach(b => bufferNumber.push(b))
            })

            if (index === 0) console.log(bufferNumber)

            for (let i = 0; i < bufferNumber.length; i += 4) {
                ctx.fillStyle = "#" + toStringg(bufferNumber[i]) + toStringg(bufferNumber[i + 1]) + toStringg(bufferNumber[i + 2]) + toStringg(bufferNumber[i + 3])
                // ctx.fillStyle = `rgba(${bufferNumber[i]}, ${bufferNumber[i + 1]}, ${bufferNumber[i + 2]},${bufferNumber[i + 3]})`;
                if (index === 0) console.log(ctx.fillStyle)
                ctx.fillRect(index, i / 3, 1, 1);
            }

            // for (let frame = 0; frame < vertexData.length; frame++) {
            //     const [X, Y, Z] = vertexData[frame];

            //     const r = Math.floor(((X - minX) / (maxX - minX)) * 255);
            //     const g = Math.floor(((Y - minY) / (maxY - minY)) * 255);
            //     const b = Math.floor(((Z - minZ) / (maxZ - minZ)) * 255);

            //     ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            //     ctx.fillRect(index, frame + 8, 1, 1);

            // }
        }

        // Save the canvas as a PNG file
        const out = createWriteStream("VAT_texture.png");
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        out.on("finish", () => r(undefined));
    })
}


async function run() {
    const data = await readJsonData()
    const groupData = groupVertex(data)
    await createImage(groupData)
}
void run()