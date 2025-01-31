import fs from 'fs';
import path from 'path';


/**
 * Draws the Photo Overlay over the field.
 * Currently, our y axis is inverted so we need to invert the y axis to display the image correctly.
 * This is because the canvas has its origin at the top left whereas the farmbot coordinate system has its origin at the bottom left.
 * This may be different in the future and different farmbot setups may have different coordinate systems.
 * 
 * Further, many of the parameters here have been hardcoded and are not dynamic. This is because they are always the same for every image on
 * our current setup. However, they may change
 * 
 * The values are derived from the orignal farmbot web app by inspecting the svg elements of the overlay
 * 
 * @param ctx 
 * @param images 
 * @param fieldheight 
 * @param scalingFactor 
 */
export function drawPhotoOverlay(ctx: CanvasRenderingContext2D, images: any, fieldheight: number, scalingFactor: number): Promise<void> {
  console.log(images.length)

  const rotation = -150.78
  const camOffsetX =  100 * scalingFactor // i dont know why but these values work
  const camOffsetY =  300 * scalingFactor
  
  
  const imagePromises = images.map((testImageInfo: any) => {
    return new Promise<void>((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
  
    reader.onloadend = function() {
      const base64data = reader.result;

      const svgDataUrl = createSvgWithImageClip(base64data as string, 640, 480, 99, 99, 471, 304, rotation);

      const scaledPosX = (testImageInfo.meta.x)* scalingFactor - camOffsetX;
      const scaledPosY =  (fieldheight - testImageInfo.meta.y )* scalingFactor - camOffsetY;


      img.onload = function() {

        const scaledWidth = img.width * scalingFactor;
        const scaledHeight = img.height * scalingFactor;

        ctx.drawImage(img, scaledPosX, scaledPosY, scaledWidth, scaledHeight);
        resolve();
      };

      img.src = svgDataUrl;
    };

    const proxyUrl = "https://cors-anywhere.herokuapp.com/"; //TODO: Once we have our own server, we can use that instead of this proxy
    const targetUrl = testImageInfo.attachment_url;

    fetch(proxyUrl + targetUrl)
      .then(response => response.blob()) 
      .then(blob => {
        reader.readAsDataURL(blob);
      })
      .catch(reject);
    //  reader.readAsDataURL(testImageInfo.attachment_url);
    });
  });
  return Promise.all(imagePromises).then(() => {});
}


function createSvgWithImageClip(url: string, imgW: number, imgH: number, clipX: number, clipY: number, clipWidth: number, clipHeight: number, rotation: number) {
  // Create an SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', clipHeight + 'px');
  svg.setAttribute('height', clipWidth + 'px');

  // Create an image element to embed the image
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
  image.setAttribute('width', '669.056');
  image.setAttribute('height', '501.792');
  image.style.transform = `rotate(${rotation})`;

  // Create a clipPath element to clip a section of the image
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', 'clip');
  clipPath.innerHTML = `<rect x="${clipX}" y="${clipY}" width="${clipWidth}" height="${clipHeight}" style="transform-origin: 335px 251px; transform: rotate(-150.78deg);"/>`;

  // Apply the clip path to the foreignObject
  image.style.clipPath = 'url(#clip)';
  image.style.transformOrigin = '335px 251px';
  image.style.rotate = '60.78deg';
  image.style.scale = '1 1';
  image.style.translate = '-183px -16px'

  // Append the foreignObject and clipPath to the SVG
  svg.appendChild(clipPath);
  svg.appendChild(image);

  // Convert the SVG to a data URL
  const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));

  return svgDataUrl;
}
