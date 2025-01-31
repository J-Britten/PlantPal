import type { UserSettings } from "@prisma/client";
import { defineStore } from "pinia";
import { useWeatherStore } from "~/stores/weatherStore";
import windowHeight from "@/components/MainComponent.vue";
//import sharp from 'sharp'

import {

  getPositioninMM,
} from "../utils/fieldHelper";

/**
 * A Store for anything FarmBot related
 * A Store allows us to keep track of data that is shared between components and/or pagese.
 * It also allows us to remember data between page changes and thus reduce API calls
 *
 *
 * To import this, add the following lines to your component:
 * import { useFarmbotStore } from '~/stores/farmbotStore';
 * const farmbotStore = useFarmbotStore();
 */

export const useFarmbotStore = defineStore("FarmBotStore", () => {
  const { data } = useAuth();
  const SpotforPlanting = ref(false);
  const CrossClicked = ref(false);
  const allPlants: any = ref([]);
  const allPlantsSimple: any = ref([]);
  const PlantsOfoneField: any = ref([]);
  const WeedsOfoneField: any = ref([]);
  const allWeeds: any = ref([]);
  const WeedsCombined: any = ref([]);
  const personalFieldWidth = ref(0);
  const personalFieldHeight = ref(0);
  const resyncRequired = ref(false);


  function formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function getBounds() {
    const userInfo = await $fetch("/api/prisma/user/" + data.value?.user?.name + "/info");
    const group : any = await $fetch("/api/FarmBot/REST/" + userInfo.fieldGroupId+"/group");

    xBorder.value = group.criteria.number_gt.x;
    xUpperBorder.value = group.criteria.number_lt.x;
    yBorder.value = group.criteria.number_gt.y;
    yUpperBorder.value = group.criteria.number_lt.y;
    // console.log("Bounds", xBorder.value, xUpperBorder.value, yBorder.value, yUpperBorder.value);
  }

  async function getPlantsforFields(width: any, height: any) {
    await getBounds();
    await initalizeField();
    // //console.log(windowHeight.fieldColHeight.value,'windowHeight');

    const response = await $fetch("/api/FarmBot/REST/points");
    plantedPlants.value = response.filter(
      (point: { plant_stage: string }) => point.plant_stage === "planted"
    );
    const Allweeds = response.filter(
      (point: { plant_stage: string }) => point.plant_stage === "pending"
    );
    WeedsCombined.value = Allweeds;
    //// all Plants for my Field
    PlantsOfoneField.value = plantedPlants.value
      .filter(
        (point: { x: any; y: any }) =>
          point.x <= xUpperBorder.value &&
          point.x >= xBorder.value &&
          point.y <= yUpperBorder.value &&
          point.y >= yBorder.value
      )

      .map(
        (point: {
          openfarm_slug: any;
          created_at: any;
          meta: { last_watered: any };
          x: any;
          y: any;
          radius: any;
        }) => ({
          name: point.openfarm_slug,
          datePlanted: formatDate(point.created_at),
          lastWatered: formatDate(point.meta.last_watered),
          // x: point.x,
          x: getPositioninMM(point.x, myI.value, myJ.value, width, height, 1),
          y: getPositioninMM(point.y, myI.value, myJ.value, width, height, 2),
          //   y: point.y,
          radius: point.radius,
        })
      );
    //console.log (PlantsOfoneField.value, 'PlantsOfoneField');

    WeedsOfoneField.value = Allweeds.filter(
      (point: { x: any; y: any }) =>
        point.x <= xUpperBorder.value &&
        point.x >= xBorder.value &&
        point.y <= yUpperBorder.value &&
        point.y >= yBorder.value
    ).map(
      (point: {
        openfarm_slug: any;
        created_at: any;
        meta: { last_watered: any };
        x: any;
        y: any;
        radius: any;
      }) => ({
        datePlanted: formatDate(point.created_at),
        x: getPositioninMM(point.x, myI.value, myJ.value, width, height, 1),
        y: getPositioninMM(point.y, myI.value, myJ.value, width, height, 2),
      })
    );
    //console.log ('WeedsOfoneField',WeedsOfoneField.value );
  }

  async function initalizeField() {

    const response = await $fetch("/api/FarmBot/REST/get_all");
    //console.log(response, 'response');

    // Zugriff auf die Werte von `movement_step_per_mm` und `movement_axis_nr_steps`
    const stepsPerMmX = response.movement_step_per_mm_x;
    const axisNrStepsX = response.movement_axis_nr_steps_x;

    const stepsPerMmY = response.movement_step_per_mm_y;
    const axisNrStepsY = response.movement_axis_nr_steps_y;

    //change to mm and then to px
    fieldwidth.value = axisNrStepsX / stepsPerMmX;
    fieldheight.value = axisNrStepsY / stepsPerMmY;

    //console.log(fieldheight.value, 'fieldheight');

    const personalfield: any = await $fetch(
      "api/prisma/user/" + data.value?.user?.name + "/info"
    ); 
    //console.log(personalfield.fieldGroupId,'fieldgroup');
    myfield.value = personalfield.field;
    curentPlantid.value = personalfield.fieldGroupId;


    //Berechnung der eigenen Grenzen
    let w_temp = fieldwidth.value / XLine.value;
    let h_temp = fieldheight.value / YLine.value;
    myI.value = myfield.value % XLine.value;

    if (myI.value == 0) myI.value = XLine.value;

    if (myfield.value <= XLine.value) {
      myJ.value = 0;
    } else {
      myJ.value = Math.floor((myfield.value - myI.value) / XLine.value);
    }
    fieldI.value = myI.value;
    fieldJ.value = myJ.value;

    //xBorder.value = w_temp*(myI.value-1);
    //xUpperBorder.value = w_temp*myI.value;
    //yBorder.value = h_temp*myJ.value;
    //yUpperBorder.value = h_temp*(myJ.value+1);

    const interaction = await $fetch(
      "api/prisma/user/" + data.value?.user?.name + "/settings"
    );
    //console.log(interaction,'interaction', data.value?.user?.name);

    userSettings.value = interaction;
    /*userSettings.interactionLevel = interaction.interactionLevel; 
      userSettings.dailyBotActions = interaction.dailyBotActions;
      userSettings.dailyWaterReserve = interaction.dailyWaterReserve;*/

    // getPlantsforFields();

    //getPlantsforFields();
  }

  const myI: any = ref({});
  const fieldI: any = ref(0);
  const fieldJ: any = ref(0);
  const myJ: any = ref({});
  const plantedPlants: any = ref([]);
  const response: any = ref([]);
  let waterTodo: any = ref({});
  let weedTodo: any = ref({});
  let todobadget: any = ref({});
  const xBorder: any = ref(0);
  const xUpperBorder: any = ref(0);
  const yBorder: any = ref(0);
  const yUpperBorder: any = ref(0);
  const automatedPlantingPoint = ref({ x: 0, y: 0 });



  async function currentWateringToDos() {
    const currentDate = new Date().toISOString();

    //get all planted plants --> AZ: can't we get the included plants for a certain field by searching with the field id?
    const response = await $fetch("/api/FarmBot/REST/points");
    plantedPlants.value = response.filter(
      (point: { plant_stage: string }) => point.plant_stage === "planted"
    );
    
    //for some reason some of bobs plants are included here as well --> y?
    //find plants in my field bounds
    const filteredPlants = plantedPlants.value.filter(
      (point: { x: any; y: any }) =>
        point.x <= xUpperBorder.value &&
        point.x >= xBorder.value &&
        point.y <= yUpperBorder.value &&
        point.y >= yBorder.value
    );

    //for debugging
    filteredPlants.forEach((point: any) => {
      console.log("Point:", point.x, point.y);
      console.log("Meta Data:", point.meta);
    });

    let todos = 0;
    //check when these plants where last watered
    filteredPlants.forEach(
      (point: { meta: { last_watered: any | undefined } }) => {
        const { last_watered } = point.meta;
        if (last_watered) {
          const lastWateredDate = new Date(last_watered);
          const diffInDays = Math.floor(
            (new Date(currentDate).getTime() - lastWateredDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          if (diffInDays > 1) {
            todos++;
          }
        } else {
          todos++;
        }
      }
    );

    //if there are any that need to be watered, check if it is raining --> don't water if it is raining
    if (todos > 0) {
      const weatherStore = useWeatherStore();
      const weatherDescription = weatherStore.currentWeather.description;
      if (weatherDescription === "Moderate Rain" || weatherDescription === "Heavy Rain") {
        todos = 0;
      }
    }

    //set the new value
    //console.log('watertodos', todos);
    waterTodo.value = todos;

  }


  async function currentWeedToDos() {

    // Fetch data from the API endpoint
    const response = await $fetch("/api/FarmBot/REST/points");

    // Filter the response to get only the points that are weeds and within my field bounds
    const weeds = response.filter(
      (point: { pointer_type: string; x: number; y: number; plant_stage: string }) =>
        // Check if the point is of type "Weed"
        point.pointer_type === "Weed" &&
        point.x <= xUpperBorder.value &&
        point.x >= xBorder.value &&
        point.y <= yUpperBorder.value &&
        point.y >= yBorder.value &&
        point.plant_stage === "pending"
    );

    // Set the weedTodo value to the number of filtered weeds
    weedTodo.value = weeds.length;
  }

  async function fetchToDos() {
    await initalizeField();
    await getBounds();
    await currentWateringToDos();
    await currentWeedToDos();
  }
  

  const userSettings: any = ref({});

  //This is an example. Instead of getting these from the bot directly every time, we could get them once and store them here
  //and only change them if needed.
  const farmBotPoints: any = ref({});

  //Combined image of all fields
  let currentCombinedImage = ref('');
  //Personal field number € [1-18]
  let myFieldId = ref(0);
  //Current image of the field
  let myCurrentFieldImage = ref('');
  //An array of base 64 images over the past days since the start of the study. Implemented to be used in timelapses
  let myTimeLapseStack = ref<string[]>([]);

  const plantPosX = ref();
  const plantPosY = ref();
  const width = ref();
  const height = ref();

 async function findMyFieldNumber() {
    //this function gets the field id based on the column and row of one's field.
    //this is mainly used so that the appropriate personal map view image can be fetched from the DB (images are stored with the field number i.e. 1-18)
    try {
      // console.log("findMyFieldNumber() called");
      await initalizeField();
      // console.log("myI:", myI.value);
      // console.log("myJ:", myJ.value);
      let fieldCounter = 1;
      for (let j = 0; j < 3; j++) {
        for (let i = 1; i < 6; i++) {
          if (i == myI.value && j == myJ.value) {
            myFieldId.value = fieldCounter;
            break;
          }
          fieldCounter++;
        }
      }
    } catch (error) {
      console.error("Error finding field number:", error);
    }
  }

  async function fetchLatestGridImages() {
    try {
      await findMyFieldNumber();
      
      let id = myFieldId.value;
      // console.log("myFieldId:", id);
    
      let full_image = await $fetch("/api/prisma/images/" + 19);
      currentCombinedImage.value = full_image[full_image.length - 1].data.imgUrl;

      let tmp = await $fetch("/api/prisma/images/" + id);
      // console.log("Images for field:", tmp.length);
      if (tmp) {
        // console.log("Images found:", tmp);

        await tmp.forEach((element: any) => {
          if (element.gridId === myFieldId.value) {
            myTimeLapseStack.value.push(element.data.imgUrl);
          }
        });

        await tmp.sort((a: any, b: any) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        myCurrentFieldImage.value = tmp[0].data.imgUrl;
        // console.log(myCurrentFieldImage.value);
        // console.log("myCurrentFieldImage:", myCurrentFieldImage.value);
        // console.log("myTimeLapseStack:", myTimeLapseStack.value);
        // console.log("currentCombinedImage:", currentCombinedImage.value);

      } else {
        console.log(
          "FROM farmbotStore fetchLatestGridImage(): No images found for the id ",
          id
        );
      }
    } catch (error) {
      console.warn("Error fetching latest grid image:", error);
    }
  }

  //We can also declare functions here
  function farmbotStoreHello() {
    //console.log('Hello from the Farmbot Store')
  }

  const fieldwidth: any = ref({});
  const fieldheight: any = ref({});
  const fieldpixelscaleX: any = ref({});
  const fieldpixelscaleY: any = ref({});
  const blocked = ref([0, 0, 0, 0, 0]);
  const curentPlantid: any = ref(97720); //Feldgruppe in Server speichern
  const myfield: any = ref(0);
  const numberofFields: any = ref(18);

  const nameAndNumberList: any = ref([]); //names of participants and field id for online icon


  const XLine: any = ref(6);
  const YLine: any = ref(3);
  const fieldnumbers: any = ref(18); //?
  const borderX: any = ref(20); //?
  const borderY: any = ref(20); //?
  const currentField: any = ref(0);

  function getI(
    fieldwidth: number,
    positionX: number,
    identifier: number,
    X: any,
    Y: any
  ) {
    let size;
    let i = 0;

    if (identifier == 1) {
      size = fieldwidth / X;
      i = 1;
    } else {
      size = fieldwidth / Y;
    }
    let referencesize = size;
    while (positionX > referencesize) {
      i++;
      referencesize = size + referencesize;
    }
    return i;
  }

  // Watcher für weedTodo
  watch(
    () => weedTodo.value,
    (newValue, oldValue) => {
      todobadget.value = newValue + waterTodo.value;
    }
  );

  // Watcher für waterTodo
  watch(
    () => waterTodo.value,
    (newValue, oldValue) => {
      todobadget.value = newValue + weedTodo.value;
    }
  );

  function togglePlantingActive() {
    // console.log("SpotforPlanting.value before", SpotforPlanting.value);
    SpotforPlanting.value = !SpotforPlanting.value;
    // console.log("SpotforPlanting.value after", SpotforPlanting.value);

  }

  function getIfromFieldid(id: number, X: any) {
    if (id <= X) {
      return id;
    } else {
      let temp = id % X;
      if (temp == 0) {
        return XLine;
      }
      return temp;
    }
  }
  const showFarmbotCardPopUp = ref(false);
  let displayCancel = ref(false);
  let selectedPopUpMessage = ref("");
  function getJfromFieldid(id: number, i: number, X: any, Y: any) {
    if (id <= X) return 1;
    //let temp = ((id-i)%Y)+1;
    let temp = (id - i) / X + 1;

    return temp;
  }

  function addNameAndNumber(name: string, number: number): void {
    nameAndNumberList.value.push({ name, number });
  }

  function getNumberByName(name: string): number | undefined {
    const entry = nameAndNumberList.value.find(
      (item: any) => item.name === name
    );
    return entry ? entry.number : undefined;
  }
  const dialogreturn = ref<number | null>(null);
  // console.log("My Field", myI, myJ);
  //Anything that is returned here can be accessed by other components. Meaning we can also put "private" variables here
  return {
    showFarmbotCardPopUp,
    CrossClicked,
    WeedsCombined,
    dialogreturn,
    displayCancel,
    selectedPopUpMessage,
    SpotforPlanting,
    width,
    height,
    plantPosY,
    plantPosX,
    WeedsOfoneField,
    allPlants,
    allWeeds,
    allPlantsSimple,
    fieldI,
    fieldJ,
    formatDate,
    PlantsOfoneField,
    getPlantsforFields,
    initalizeField,
    currentField,
    myI,
    myJ,
    fetchToDos,
    currentWateringToDos,
    currentWeedToDos,
    plantedPlants,
    response,
    XLine,
    YLine,
    getI,
    getIfromFieldid,
    getJfromFieldid,
    fieldnumbers,
    borderX,
    borderY,
    userSettings,
    farmBotPoints,
    farmbotStoreHello,
    automatedPlantingPoint,
    fieldheight,
    fieldpixelscaleX,
    fieldpixelscaleY,
    fieldwidth,
    blocked,
    waterTodo,
    todobadget,
    curentPlantid,
    weedTodo,
    xBorder,
    xUpperBorder,
    yBorder,
    yUpperBorder,
    myfield,
    fetchLatestGridImages,
    myTimeLapseStack,
    findMyFieldNumber,
  //  myTimeLapseGif,
    myCurrentFieldImage,
    togglePlantingActive,
    currentCombinedImage,
    numberofFields,
    addNameAndNumber,
    getNumberByName,
    personalFieldHeight,
    personalFieldWidth,
    resyncRequired
  };
});
