import path from "path";
import sharp from "sharp";



//=============CLIP AND TRANSFORM ATTRIBUTES==================
//TODO: Update these values
const numRows = 6; // # of rows in the photogrid
const numCols = 18; // # of columns in the photogrid
const totalImg = numRows * numCols; // Total number of images in the photogrid


const baseWidth = 480; //the dimensions are set by the camera. Depending on how the camera is mounted, width and height might be switched. right click an image in the farmbot app to see the base rotation
const baseHeight = 640;

const imgOriginRotation = 180; //Currently: Top Right. Bottom left: 0, Bottom right: 90, Top left: 270. Is applied in addition to the rotation value below
const rotation = 0 //-78.44; // In degrees. Set to 0 if "rotate image on capture" is enabled in the FarmBot App
const scale = 0.895;
const inverse = 1 / scale;

//Get these 4 values by inspecting the clip bath of an image on the farmbot app grid
const clipStartX = 43;
const clipStartY = 43;
const clipWidth = 343;
const clipHeight = 486;

const gridStartX = 168.8
const gridStartY = 240.399
const camOffsetX = 50
const camOffsetY = 70
const true_x_axis_length = 5764;
const true_y_axis_length = 2731.8;

//The position of an image is the position where the bot was when it took that image. from its position there is also an offset for the camera.
//Because we need the corner position we need to subtract the offset from the position and then substract/add that offset from/to each image position
const offsetX = gridStartX - camOffsetX;
const offsetY = gridStartY - camOffsetY;

//Scale is the pixel coordinate scale in relation to the farmbot coordinate system
// it means that 1 pixel in the image is 0.8674mm in the farmbot coordinate system

//these are coordinates on the field (in mm)
const userFieldStartX = 256//Math.round(256 * inverse)
const userFieldStartY = 49//Math.round(49 * inverse);

const userFieldWidth = 907//Math.round(907 * inverse)
const userFieldHeight = 873//Math.round(873 * inverse)

const userFieldCols = 6;
const userFieldRows = 3;

const directoryPath = useRuntimeConfig().photoGridPath;

async function transformAndCombineImages(imageUrls: string[], imageMeta: any[], debug: boolean) {
  try {


    // Calculate the size of the final image
    const finalWidth = numCols * clipWidth //* scale;
    const finalHeight = numRows * clipHeight// * scale;


    // Create a blank image to composite all transformed images onto
    let fullFieldImage = sharp({
      create: {
        width: finalWidth,
        height: finalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });


    // Process each image
    const imagePromises = imageUrls.map(async (imageUrl, index) => {

      const response = await fetch(imageUrl); //fetch image from url
      const buffer = await response.arrayBuffer();

      console.log(`Processing image ${index}...`);

      let image = sharp(Buffer.from(buffer))
        .resize({ width: Math.round(baseWidth * scale), height: Math.round(baseHeight * scale) }) // Scale the image
        .extract({ left: clipStartX, top: clipStartY, width: clipWidth, height: clipHeight }) // Clip the image
        .flip() //flip vertically
        .flop() //flip horizontally
        .rotate(rotation) // Rotate the image (if not already done by farmbot)



      const posX = Math.round(imageMeta[index].x - offsetX);

      const posY = Math.round(finalHeight - imageMeta[index].y - clipHeight + offsetY);

      // Return the image and its position
      return { input: await image.toBuffer(), left: posX, top: posY, blend: 'over' };
    });

    // Wait for all images to be processed
    const images = await Promise.all(imagePromises);

    // Composite images onto the final image
    await fullFieldImage.composite(images as sharp.OverlayOptions[]);

    
    // Downscale the final image
    // let downscaledImage = sharp(Buffer.from(fullFieldImage))
    // .resize({ width: Math.round(finalWidth * 0.5), height: Math.round(finalHeight * 0.5),});
    const tmp = await fullFieldImage.png().toBuffer();

    const tmpimg = sharp(tmp)


    let extracted_map_region = {
      left: Math.round(userFieldStartX+80),
      top: Math.round(userFieldStartY+130), //80 as the bed border stones are 8cm thick --> 80mm offset
      width: Math.round(userFieldWidth * userFieldCols),
      height: Math.round(userFieldHeight * userFieldRows)
    }

    const extracted = await tmpimg.extract(extracted_map_region);

    const buffer = await extracted.png().toBuffer();

    let date = new Date();
    let creationDate = date.toISOString().replace(/[:\-]|\.\d{3}/g, '').replace('T', '_').slice(0, -1)

    let photoGridData = [];

    //Sections
    let counter = 1;
    const resized_final_height = userFieldHeight * userFieldRows;

    for (let i = 1; i <= userFieldRows; i++) { //We start at 1 because here the origin in the top left but we start at the bottom, thus we want to add userFieldHeight once by default
      for (let j = 0; j < userFieldCols; j++) {
        const cutOutSharp = sharp(buffer);

        let extractRegion = { left:j * userFieldWidth, top: resized_final_height - i * userFieldHeight, width: userFieldWidth, height: userFieldHeight }


        let cutOutImg = await cutOutSharp.extract(extractRegion)

        const fileName = `user_field_${counter}_${creationDate}.png`
        const individualOutputPath = path.join(directoryPath, fileName);

        photoGridData.push({
          timestamp: date,
          gridId: counter,
          data: { imgUrl: './photoOverlay/' + fileName }
        });

        counter++;
        await cutOutImg.toFile(individualOutputPath);
        console.log(`${fileName} saved to:`, individualOutputPath);

      }
    }

    if (!debug) {
      await prisma.photoGrid.createMany({
        data: photoGridData,
        skipDuplicates: true, // Optional: skip duplicates if necessary
      });
    }


    // Save the final image
    let name = `combinedImage_${creationDate}.png`;
    const outputPath = path.join(directoryPath, name);
    await extracted.toFile(outputPath);
    console.log('Image processing complete. Output saved to:', outputPath);

    // Write the combined image to the database
    if (!debug) {
      await prisma.photoGrid.create({
        data: {
          timestamp: date,
          gridId: 19,
          data: { imgUrl: `./photoOverlay/${name}` },
        },
      });
    }

    if (!debug) {
      createTimelinePost('FarmBot', 0, 'Daily Photo Grid', 'A new photogrid is now available for the FarmBot map!', `./photoOverlay/${name}`, true);
    }
  } catch (error) {
    console.error('Error processing images:', error);
  }
}


export async function buildPhotoGrid(debug = false) {

  let allImages = await farmBotRESTCall('api/images', 'GET', { 'content-type': 'application/json' });

  let last = totalImg - 1; //index position, so actually its the last+1nth image

  let imageUrls = [];
  let imageMeta = [];

  for (let i = last; i >= 0; i--) { //reverse oder because the first image is the last one taken during the photogrid routine
    let curr = allImages[i];
    imageUrls.push(curr.attachment_url);
    imageMeta.push(curr.meta);
  }
  await transformAndCombineImages(imageUrls, imageMeta, debug);
}
