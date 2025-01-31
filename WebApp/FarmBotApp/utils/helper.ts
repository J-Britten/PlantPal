//this file holds various helper functions that process data provided by the FarmbotAPI

import { ref } from 'vue'

import { useConnectionStore } from '~/stores/clientSocketStore';
import { io } from 'socket.io-client';

import { useWeatherStore } from '~/stores/weatherStore';
//import  'open-crop-icons';


import 'vuetify/dist/vuetify.min.css'
import PlantField from '~/utils/plantField';

//const weedPositionsRef = ref(weedPositions);
import { useFarmbotStore } from '~/stores/farmbotStore';
import drawPhotoOverlay from '~/utils/farmBotPhotoOverlay';
import { jsx } from 'vue/jsx-runtime';
const farmbotStore = useFarmbotStore();
let tempctx: CanvasRenderingContext2D | null = null;
const weatherStore = useWeatherStore();

const showWeedListRef = ref(false);

const isSearching = ref(false);


//for single selection of plant
const canvas = ref(null);
const plantField = new PlantField();
let plantinitBool = ref(true);
let plantInfoBox: Ref<{ id: any; name: any; status: any; date: any; type: any; x: any; y: any; creator: any; water: any } | null> = ref(null);
let plantInfo = ref(false);
const blocked = ref([0, 0, 0, 0, 0]);


//Field 
var width = ref();
var height = ref();
let points = ref({});




/*var pixelscaleX= ref();
var pixelscaleY= ref();
*/
/**
 * 
 */
const canvasWidth = computed(() => canvas.value?.offsetWidth); //previously pixelscaleX, is based on the width of the canvas element, which via vue is set by the width of the column
const scalingFactor = computed(() => canvasWidth.value / width.value); //scaling factor for the canvas in relation to the actual, real field. 

const canvasHeight = computed(() => scalingFactor.value * height.value); //previously pixelScaleY height of the canvas element, calculated from the scaling factor and the height of the field


//var scalingFactorX = computed(() => pixelscaleX.value / width.value);
//var scalingFactorY = computed(() => pixelscaleY.value / height.value);

var currentField = ref(); // 0 for whole field, 1-4 for small fields
var initalize = ref(true); // wenn classe zum 1. mal aufgerufen wird, soll alles initalisiert werden

var showButtons = ref(false);
let dialogreturn = ref<number | null>(null);
let inputConfirmed = false;
let farmbotPosition = ref(null);
let tempPlantPosX = ref<null | Record<string, unknown> | number>(null);
let tempPlantPosY = ref<null | Record<string, unknown> | number>(null);
const dialog = ref(false);
const rotary = ref(false);
const Input_read = ref(false);

// Deklaration der Variable für den Input-Wert
const inputValue = ref('');
const namethePlant = ref(false);

// Funktion zum Lesen des Input-Werts
const readInput = () => {
    console.log('Input Value:', inputValue.value);
    namethePlant.value = false;
    Input_read.value = true;
    inputConfirmed = true;
};

const tooltip = ref({
    show: false,
    left: 0,
    top: 0
});

const imgWidth = 50; // Breite des Bildes
const imgHeight = 50; // Höhe des Bildes

const items = ref([
    { text: 'strawberry', icon: 'mdi-flower-poppy', spacing: '50', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '2 Weeks' },
    { text: 'runner-bean', icon: 'mdi-sprout', spacing: '50', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '3' },
    { text: 'flax', icon: 'mdi-sprout-outline', spacing: '30', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '3' },
    { text: 'Radieschen', icon: 'mdi-spa', spacing: '3', plantingTime: 'Spring', darkGermination: 'Yes', germinationtime: '1-2 weeks' },
    { text: 'Salat', icon: 'mdi-sprout', spacing: '20', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '2 Weeks' },
    { text: 'Tagetes', icon: 'mdi-flower-tulip', spacing: '1cm', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '1-2 weeks' },
    { text: 'Kornblume', icon: 'mdi-flower', spacing: '1cm', plantingTime: 'Spring', darkGermination: 'Yes', germinationtime: '1-2 weeks' },
    { text: 'Ringelblume', icon: 'mdi-flower', spacing: '1cm', plantingTime: 'Spring', darkGermination: 'No', germinationtime: '10 days' }
]);

const selectedPlant = ref<number | null>(null);
const collapsed = ref(false);

const selectPlant = (index: number) => {
    selectedPlant.value = index;

};

const toggleList = () => {
    collapsed.value = !collapsed.value;
};


onMounted(async () => {

    if (initalize.value) {
        await getAll();
        //  getTodos();

        initialiePlantList();

    }


    const canvasElement = await drawfield();

    getUsers();

    if (canvasElement) {

        //Initalisiert PlantList
        // initialiePlantList();
        canvasElement.addEventListener('click', async (event: MouseEvent) => {

            const rect = canvasElement.getBoundingClientRect(); // Get the position of the canvas on the page
            const x = event.clientX - rect.left; // Calculate mouse position relative to the canvas
            const y = -1 * (event.clientY - (canvasHeight.value + rect.top));

            if (currentField.value !== null && currentField.value !== 0) {

                const test = await getMouseposInMM(x, y);
                console.log('Mouse in function - X:', test.x, 'Y:', test.y);


                if (pictureSpot.value === true) { //Fotoevent

                    takeaPicture(test.x, test.y);

                }
                else if (isSearching.value === true) {
                    weed(test.x, test.y);
                    isSearching.value = false;

                }

                else if (selectedPlant.value !== null) { // Überprüfen, ob eine Pflanze zum pflanzen ausgewählt ist
                    // showTooltip(event);

                    //const test = await getMouseposInMM(x, y);
                    if (currentField.value !== 2 || currentField.value == 2 && test.x < blocked.value[0]) {
                        if (farmbotStore.userSettings.interactionLevel !== 0) {
                            showTooltip(event); //nicht im geblockten part
                            tempPlantPosX.value = test.x;
                            tempPlantPosY.value = test.y;
                        }


                    }



                } else {
                    showInfo(event, rect);

                }
            }

            // const test = getMouseposInMM(x,y); 
            // console.log('Mouse in function', test);






            if (currentField.value == 0) {

                //field seperation into smaller fields
                let i = farmbotStore.getI(canvasWidth.value, x, 1, farmbotStore.XLine, farmbotStore.YLine);
                let j = farmbotStore.getI(canvasHeight.value, y, 2, farmbotStore.XLine, farmbotStore.YLine);
                console.log('Mousepositions and fieldnumber', i, j, i + j * farmbotStore.XLine);
                console.log('Mousepositions and fieldnumber', width.value / farmbotStore.XLine * (i - 1), width.value / farmbotStore.XLine * i, 0, width.value / 5);
                currentField.value = i + j * farmbotStore.XLine;
                farmbotStore.currentField = currentField.value;
                changeField(canvasElement, width.value / farmbotStore.XLine * (i - 1), width.value / farmbotStore.XLine * i, height.value / farmbotStore.YLine * (j), height.value / farmbotStore.YLine * (j + 1));
            }
        }
        );

    }
});
/**draws canvas field normal size*/
async function drawfield() {
    // const canvas = ref(document.querySelector('canvas'));
    const canvasElement = canvas.value;
    console.log('1 Test', canvasElement);

    if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        console.log('1 Test', ctx);

        tempctx = ctx;
        if (ctx) {
            ctx.fillStyle = '#ccaa88';  // Set the fill color to brown  //rgba(102, 51, 0, 1.0)
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height); // Draw a filled rectangle covering the entire canvas
            //await drawPhotoOverlay(ctx, farmbotStore.currentGridImages, height.value, scalingFactor.value)
            drawGrid(ctx);
            console.log('1 Test', canvasElement, canvasElement.width, canvasElement.height);



            getPoints(ctx);
            // currentPos(ctx);

            // Grauen Bereich zeichnen, wenn globaler Wert größer ist als num1 und num2
            if (blocked.value[2] !== undefined && blocked.value[3] !== undefined) {
                ctx.fillStyle = 'gray';
                ctx.fillRect(0, canvasElement.height - blocked.value[3], blocked.value[2], blocked.value[3]); // Draw a filled rectangle covering the entire canvas
                //ctx.fillRect(blocked.value[2] , 0 , canvasElement.width, blocked.value[3]); // Draw a filled rectangle covering the entire canvas
                console.log('canvasprinted', canvasElement.height, blocked.value[3], farmbotStore.fieldpixelscaleY);
            }

        } else {
            console.error('2D context is not supported');
        }
        return canvasElement;
    }

}
/**draws choosen field part (1-4)*/
function changeField(canvasElement: HTMLCanvasElement, X0: number, X1: number, Y0: number, Y1: number) {
    const ctx = canvasElement.getContext('2d');

    if (ctx) {
        ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
        ctx.fillStyle = '#ccaa88';//'rgba(102, 51, 0, 1.0)';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        //Tools position left side 
        if (farmbotStore.getIfromFieldid(currentField.value, farmbotStore.XLine) == 1) {
            ctx.fillStyle = 'gray';

            ctx.fillRect(0, 0, blocked.value[4], canvasElement.height);


        }
        //drawRect(ctx, X0, X1, Y0, Y1, 'black', 2);

        // Neuzeichnen der Pflanzen im neuen Bereich
        drawGridsmall(ctx, farmbotStore.numberofFields / farmbotStore.XLine);
        getPointsofSmallField(ctx, X0, X1, Y0, Y1, X0, Y0);
        //currentPos(ctx); 





    }
}

/**gets the current positions of the plants in mm (whole field) and calculates it into pixels*/
async function getPoints(ctx: CanvasRenderingContext2D) {
    try {
        // const response = await $fetch('/api/FarmBot/REST/points');
        // const plantedPlants = response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');
        console.log(farmbotStore.plantedPlants, 'fstore');
        items.value.forEach(item => {
            console.log(item.text);
            const plant = farmbotStore.plantedPlants.filter((point: { openfarm_slug: string; }) => point.openfarm_slug === item.text);
            points.value = farmbotStore.plantedPlants;
            console.log(plant, 'fstore');
            plant.forEach((strawberry: { x: any; y: any; radius: any; }) => {

                if (currentField.value == 0) {
                    //   drawCircle(ctx, strawberry.x * (pixelscaleX.value / width.value), strawberry.y * (pixelscaleY.value /height.value), strawberry.radius * (pixelscaleX.value / width.value),'white');
                    drawSVG(ctx, strawberry.x * (canvasWidth.value / width.value), strawberry.y * (canvasHeight.value / height.value), strawberry.radius * (canvasWidth.value / width.value), item.text);
                    console.log('test plant position', strawberry.x, 'Y:', strawberry.y);

                }


            });
        });

        const plant = farmbotStore.plantedPlants.filter((point: { openfarm_slug: string; }) => point.openfarm_slug === 'weed');
        plant.forEach((strawberry: { x: any; y: any; radius: any; }) => {

            if (currentField.value == 0) {
                //   drawCircle(ctx, strawberry.x * (pixelscaleX.value / width.value), strawberry.y * (pixelscaleY.value /height.value), strawberry.radius * (pixelscaleX.value / width.value),'white');
                drawSVG(ctx, strawberry.x * (canvasWidth.value / width.value), strawberry.y * (canvasHeight.value / height.value), strawberry.radius * (canvasWidth.value / width.value), 'weed');
                console.log('test plant position', strawberry.x, 'Y:', strawberry.y);

            }


        });


    } catch (error) {
        console.error('Error fetching points:', error);
    }
}
/**gets the current position of the plants in mm (small field) and calculates it into pixels*/
async function getPointsofSmallField(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number, sizewidth: number, sizeheight: number) {
    try {
        //const response = await $fetch('/api/FarmBot/REST/points');
        //const plantedPlants = response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');


        items.value.forEach(item => {

            const plant = farmbotStore.plantedPlants.filter((point: { openfarm_slug: string; }) => point.openfarm_slug === item.text);
            console.log(plant);
            points.value = farmbotStore.plantedPlants;

            plant.forEach((f: { x: any; y: any; radius: any; }) => {

                if (f.x >= x0 && f.x <= x1 && f.y >= y0 && f.y <= y1) {

                    drawSVG(ctx, (f.x - sizewidth) * (canvasWidth.value / (x1 - x0)), (f.y - sizeheight) * (canvasHeight.value / (y1 - y0)), f.radius * (canvasWidth.value / (x1 - x0)), item.text);




                }
            });
        });
        const plant = farmbotStore.plantedPlants.filter((point: { openfarm_slug: string; }) => point.openfarm_slug === 'weed');
        plant.forEach((f: { x: any; y: any; radius: any; }) => {

            if (f.x >= x0 && f.x <= x1 && f.y >= y0 && f.y <= y1) {

                drawSVG(ctx, (f.x - sizewidth) * (canvasWidth.value / (x1 - x0)), (f.y - sizeheight) * (canvasHeight.value / (y1 - y0)), f.radius * (canvasWidth.value / (x1 - x0)), 'weed');




            }
        });

    } catch (error) {
        console.error('Error fetching points:', error);
    }
}



function drawSVG(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, name: string) {
    console.log('Placing SVG at position', x, y);
    y = canvasHeight.value - y;

    var img = new Image();
    if (name == 'strawberry') {
        img.src = imageSource;
        // todo change image
    } else if (name == 'runner-bean') {
        img.src = imageSource;
        // todo change image
    } else if (name == 'flax') {
        img.src = imageSource;
        // todo change image
    } else if (name == 'weed') {
        img.src = imageSource;
        // todo change image
    } else if (name == 'bot') {
        img.src = robo;

    } else if (name == 'Salat') {
        img.src = salat;
    } else if (name == 'Radieschen') {
        img.src = raddi;
    }


    //img.src = 'https://github.com/FarmBot/Farmbot-Web-App/blob/staging/public/app-resources/img/icons/weeds.svg';
    img.onload = function () {

        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        console.log('pic drawn');

        img.onclick = function (event) {


            const rect = img.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            console.log('Klick auf Bild bei Position:', mouseX, mouseY);

            // const rect = (event.target as HTMLImageElement).getBoundingClientRect();

        };


    };



}

export default function getPositioninMM(x: number, y: number, ){

}

/**gets the Mouseposition of the click EVenthandler and  converts it into mm */
async function getMouseposInMM(x: number, y: number) {
    let positionXInMM: number, positionYInMM: number;
    if (currentField.value == 0) {

        positionXInMM = x * (width.value / canvasWidth.value);
        positionYInMM = y * (height.value / canvasHeight.value);

        return { x: positionXInMM, y: positionYInMM }
        //  return position;
    } else {
        let i = farmbotStore.getIfromFieldid(farmbotStore.myfield, farmbotStore.XLine);//////
        console.log('mousepos', i);
        let xmm = x * ((width.value / farmbotStore.XLine) / canvasWidth.value) + ((i - 1) * (width.value / farmbotStore.XLine));
        console.log('mouseposxmm', xmm, width.value, width.value / farmbotStore.XLine, x, x * ((width.value / farmbotStore.XLine) / canvasWidth.value));

        let ymm = y * ((height.value / farmbotStore.YLine) / canvasHeight.value) + ((farmbotStore.getJfromFieldid(farmbotStore.myfield, i, farmbotStore.XLine, farmbotStore.YLine) - 1) * (height.value / farmbotStore.YLine));
        console.log('mouseposymm', ymm);

       
        positionXInMM = xmm;
        positionYInMM = ymm;
      
        return { x: positionXInMM, y: positionYInMM };
    }


    //  var positionXInmm = x*(width.value/pixelscaleX.value);
    //  var positionYInmm = y*(height.value/pixelscaleY.value);

}
/**get current Fieldsize of the farmbot in mm and calculates the px depending on the size of the window*/
const { data } = useAuth();

async function getAll() {


    if (Object.keys(farmbotStore.fieldwidth).length === 0 && Object.keys(farmbotStore.fieldpixelscaleX).length === 0) {

        farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
        farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');


        width.value = farmbotStore.fieldwidth;
        height.value = farmbotStore.fieldheight;
        console.log(farmbotStore.fieldwidth.value, farmbotStore.fieldwidth, 'height');
        console.log(height.value, 'height');
        console.log(width.value, 'width');
        farmbotStore.fieldpixelscaleX.value = canvasWidth.value;

        //canvasHeight.value = canvasWidth.value/width.value*height.value;
        farmbotStore.fieldpixelscaleY.value = canvasHeight.value;
        currentField.value = 0;
        farmbotStore.currentField = currentField.value;


        const blockedX = 130;
        //const blockedX = width.value - 130;
        //const blockedY = width.value - 680;
        const blockedY = 1200;
        const bXpx = blockedX * (canvasWidth.value / width.value); //gesamt Feld
        const bYpx = blockedY * (canvasHeight.value / height.value); // gesamt Feld
        //const bXField2px = (blockedX -(width.value/2))*  (canvasWidth.value/(width.value/2)); // Feld 1
        const bXField2px = (blockedX * (canvasWidth.value / (width.value / farmbotStore.XLine))); // Feld 1


        blocked.value = [blockedX, blockedY, bXpx, bYpx, bXField2px];
        farmbotStore.blocked = blocked.value;


    } else {
        currentField.value = 0;
        farmbotStore.currentField = currentField.value;

        height.value = farmbotStore.fieldheight;


        width.value = farmbotStore.fieldwidth;
        canvasWidth.value = farmbotStore.fieldpixelscaleX.value;
        canvasHeight.value = farmbotStore.fieldpixelscaleY.value;
        blocked.value = farmbotStore.blocked;

    }

    assigneFieldnumber();

    initalize.value = false;
}

const posOfFarmbot = ref({
    x: 50,
    y: 50
});

let posOfFarmbotShow = ref(false);
watchEffect(() => {
    const ConnectionStore = useConnectionStore();

    let i = farmbotStore.getI(width.value, ConnectionStore.farmbotPosition.x, 1, farmbotStore.XLine, farmbotStore.YLine);
    let j = farmbotStore.getI(height.value, ConnectionStore.farmbotPosition.y, 0, farmbotStore.XLine, farmbotStore.YLine);
    let usedField = i + (j * farmbotStore.XLine);
    if (currentField.value == 0) {

        posOfFarmbot.value.x = ConnectionStore.farmbotPosition.x * (canvasWidth.value / width.value);
        posOfFarmbot.value.y = canvasHeight.value - (ConnectionStore.farmbotPosition.y * (canvasHeight.value / height.value));
        posOfFarmbotShow.value = true;
    } else {
        posOfFarmbot.value.x = (ConnectionStore.farmbotPosition.x / farmbotStore.XLine) * ((canvasWidth.value) / (width.value / farmbotStore.XLine));
        posOfFarmbot.value.y = (canvasHeight.value) - (ConnectionStore.farmbotPosition.y * (canvasHeight.value / (height.value / farmbotStore.YLine)));

        if (currentField.value == usedField) {
            posOfFarmbotShow.value = true;

        } else {
            posOfFarmbotShow.value = false;

        }
    }

    console.log('reference updatet', i, j, usedField);
});


/**get currentPosition of the Farmbot */
async function currentPos(ctx: CanvasRenderingContext2D) {
    const ConnectionStore = useConnectionStore();
    console.log('farmbot Pos entered', ConnectionStore.farmbotPosition.x);


    if (ConnectionStore.farmbotPosition !== null) {
        const { x, y, z } = ConnectionStore.farmbotPosition.value;

        console.log('farmbot Pos', ConnectionStore.farmbotPosition.value);

    }

}

/** Back Button -> Back to whole field */
async function goBack() {
    initialiePlantList();
    currentField.value = 0;
    farmbotStore.currentField = currentField.value;

    showButtons.value = false; // Hide additional buttons
    selectedPlant.value = null;
    tooltip.value.show = false;
    plantInfoBox.value = null;
    showPlantCircle.value = false;
    showWeedListRef.value = false;
    pictureSpot.value = false;
    namethePlant.value = false;
    drawfield(); // Redraw the field
    farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
    farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');
    plantInfo.value = false;
    switchValue.value = false;
}


///**------------------------------------------------------------------------------------Planting System------------------------------------------- */


function showPlants() {

    showButtons.value = true;

}
function getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function plantSelectedPlant(name: any, radius: any) {
    if (selectedPlant !== null && farmbotStore.userSettings.interactionLevel == 0) {
        let x = getRandomValue(farmbotStore.xBorder, farmbotStore.xUpperBorder);
        let y = getRandomValue(farmbotStore.yBorder, farmbotStore.yUpperBorder);
        const test = await getMouseposInMM(x, y);
        tempPlantPosX.value = test.x;
        tempPlantPosY.value = test.y;
    }
    if (selectedPlant !== null && tempPlantPosX.value !== null && tempPlantPosY.value !== null) {

        let tempneighbor = false;


        let x_plant: number;
        let y_plant: number;

        if (typeof tempPlantPosX.value === 'number' && typeof tempPlantPosY.value === 'number') {
            x_plant = tempPlantPosX.value;
            y_plant = tempPlantPosY.value;



            console.log('Pflanze wird an Position gepflanzt - X:', x_plant, 'Y:', y_plant, 'name', name, 'radius', radius);

            // const response = await $fetch('/api/FarmBot/REST/points');
            // const plantedPlants = response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');

            farmbotStore.plantedPlants.forEach((temp: { x: any; y: any; radius: any }) => {


                var tx = temp.x - x_plant;
                var ty = temp.y - y_plant;
                console.log('plant', temp.x, temp.y, 'tx', tx, 'ty', ty);
                console.log(Math.sqrt((tx * tx) + (ty * ty)));
                if (Math.sqrt((tx * tx) + (ty * ty)) < temp.radius) {
                    tempneighbor = true;

                    // schauen ob es in radius von etwas anderem ist nicht nur im eigenen 
                    //TODO danach abbrechen
                }

            });
            if (tempneighbor && farmbotStore.userSettings.interactionLevel == 0) {
                plantSelectedPlant(name, radius);
                return;

            }
            if (tempneighbor) {

                console.log('Nachbar');
                dialog.value = true;
                const result = await waitForDialogReturn();

                if (result === 1) {
                    console.log('Dialog-Rückgabewert ist 1.');
                    dialogreturn.value = null;
                    tempneighbor = false;

                } else if (result === 0) {
                    console.log('Dialog-Rückgabewert ist 0.');
                    selectedPlant.value = null;
                    tempPlantPosX.value = null;
                    tempPlantPosY.value = null;

                } dialogreturn.value = null;



            }
            if (!tempneighbor) {
                console.log('kein nachbar');
                //queueSocketsend
                //const socket = io();
                const message = {
                    type: 'getTool',
                    data: {
                        x: x_plant,
                        y: y_plant,
                        z: 0
                    },
                    name: 'seeder',
                    plant: name
                };

                ConnectionStore.socket.emit('farmbot', message);
                //socket.emit('farmbot', message); //muss erst getestet werden

                /**pflanze über server updaten*/
                tooltip.value.show = false;
                selectedPlant.value = null;
                showButtons.value = false;
                namethePlant.value = true;

                const inputValueResult = await waitForInputValue();
                console.log('Input Value Test:', inputValueResult);
                const currentDate = new Date().toISOString();


                const body = {
                    x: x_plant,
                    y: y_plant,
                    name: inputValueResult,
                    pointer_type: 'Plant',
                    openfarm_slug: name,
                    meta: {
                        planted_by: data.value?.user?.name // wer hat gepflanzt
                    },
                    planted_at: currentDate,
                    plant_stage: 'planted'

                };


                const t = await $fetch('/api/FarmBot/REST/posts', {
                    method: 'post',
                    body: body
                });
                const plants = await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/group`);
                plants.point_ids.push(t.id);

                const bodyWeed = {
                    point_ids: plants.point_ids

                };
                await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/groups`, {
                    method: 'put',
                    body: bodyWeed
                });

                addPlantToPlantfield(t.id, x_plant, y_plant, t.radius, name);
                farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
                farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');

                //Todo draw

            }
            tooltip.value.show = false;
            selectedPlant.value = null;
            tempPlantPosX.value = null;
            tempPlantPosY.value = null;
            inputValue.value = "";


        } else {
            console.log('kein wert');

        }

    }
}
function closeDialog(option: string, typ: string) {
    if (typ == 'dialog') {
        dialog.value = false; // Close the dialog

        if (option === 'plant') {
            dialogreturn.value = 1;
            return (1);
        } else {
            dialogreturn.value = 0;

            return (0);
        }
    }
    else {
        rotary.value = false; // Close the dialog rotary

        if (option === 'yes') {
            dialogreturn.value = 1;
            return (1);
        } else {
            dialogreturn.value = 0;

            return (0);
        }

    }
}

let inforeturn = ref<number | null>(null);



function waitForInputValue() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            // Prüfen, ob der Button geklickt wurde und das Textfeld nicht leer ist
            if (inputValue.value !== null && inputValue.value.trim() !== '' && inputConfirmed) {
                clearInterval(interval);
                resolve(inputValue.value);
            }
        }, 100); // Überprüfung alle 100 Millisekunden
    });
}
async function waitForDialogReturn(): Promise<number | null> {
    while (dialogreturn.value === null) {

        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return dialogreturn.value;
}




const showTooltip = (event: MouseEvent) => {
    const halfImgWidth = imgWidth / 2;
    const imgBottom = event.clientY;

    // Position des Tooltips 
    tooltip.value.show = true;
    tooltip.value.left = event.clientX - halfImgWidth;
    tooltip.value.top = imgBottom - imgHeight;
};

//**--------------------------------------------------------------------------------Informations about selected plants-------------------------------------------- */
const showPlantCircle = ref(false);
const circleX = ref(0);
const circleY = ref(0);
const circleColor = ref('blue');
const showPlantInfo = ref(false);
const currentPlantid = ref(-1);



const showInfo = (event: MouseEvent, rect: DOMRect) => {
    // Calculate mouse position relative to the canvas
    const x = event.clientX - rect.left;
    const y = -1 * (event.clientY - (canvasHeight.value + rect.top));


    const plantId = plantField.getPlants(farmbotStore.myfield, x, y);
    console.log('Pflanze gefunden mit ID:', plantId, event.clientX, event.clientY, x, y);
    if (plantId != -1) {


        if (!showPlantInfo.value || plantId !== currentPlantid.value) {
            circleX.value = event.clientX;
            circleY.value = event.clientY;
            circleColor.value = 'green';
            showPlantCircle.value = true;
            showButtons.value = false;
            waterinfo(plantId);

            currentPlantid.value = plantId;
        }
    }
};


//**---------------------------------------------------------------------------positions of Plants safed in PlantList ------------------------------------------------- */
async function addPlantToPlantfield(id: any, x: any, y: any, radius: any, plant: any) {
    const tempX = width.value / farmbotStore.XLine;
    const tempY = height.value / farmbotStore.YLine;
    let i = farmbotStore.getIfromFieldid(farmbotStore.myfield, farmbotStore.XLine);
    let j = farmbotStore.getJfromFieldid(farmbotStore.myfield, i, farmbotStore.XLine, farmbotStore.YLine);

    const tx = (x - (tempX * (i - 1))) * (canvasWidth.value / tempX);
    const ty = (y - (tempY * (j - 1))) * (canvasHeight.value / (tempY));
    const r = radius * (canvasWidth.value / (tempX));

    plantField.addPlant(farmbotStore.myfield, tx - r, ty - r, tx + r, ty + r, id);
    drawSVG(tempctx, tx, ty, r, plant);

}


async function initialiePlantList() {


    if (plantinitBool) {

        // const response = await $fetch('/api/FarmBot/REST/points');
        // const plantedPlants = response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');
        const tempX = width.value / farmbotStore.XLine;
        const tempY = height.value / farmbotStore.YLine;

        for (let j = 1; j <= farmbotStore.YLine; j++) {
            for (let i = 1; i <= farmbotStore.XLine; i++) {
                farmbotStore.plantedPlants.forEach((f: { x: any; y: any; radius: any; id: number }) => {
                    if (f.x <= tempX * i && f.x >= tempX * (i - 1) && f.y <= tempY * j && f.y >= tempY * (j - 1)) {

                        const tx = (f.x - (tempX * (i - 1))) * (canvasWidth.value / (tempX * i - (tempX * (i - 1))));
                        const ty = (f.y - (tempY * (j - 1))) * (canvasHeight.value / (tempY * j - (tempY * (j - 1))));
                        const r = f.radius * (canvasWidth.value / (tempX * i - (tempX * (i - 1))));

                        plantField.addPlant((i + ((j - 1) * farmbotStore.YLine)), tx - r, ty - r, tx + r, ty + r, f.id);
                        console.log('added plant at 3', (i + ((j - 1) * farmbotStore.YLine)), tx - r, ty - r, tx + r, ty + r, f.id);


                    }





                });
            }

        }
        plantinitBool.value = false;
    }

}



//**------------------------------------------------------------------------------ select Plant + water Plant------------------------------------------- */


interface SelectedPlantFromField {
    id: any;
    x: any;
    y: any;
}

const plantsforwatering: Ref<SelectedPlantFromField[] | null> = ref([]);

const switchValue = ref<boolean>(false);
async function waterinfo(plantid: number) {
    if (switchValue.value == false) {
        plantInfo.value = true;
        try {
            //const response = await $fetch('/api/FarmBot/REST/points');
            const plantedPlants = farmbotStore.response.find((point: { id: number; }) => point.id === plantid);


            if (plantedPlants) {
                plantInfoBox.value = {
                    id: plantedPlants.id,
                    name: plantedPlants.name,
                    status: plantedPlants.plant_stage,
                    date: plantedPlants.planted_at,
                    type: plantedPlants.openfarm_slug,
                    x: plantedPlants.x,
                    y: plantedPlants.y,
                    creator: plantedPlants.meta.planted_by,
                    water: plantedPlants.meta.last_watered

                };



                console.log(plantedPlants.name, plantedPlants.plant_stage, plantedPlants.planted_at);
            } else {
                console.log('no plant found');
            }

        } catch (error) {
            console.error('error', error);
        }
    }
    else {

        try {
            // const response = await $fetch('/api/FarmBot/REST/points');
            const plantedPlants = farmbotStore.response.find((point: { id: number; }) => point.id === plantid);
            if (plantsforwatering.value?.length !== undefined) {
                plantsforwatering.value.push({
                    id: plantedPlants.id,
                    x: plantedPlants.x,
                    y: plantedPlants.y
                });
                console.log('added');
            } else {
                // Wenn plantsforwatering.value null 
                plantsforwatering.value = [{
                    id: plantedPlants.id,
                    x: plantedPlants.x,
                    y: plantedPlants.y
                }];
                console.log('initialized with one item');
            }

        }
        catch (error) {
            console.error('error', error);
        }



    }






}

async function water(x: any, y: any, id: any) {
    console.log('watering ongoing');
    //circle blue

    const socket = io();
    const message = {
        type: 'getTool',
        data: {
            x: x,
            y: y,
            z: 0
        },
        name: 'water',
        plant: ''
    };


    ConnectionStore.socket.emit('farmbot', message); //muss erst getestet werden

    const t2 = await $fetch(`/api/FarmBot/REST/${id}/pointid`);
    console.log(t2, 't2');
    let timediff = await longert2Days(t2.meta.last_watered);
    console.log(timediff);

    if (timediff) {
        console.log('yes');

        farmbotStore.waterTodo = farmbotStore.waterTodo - 1;
        farmbotStore.todobadget = farmbotStore.todobadget - 1;
    }
    /*const currentDate = new Date();
    const lastWateredDate = new Date(t2.meta.last_watered);
    const diffInMilliseconds = currentDate.getTime() - lastWateredDate.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
    
    if (diffInDays > 2) {
      farmbotStore.waterTodo = farmbotStore.waterTodo-1;
      farmbotStore.todobadget = farmbotStore.todobadget-1;
    }
    */
    const currentDate2 = new Date().toISOString();

    const body = {
        id: id,
        meta: {
            last_watered: currentDate2
        }

    };


    const t = await $fetch('/api/FarmBot/REST/point', {
        method: 'put',
        body: body
    });



}

//------------------------------------------------------------Measurement at adifferent spot todo + post to server ? + open information-------------
async function measureMoisture(x: any, y: any, id: any) {
    //Todo moisture Measurement
    console.log('Measure Moisture ongoing');

    //const socket = io();
    const message = {
        type: 'getTool',
        data: {
            x: x,
            y: y,
            z: 0
        },
        name: 'soil',
        plant: ''
    };
    //socket.emit('farmbot', message); //muss erst getestet werden

    //update Farmbot server
    const t = await $fetch('/api/FarmBot/REST/sensor');
    console.log(t, 'soil');
    const value = t.filter((point: { pin: number; }) => point.pin === 59);
    const pin59Values = value.map((point: { value: number; }) => point.value);
    console.log('valuewerte', pin59Values[0], pin59Values);

}


let moisturevalue = ref(0);
let showmoisturevalue = ref(false);

async function getMoisture() {

    const t = await $fetch('/api/FarmBot/REST/sensor');
    console.log('moisture', t)
    const value = t.filter((point: { pin: number; x: any; y: any; updated_at: string; }) => {
        return point.pin === 59 &&
            point.x > farmbotStore.xBorder &&
            point.x < farmbotStore.xUpperBorder &&
            point.y > farmbotStore.yBorder &&
            point.y < farmbotStore.yUpperBorder
    });
    console.log('value', value);
    value.sort((a: any, b: any) => {
        const timestampA = new Date(a.updated_at);
        const timestampB = new Date(b.updated_at);
        return timestampB.getTime() - timestampA.getTime(); // Absteigend sortieren (neueste zuerst)
    });
    //const value = t.filter((point: { pin: number; }) => point.pin === 59);
    //const pin59Values = t.map((point: { value: number; }) => point.value);
    console.log('valuewerte', t, value[0].value, value);
    moisturevalue.value = value[0].value;
    showmoisturevalue.value = true;
}

//**-------------------------------------------------------------Take a picture-------------------------------------------------------- */
let picUrl = ref(null);
let showPicture = ref(false);
//** searching for current picture  */
async function commitPic(currentDate: any) {
    //const pics = response.find((point: { created_at: any; }) => created_at === '');
    console.log(currentDate, 'pic');
    while (!picUrl.value || picUrl.value === 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing..' || picUrl.value === 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing') {
        const response: any[] = await $fetch('/api/FarmBot/REST/pic');

        for (const point of response) {
            const pointDate = new Date(point.created_at).toISOString();;
            console.log('pic', pointDate);



            if (pointDate > currentDate) {
                picUrl.value = point.attachment_url;
                console.log('found', picUrl.value);
                break; // Abbruch der Schleife, sobald ein passendes Element gefunden wurde
            }
        }
    }
    showPicture.value = true;



}
//** gets current image based on time  */
async function takeaPicture(x: any, y: any) {
    pictureSpot.value = false;
    const currentDate = new Date().toISOString();
    console.log(currentDate);

    //const socket = io();

    const message = {
        type: 'pic',
        data: {
            x: x,
            y: y,
            z: -100
        },
        name: '',
        plant: ''
    };

    ConnectionStore.socket.emit('farmbot', message);

    ConnectionStore.socket.on('farmbot-action-complete', (response: { success: any; error: any; }) => {
        console.log('Received farmbot action complete:', response);

        if (response.success) {
            console.log('Farmbot action successful');

            commitPic(currentDate);

        } else {
            console.error('Farmbot action failed:', response.error);
        }
    });
    //await commitPic(currentDate);


    //über uhrzeit aktuelles bild empfangen

}

//**--------------------------------------------------Rotary Tool---------------------------------------------------------- */
//** removes Plant with rotary */
async function removePlant(x: any, y: any, id: any) {
    rotary.value = true;  // nachfragen sicher?
    const result = await waitForDialogReturn();


    if (result === 0) {
        console.log('rotary start');



        const message = {
            type: 'getTool',
            data: {
                x: id,
                y: 0,
                z: 0
            },
            name: 'rotary',
            plant: ''
        };


        ConnectionStore.socket.emit('farmbot', message); //muss erst getestet werden


        const body = {
            id: id,
            plant_stage: "removed"

        };


        const t = await $fetch('/api/FarmBot/REST/point', {
            method: 'put',
            body: body
        });

        plantField.removePlant(currentField.value, id); // remove aus plantList mit plantid  

        farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
        farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');

    } else if (result === 1) {
        console.log('rotary stop');


    } dialogreturn.value = null;



}


//**-------------------------------------------------------------multiple select------------------------------------------------------ */
async function longert2Days(meta: string | number | Date) {

    const currentDate = new Date();
    const lastWateredDate = new Date(meta);
    const diffInMilliseconds = currentDate.getTime() - lastWateredDate.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
    if (diffInDays >= 2) return true;
    return false;

}

function waterAll() {
    if (plantsforwatering.value !== null) {


        const socket = io();
        const message = {
            type: 'water',
            data: plantsforwatering.value,
            name: ''

        };


        //ConnectionStore.socket.emit('farmbotList', message); //muss erst getestet werden
        const currentDate = new Date().toISOString();

        plantsforwatering.value.forEach(async plant => {
            const t2 = await $fetch(`/api/FarmBot/REST/${plant.id}/pointid`);
            console.log(t2, 't2');
            let timediff = await longert2Days(t2.meta.last_watered);
            if (timediff) {

                farmbotStore.waterTodo = farmbotStore.waterTodo - 1;
                farmbotStore.todobadget = farmbotStore.todobadget - 1;
            }
            const body = {
                id: plant.id,
                meta: {
                    last_watered: currentDate
                },


            };
            /*const t = await $fetch('/api/FarmBot/REST/point', {
              method: 'put',
              body: body
            });
                */
        });

        plantsforwatering.value = null;
        showPlantCircle.value = false;
    }

}
let waterqueue = ref(false);
async function waterAllOfOneField() {
    let currentid = farmbotStore.curentPlantid;
    console.log(currentid);

    //   const socket = io();
    const message = {
        type: 'waterAll',
        data: {
            x: currentid,
            y: 0,
            z: 0
        },
        name: ''

    };


    ConnectionStore.socket.emit('farmbot', message);
    const currentDate = new Date().toISOString();
    //let plants = await $fetch(`/api/FarmBot/REST/getgroup${currentid}`);
    //let plants = await $fetch(`/api/FarmBot/REST/getgroup${currentid}`);
    const plants = await $fetch(`/api/FarmBot/REST/${currentid}/group`);

    console.log(plants, 'plants');
    const pointIds = plants.point_ids;

    pointIds.forEach(async (id: any) => {

        const body = {
            id: id,
            meta: {
                last_watered: currentDate
            }


        };
        await $fetch('/api/FarmBot/REST/point', {
            method: 'put',
            body: body
        });

        farmbotStore.todobadget = farmbotStore.todobadget - farmbotStore.waterTodo;
        farmbotStore.waterTodo = 0;
    });

    waterqueue.value = true;


}



//**----------------------------------------------------------------------Weed Detection ---------------------------------------------- */
let pictureSpot = ref(false);
let picturefoundongoing = ref(false);
let noWeedfound = ref(false);

//List of found weed
interface WeedPosition {
    id: number;
    x: number;
    y: number;
}

/**Weed removal for engagementlevel 1  */
let weedSimple = ref(false);
let found = ref(false);

async function loadWeed() {

    // const response = await $fetch('/api/FarmBot/REST/points');
    const Weed = farmbotStore.response.filter((point: { pointer_type: string; }) => point.pointer_type === 'Weed');

    console.log('weed', Weed);
    const Weed_pending = Weed.filter((point: { plant_stage: string; x: number; y: number; }) => {
        return (
            // point.plant_stage === 'active' &&
            point.plant_stage === 'pending' &&
            point.x <= farmbotStore.xUpperBorder &&
            point.x >= farmbotStore.xBorder &&
            point.y <= farmbotStore.yUpperBorder &&
            point.y >= farmbotStore.yBorder


        );
    });
    if (Weed_pending.length > 0) {
        found.value = true;
    }
    weedSimple.value = true;
    const result = await waitForDialogReturn();

    if (result === 1) {
        //remove weed in field
        const message = {
            type: 'weedSimple',
            data: {
                x: farmbotStore.curentPlantid,
                y: 0,
                z: 0
            },
            name: '',
            plant: ''
        };
        ConnectionStore.socket.emit('farmbot', message);
        //update weeds

        console.log('weed removed');

        dialogreturn.value = null;
    }
    else {

        Weed_pending.forEach(async (point: { id: number, x: any, y: any }) => {
            const body2 = {
                x: point.x,
                y: point.y,
                name: 'Weed',
                pointer_type: 'Plant',
                openfarm_slug: 'weed',
                meta: {
                    planted_by: data.value?.user?.name,
                    last_watered: '',
                },
                planted_at: new Date().toISOString(),
                plant_stage: 'planted'

            };

            const t = await $fetch('/api/FarmBot/REST/posts', {
                method: 'post',
                body: body2
            });
            const plants = await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/group`);
            plants.point_ids.push(t.id);

            const bodyWeed = {
                point_ids: plants.point_ids

            };
            await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/groups`, {
                method: 'put',
                body: bodyWeed
            });
            addPlantToPlantfield(t.id, point.x, point.y, t.radius, 'weed');
            farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
            farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');

            console.log(t);
        });
        dialogreturn.value = null;

    }
    Weed_pending.forEach(async (point: { id: number }) => {
        const body = {
            id: point.id,
            plant_stage: 'removed'

        };



        const t = await $fetch('/api/FarmBot/REST/point', {
            method: 'put',
            body: body
        });
    });
    farmbotStore.todobadget = farmbotStore.todobadget.value - Weed_pending.length;
    farmbotStore.weedTodo = 0;
}

async function weed(x: number, y: number) {


    console.log('weed managemnet moving to position');
    const currentDate = new Date().toISOString();
    console.log(currentDate);

    //  const socket = io();

    const message = {
        type: 'weedDetection',
        data: {
            x: x,
            y: y,
            z: -200
        },
        name: '',
        plant: ''
    };

    // ConnectionStore.socket.emit('farmbot', message); 

    socket.on('farmbot-action-complete', async (response: { success: any; error: any; }) => {
        console.log('Detection completed', response);

        if (response.success) {
            console.log('Farmbot action successful');

            let picturefound = false;
            //while ((!picUrlWeed.value || picUrlWeed.value === 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing') && !picturefound){
            while (!picturefound) {
                const response: any[] = await $fetch('/api/FarmBot/REST/pic');
                picturefoundongoing.value = true;

                for (const point of response) {
                    const pointDate = new Date(point.created_at).toISOString();;
                    console.log('pic', pointDate);



                    if (pointDate > currentDate && point.attachment_url !== 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing' && picUrlWeed.value !== 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing..') {
                        if (picUrlWeed.value !== null && picUrlWeed.value !== point.attachment_url && picUrlWeed.value !== 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing' && picUrlWeed.value !== 'https://my.farm.bot/placeholder_farmbot.jpg?text=Processing..') {
                            picUrlWeedDetected.value = point.attachment_url;
                            console.log('found2', picUrlWeedDetected.value);
                            picturefound = true;
                            break;
                        } else {

                            picUrlWeed.value = point.attachment_url;
                            console.log('found1', picUrlWeed.value);
                        }
                    }
                }

            }
            picturefoundongoing.value = false;

            //selecting All WeedPlants 
            console.log('entering fetch part');
            //const response = await $fetch('/api/FarmBot/REST/points');
            const Weed = farmbotStore.response.filter((point: { pointer_type: string; }) => point.pointer_type === 'Weed');
            //  const Weed_pending = Weed.filter((point: {plant_stage: string; }) => point.plant_stage === 'pending');
            let xBorder = ref(0);
            let xUpperBorder = ref(0);
            let yBorder = ref(0);
            let yUpperBorder = ref(0);
            if (currentField.value == 1) {
                xUpperBorder.value = width.value / 2;
                yUpperBorder.value = height.value;
                yBorder.value = height.value / 2;



            }
            else if (currentField.value == 2) {
                xBorder.value = width.value / 2;
                xUpperBorder.value = width.value;
                yUpperBorder.value = height.value;
                yBorder.value = height.value / 2;


            } else if (currentField.value == 3) {
                xUpperBorder.value = width.value / 2;
                yUpperBorder.value = height.value / 2;
                console.log(xUpperBorder.value,
                    yUpperBorder.value);
            }
            else {

                xBorder.value = width.value / 2;
                xUpperBorder.value = width.value;
                yBorder.value = height.value / 2;


            }
            console.log(Weed);
            console.log(xBorder.value, yBorder.value, xUpperBorder.value, yUpperBorder.value);
            // const Weed_pending = Weed.filter((point: {plant_stage: string; }) => point.plant_stage === 'active');
            const Weed_pending = Weed.filter((point: { plant_stage: string; x: number; y: number; }) => {
                return (
                    // point.plant_stage === 'active' &&
                    point.plant_stage === 'pending' &&
                    point.x <= xUpperBorder.value &&
                    point.x >= xBorder.value &&
                    point.y <= yUpperBorder.value &&
                    point.y >= yBorder.value


                );
            });
            console.log(Weed_pending);
            weedPositions = Weed_pending.map((weed: { id: any; x: any; y: any; }) => ({
                id: weed.id,
                x: weed.x,
                y: weed.y
            }));


            console.log(weedPositions);
            if (weedPositions.length > 0) {
                showWeedListRef.value = true;
            }
            else noWeedfound.value = true;

        } else {
            console.error('Farmbot action failed:', response.error);
        }
    });

}
const imageURLs: string[] = [];
async function weeding() {


    const responsefirst: any[] = await $fetch('/api/FarmBot/REST/pic');
    const response = responsefirst.filter(item => item.meta.x >= farmbotStore.xBorder
        && item.meta.x <= farmbotStore.xUpperBorder
        && item.meta.y >= farmbotStore.yBorder
        && item.meta.y <= farmbotStore.yUpperBorder);


    console.log(response, 'response');
    const today = new Date();
    const dayOfWeek = today.getDay();
    console.log(dayOfWeek, 'dayOfWeek');
    const daysSinceLastThursday = (dayOfWeek + 7 - 4) % 7;
    console.log(daysSinceLastThursday, 'daysSinceLastThursday');
    const lastThursday = new Date(today);
    console.log(lastThursday, 'lastThursday');
    lastThursday.setDate(today.getDate() - daysSinceLastThursday);
    console.log(lastThursday, 'lastThursday');


    for (const point of response) {
        const pointDate = new Date(point.created_at);
        // console.log (pointDate,'pointDate');
        if ((pointDate.getDay() === 4 && pointDate >= lastThursday) || (dayOfWeek === 4 && pointDate.toDateString() === today.toDateString())) {
            if (pointDate.getHours() >= 7 && pointDate.getHours() <= 9 && pointDate.getMinutes() >= 0 && pointDate.getMinutes() < 60) {
                console.log('pic', pointDate.toISOString());

                imageURLs.push(point.attachment_url);
            }

            console.log(imageURLs);
        }

    }
    //selecting All WeedPlants 

    //const response2 = await $fetch('/api/FarmBot/REST/points');
    const Weed = farmbotStore.response.filter((point: { pointer_type: string; }) => point.pointer_type === 'Weed');
    console.log('weed', Weed);

    // const Weed_pending = Weed.filter((point: {plant_stage: string; }) => point.plant_stage === 'active');
    const Weed_pending = Weed.filter((point: { plant_stage: string; x: number; y: number; }) => {
        return (
            // point.plant_stage === 'active' &&
            point.plant_stage === 'pending' &&
            point.x <= farmbotStore.xUpperBorder &&
            point.x >= farmbotStore.xBorder &&
            point.y <= farmbotStore.yUpperBorder &&
            point.y >= farmbotStore.yBorder


        );
    });
    console.log(Weed_pending, 'Weed_pending', farmbotStore.xUpperBorder.value, farmbotStore.xBorder.value);
    weedPositions = Weed_pending.map((weed: { id: any; x: any; y: any; }) => ({
        id: weed.id,
        x: weed.x,
        y: weed.y,
        removed: false
    }));



    if (weedPositions.length > 0) {
        showWeedListRef.value = true;
    }
    else noWeedfound.value = true;

}



let picUrlWeed = ref(null);
let picUrlWeedDetected = ref(null);
interface WeedPosition {
    id: number;
    x: number;
    y: number;
    removed: boolean;
}
let weedPositions: WeedPosition[] = [];

function removeWeedfromList(idToRemove: any) {
    const removedWeedIndex = weedPositions.findIndex((weed) => weed.id === idToRemove);
    if (removedWeedIndex !== -1) {
        weedPositions[removedWeedIndex].removed = true;
        if (farmbotStore.weedTodo > 0) {
            farmbotStore.weedTodo = farmbotStore.weedTodo - 1;

        }
    }

    /* const indexToRemove = weedPositions.findIndex((weed) => weed.id === idToRemove);
     if (indexToRemove !== -1) {
         weedPositions.splice(indexToRemove, 1);
     }*/
    console.log('removed');
}
async function plantWeed(id: any, x: any, y: any) {
    namethePlant.value = true;

    const inputValueResult = await waitForInputValue();

    //update server
    const body = {
        x: x,
        y: y,
        name: inputValueResult,
        pointer_type: 'Plant',
        openfarm_slug: 'weed',
        meta: {
            planted_by: data.value?.user?.name,
            last_watered: '',
        },
        plant_stage: 'planted',

    };
    const t = await $fetch('/api/FarmBot/REST/posts', {
        method: 'post',
        body: body
    });
    const plants = await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/group`);
    plants.point_ids.push(t.id);

    const bodyWeed = {
        point_ids: plants.point_ids

    };
    await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/groups`, {
        method: 'put',
        body: bodyWeed
    });
    addPlantToPlantfield(id, x, y, t.radius, 'weed');


    const body2 = {
        id: id,
        plant_stage: 'removed'
    };
    const t2 = await $fetch('/api/FarmBot/REST/point', {
        method: 'put',
        body: body2
    });

    farmbotStore.response = await $fetch('/api/FarmBot/REST/points');
    farmbotStore.plantedPlants = farmbotStore.response.filter((point: { plant_stage: string; }) => point.plant_stage === 'planted');


    console.log('planting weed');
}


const onlineUsers = ref<string[]>([]);
// Funktion zum Aktualisieren der Liste der Online-Benutzer
function updateOnlineUsers(users: string[]) {
    onlineUsers.value = users;
}

// Funktion zum Ermitteln der Hintergrundfarbe des Avatars
function getUserColor(user: string) {
    // getUsers();
    updateOnlineUsers(ConnectionStore.onlineUsers);
    console.log(onlineUsers.value, user, onlineUsers.value.includes(user) ? 'green' : 'black');
    return onlineUsers.value.includes(user) ? 'green' : 'black';
}


function getUsers() {
    updateOnlineUsers(ConnectionStore.onlineUsers);


    //ConnectionStore.sendMessage('online-users, { x: 2, y: 2, z: 2 }');
    /*  const socket = io();
    
    // Event-Handler für den Empfang von Online-Benutzern
    socket.on('online-users', (users: string[]) => {
    });*/

}




function getUserPosition(user: string, index: number) {
    let i = farmbotStore.getNumberByName(user);
    //let j = 0;
    /* if (i <= farmbotStore.numberofFields/5 && i > 0){
       console.log ('positions of icons', i, farmbotStore.numberofFields/2 , farmbotStore.XLine );
      // return { left: 'calc(100% - ' + canvasWidth.value /i + 'px)', top: 'calc(50% - ' + canvasHeight.value / 2 + 'px)' };
       return { left: 'calc(100% - ' + canvasWidth.value /i + 'px)', top: 'calc(72% - ' +0 + '%)' }; // 1,2,4
   
       
     }
     else{*/
    let j;
    if (i % farmbotStore.XLine == 0) {
        j = Math.floor((i - 1) / farmbotStore.XLine);
    }
    else {
        j = Math.floor(i / farmbotStore.XLine);
    }
    console.log(j, i, 'j po');
    j = Math.floor(90 / 4) * j;
    console.log('positions of icons', j, i, farmbotStore.numberofFields / 2, farmbotStore.XLine);

    i = i % farmbotStore.XLine;
    if (i == 0) i = farmbotStore.XLine;
    i = (95 / farmbotStore.XLine) * (i - 1);
    console.log('positions of icons', j, i, farmbotStore.numberofFields / 2, farmbotStore.XLine);

    // return { left: 'calc(100% - ' + canvasWidth.value /i + 'px)', top: `calc(72% - ${j}%)` }; 
    return { left: `calc(5% + ${i}%)`, top: `calc(72% - ${j}%)` };



    // }

}

async function assigneFieldnumber() {

    for (const user of ConnectionStore.availableUsers) {
        const personalfield: any = await $fetch('api/prisma/user/' + user + '/info');
        console.log(personalfield, 'test');
        farmbotStore.addNameAndNumber(user, personalfield.field);
        console.log(user, personalfield.field, 'test3');
    }

}

const ConnectionStore = useConnectionStore();
ConnectionStore.bindEvents();

let todos = ref(false);



async function test() {
    //const socket = io();
    const message = {
        type: 'test',
        data: {
            x: 0,
            y: 0,
            z: 0
        },
        name: 'seeder',
        plant: 'name'
    };


    ConnectionStore.socket.emit('farmbot', message);
    console.log(ConnectionStore.queue, 'queuei');


}
function takeAPic(x: any, y: any, id: any) {

    const message = {
        type: 'pic',
        data: {
            x: x,
            y: y,
            z: 0
        },
        name: '',
        plant: ''
    };

    ConnectionStore.socket.emit('farmbot', message);
}

function backSimple() {
    initialiePlantList();
    currentField.value = farmbotStore.myfield;
    farmbotStore.currentField = currentField.value;
    showButtons.value = false; // Hide additional buttons
    selectedPlant.value = null;
    tooltip.value.show = false;
    plantInfoBox.value = null;
    showPlantCircle.value = false;
    showWeedListRef.value = false;
    pictureSpot.value = false;
    namethePlant.value = false;
    weedSimple.value = false;

}
function fertilize(x: any, y: any, id: any) {
    const message = {
        type: 'fertilize',
        data: {
            x: x,
            y: y,
            z: 0
        },
        name: 'fertilize',
        plant: ""
    };

    ConnectionStore.socket.emit('farmbot', message);
}
function formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}