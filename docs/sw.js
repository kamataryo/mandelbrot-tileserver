const MAX_TRIAL = 32;
const OSCILATION_THREASHOLD = 2
const RESOLUTION = 2
const BASE_LENGTH = 4; // determin xy at zoom 0

const canvas = new OffscreenCanvas(256 * RESOLUTION, 256 * RESOLUTION)
const context = canvas.getContext("2d"); // TODO webgl を試す

async function renderMandelbrot(tile_x, tile_y, tile_z) {

    function scale (input, index) {
        const length = BASE_LENGTH / 2 ** tile_z
        const offset =  1 / 2 - (2 ** tile_z) / 2 + index
        return length * (input / (256 * RESOLUTION - 1)) - (length / 2) + length * offset
    }

    for (let x = 0; x < 256 * RESOLUTION; x++) {
    for (let y = 0; y < 256 * RESOLUTION; y++) {
        let z_a = 0
        let z_b = 0
        let n = 0
        for (n = 0; n < MAX_TRIAL; n++) {
            const next_z_a = (z_a ** 2) - (z_b ** 2) + scale(x, tile_x)
            const next_z_b = (2 * z_a * z_b) + scale(y, tile_y)
            const abs = (z_a ** 2 + z_b ** 2) ** 0.5
            if(abs > OSCILATION_THREASHOLD) {
                break
            } else {
                z_a = next_z_a
                z_b = next_z_b
            }
        }
        if(n === MAX_TRIAL) {
            context.fillStyle = 'rgb(255 , 255 , 255)';
            context.fillRect(x,y,1,1);
        } else {
            const c = Math.round(255 * (MAX_TRIAL - n) / MAX_TRIAL)
            context.fillStyle = `rgb(${c}, ${c}, ${c})`;
            context.fillRect(x,y,1,1);
        }
        
    }
}

const blob = await canvas.convertToBlob({ type: "image/png" })
.then(blob => blob.arrayBuffer())
return blob
}

self.addEventListener('install', function(event) {
    // console.log(event)
})

self.addEventListener('fetch', function (event) {
    const match = event.request.url.match(/\#([0-9]+)\/([0-9]+)\/([0-9]+)\.png$/)
    if(match) {
    //     console.log({match})
        const [,str_z,str_x,str_y] = match
        const [x, y, z] = [str_x, str_y, str_z].map(value => parseInt(value, 10))
        return event.respondWith(renderMandelbrot(x, y, z).then(blob => new Response(blob)))
    } else {
        return fetch(event.request)

    }
})
