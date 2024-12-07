import * as tf from '@tensorflow/tfjs-node'; // Make sure to use tfjs-node for local file support
import fs from 'fs';
import path from 'path';

let model;

async function loadModel() {
    if (!model) {
        const modelPath = path.resolve('submissions-model/model.json');
        const modelJson = fs.readFileSync(modelPath);
        model = await tf.loadLayersModel(`file://${modelJson}`);
    }
}

async function predictImage(file) {
    await loadModel();

    const imageBuffer = file.buffer;

    const image = await sharp(imageBuffer)
        .resize(224, 224)
        .raw()
        .toBuffer();

    const imageTensor = tf.tensor3d(image, [224, 224, 3], 'int32');
    const normalizedImage = imageTensor.div(tf.scalar(255));
    const inputTensor = normalizedImage.expandDims(0);

    const prediction = model.predict(inputTensor);
    const predictionValue = prediction.dataSync()[0];

    return predictionValue > 0.5 ? 'Cancer' : 'Non-cancer';
}
