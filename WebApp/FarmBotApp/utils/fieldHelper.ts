import { useFarmbotStore } from "../stores/farmbotStore";
import { useConnectionStore } from "../stores/clientSocketStore";

export function getPositioninMM(
  x: number,
  i: number,
  j: any,
  width: number,
  height: number,
  n: number | undefined
) {
  // width = 360;
  // height = 388.4;
  let x_offset = 256;
  let y_offset = 49;
  if (n == 1) {
    //console.log('input data X',x,i,j,width,height,n);
    let posX = (width / 906.7) * (x - (x_offset + (i - 1) * 906.7)); //906.7 maße des Feldes
    //console.log(i,'findTestX',posX, width,height,x,i);
    if (posX < 0) {
      posX = 15;
    }
    if (posX > width) {
      posX = width - 15;
    }
    return posX; ///906.7;
  } else {
    //console.log('input data Y',x,i,j,width,height,n);
    let posY = (height / 873.3) * (x - (y_offset + j * 873.3)); //Maße des Feldes
    //console.log('findTestY',posY,j,x,x-((j)*873.3));
    if (posY < 0) {
      posY = 15;
    }
    if (posY > width) {
      posY = width - 15;
    }

    return height - posY; //873.3);
  }
}

export function getPositioninPX(
  x: number,
  i: number,
  j: any,
  width: number,
  height: number,
  n: number | undefined
) {

let x_offset = 256;
let y_offset = 49;

if (n == 1) {
    let posX = (906.7 / width) * x + (i - 1) * 906.7 + x_offset; 
    return posX;
} else {
    let posY = (873.3 / height) * x + j * 873.3 + y_offset; 

    return posY;
}
}
const allFilteredAndMappedPlants: {
  field: number;
  // x: getPositioninMM(point.x, farmbotStore.myI, farmbotStore.myJ, width, height, 1),
  x: any;
  y: any;
  radius: any;
}[] = [];

export async function getAllPlantsandWeeds(width: number, height: number) {
  const farmbotStore = useFarmbotStore();
  farmbotStore.initalizeField();
  //listsforWateringAndWeeding();
  const response2 = await $fetch("/api/FarmBot/REST/points");
  //console.log(response2, 'testresponse');
  const Allweeds = response2
    .filter(
      (point: { plant_stage: string; pointer_type: string }) =>
        point.plant_stage === "pending" && point.pointer_type === "Weed"
    )
    .map((point: { x: any; y: any; radius: any }) => ({
      x: getPositioninMMBig(point.x, width, height, 1),
      y: getPositioninMMBig(point.y, width, height, 2),
      radius: point.radius,
    }));

  const allPlants = response2
    .filter((point: { plant_stage: string }) => point.plant_stage === "planted")
    .map((point: { x: any; y: any; radius: any; openfarm_slug: string }) => ({
      name: point.openfarm_slug,
      x: getPositioninMMBig(point.x, width, height, 1),
      y: getPositioninMMBig(point.y, width, height, 2),
      radius: point.radius,
    }));
  farmbotStore.allWeeds = Allweeds;
  farmbotStore.allPlantsSimple = allPlants;
  return 1;
}

async function fetchPlantDetailsById(
  pointId: number,
  groupId: number,
  width: number,
  height: number
) {
  const farmbotStore = useFarmbotStore();

  const point = await $fetch(`/api/FarmBot/REST/${pointId}/pointid`);
  if (point.plant_stage === "planted") {
    const mappedPlant = {
      field: groupId,
      x: getPositioninMMBig(point.x, width, height, 1),
      y: getPositioninMMBig(point.y, width, height, 2),
      // x:  point.x,
      // y: point.y,
      radius: point.radius,
    };

    allFilteredAndMappedPlants.push(mappedPlant);
  }
}

export function getPositioninMMBig(
  x: number,
  width: number,
  height: number,
  n: number | undefined
) {
  let x_offset = 256;
  let y_offset = 49;
  if (n == 1) {
    let posX = (width / 5440.2) * (x - x_offset); //906.7 maße des Feldes
    //console.log('findTest',posX, width,height,x);
    if (posX < 0) {
      posX = 15;
    }
    if (posX > width) {
      posX = width - 15;
    }

    return posX;
  } else {
    let posY = (height / 2619) * (x - y_offset); //Maße des Feldes
    //console.log('findTest',posY);
    if (posY < 0) {
      posY = 15;
    }
    if (posY > width) {
      posY = width - 15;
    }

    return height - posY;
  }
}

export function farmbotPosition(width: number, height: number) {
  const ConnectionStore = useConnectionStore();
  const farmbotStore = useFarmbotStore();

  if (ConnectionStore.farmbotPosition !== null) {
    //let width = 400.0 //these are the actual dimensions of the map and have to be adjusted in case the col width for the component changes
    //let adjusted_height = 200.0; //adjusted to actual map size
    // let scaling_factor_x = 0.93154; // actual x dimension of the map / dimensions that we set on the actual field --> 5440/5840
    // let scaling_factor_y = 0.92872; // actual y dimension of the map / dimensions that we set on the actual field --> 2619/2820
    let scaling_factor_x_virtual = width / 5440.2;
    let scaling_factor_y_virtual = height / 2619;
    let x_offset = 256; //our field is offset which needs to be accounted for
    let y_offset = 49;
    let x_raw = ConnectionStore.farmbotPosition.x;
    let y_raw = ConnectionStore.farmbotPosition.y;

    let x = scaling_factor_x_virtual * (x_raw - x_offset);
    let y = height - scaling_factor_y_virtual * (y_raw - y_offset);

    //cap the values to make sure if they are used for bot repositioning they are within the field and the bot image does not go outside the field
    if (x < 0) {
      x = 15;
    }
    if (y < 0) {
      y = 15;
    }
    if (x > width) {
      x = width - 15;
    }
    if (y > height) {
      y = height - 15;
    }
    // formula does the following for x and y:
    // 1. Scale coordinate to our field dimensions
    // 2. Adjust for offset
    // 3. Project onto our virtual field by scaling to viewport dimensions
    return { x, y };
  }

  return { x: 0, y: 0 };
}
export function botPosSmall(width: number, height: number) {
  const farmbotStore = useFarmbotStore();
  const ConnectionStore = useConnectionStore();

  if (ConnectionStore.farmbotPosition !== null) {
    if (
      ConnectionStore.farmbotPosition.x >= farmbotStore.xBorder &&
      ConnectionStore.farmbotPosition.x <= farmbotStore.xUpperBorder &&
      ConnectionStore.farmbotPosition.y <= farmbotStore.yUpperBorder &&
      ConnectionStore.farmbotPosition.y >= farmbotStore.yBorder
    ) {
      const xPos = getPositioninMM(
        ConnectionStore.farmbotPosition.x,
        farmbotStore.myI,
        farmbotStore.myJ,
        width,
        height,
        1
      );

      const yPos = getPositioninMM(
        ConnectionStore.farmbotPosition.y,
        farmbotStore.myI,
        farmbotStore.myJ,
        width,
        height,
        2
      );
      return { x: xPos, y: yPos };
    }
  }

  return;
}

export async function transformPixelSeedPositionToMM(
  xPos: number,
  yPos: number,
  width: number,
  height: number
) {
  const farmbotStore = useFarmbotStore();

  const x = getPositioninPX(
    xPos,
    farmbotStore.myI,
    farmbotStore.myJ,
    width,
    height,
    1
  );
  const y = getPositioninPX(
    yPos,
    farmbotStore.myI,
    farmbotStore.myJ,
    width,
    height,
    2
  );

  return { x, y };
}

export async function checkIfPlantIsTooCloseToAnotherPlant(
  name: any,
  posX: number,
  posY: number,
  radius: number
) {
  const farmbotStore = useFarmbotStore();

  const plants = farmbotStore.plantedPlants.filter(
    (point: { x: any; y: any }) =>
      point.x <= farmbotStore.xUpperBorder &&
      point.x >= farmbotStore.xBorder &&
      point.y <= farmbotStore.yUpperBorder &&
      point.y >= farmbotStore.yBorder
  );

  let tempneighbor = false;
  plants.forEach((temp: { x: any; y: any; radius: any }) => {
    var tx = temp.x - posX;
    var ty = temp.y - posY;
    if (Math.sqrt(tx * tx + ty * ty) < temp.radius + radius) {
      tempneighbor = true;
      return tempneighbor; // Break out of the loop
    }
  });

  return tempneighbor;
}

export async function plantSelectedPlant(
  name: any,
  posX: number,
  posY: number,
  radius: any
) {
  //console.log("authenticated");

  const ConnectionStore = useConnectionStore();

  const farmbotStore = useFarmbotStore();
  // obsolete as the distinction between seeding routines for each interaction levels was already made in the Seeding Slide group and would be redundant here
  // if (tempneighbor) {
  //     console.log(' nachbar');
  //     if (farmbotStore.userSettings.interactionLevel == 0) {
  //         plantSelectedPlantSimple(name, radius);
  //         return;
  //     } else if (farmbotStore.userSettings.interactionLevel == 1) {
  //         farmbotStore.showFarmbotCardPopUp = true;
  //         farmbotStore.selectedPopUpMessage = 'Error, Plants will be too close to each other';
  //         farmbotStore.displayCancel = false;
  //     } else {
  //         farmbotStore.showFarmbotCardPopUp = true;
  //         farmbotStore.selectedPopUpMessage = 'Warning, Plants will be too close to each other. Do you want to plant them anyway?';
  //         farmbotStore.displayCancel = true;
  //     }

  // const result = await waitForDialogReturn();

  // if (result === 1) { // 1 = Yes (confirm planting)
  //     console.log('Dialog-Rückgabewert ist 1.');
  //     farmbotStore.dialogreturn = null;
  //     tempneighbor = false;

  // } else if (result === 0) { // 0 = No (cancel planting)
  //     console.log('Dialog-Rückgabewert ist 0.');
  //     farmbotStore.plantPosX = null;
  //     farmbotStore.plantPosY = null;

  // } farmbotStore.dialogreturn = null;

  // }
  // else {
  //console.log('Pflanze wird an Position gepflanzt - X:', x_plant, 'Y:', y_plant, 'name', name);
  const { data } = useAuth();

  //tell farmbot to get the tool seeder and start routine
  //build message
  const message = {
    type: "getToolSeeder",
    data: {
      x: posX,
      y: posY,
      z: 0,
    },
    name: data.value?.user?.name,
    plant: name,
  };
  //emit message to start
  ConnectionStore.socket.emit("farmbot", message);

  //update plant in database
  const currentDate = new Date().toISOString();
  //create metadata for plant
  const body = {
    x: posX,
    y: posY,
    name: name,
    pointer_type: "Plant",
    openfarm_slug: name,
    meta: {
      planted_by: data.value?.user?.name,
    },
    planted_at: currentDate,
    plant_stage: "planted",
  };

  //post
  const t = await $fetch("/api/FarmBot/REST/posts", {
    method: "post",
    body: body,
  });
  console.log("This is whats in t", t);

  const plants = await $fetch(
    `/api/FarmBot/REST/${farmbotStore.curentPlantid}/group`
  );
  plants.point_ids.push(t.id);

  const bodyWeed = {
    point_ids: plants.point_ids,
  };

  console.log("This is whats in plants", plants);

  await $fetch(`/api/FarmBot/REST/${farmbotStore.curentPlantid}/groups`, {
    method: "put",
    body: bodyWeed,
  });

  updatePlantList(farmbotStore); //new lists for drawing  
}

async function updatePlantList(farmbotStore: any) {
  farmbotStore.response = await $fetch("/api/FarmBot/REST/points");
  farmbotStore.plantedPlants = farmbotStore.response.filter(
    (point: { plant_stage: string }) => point.plant_stage === "planted"
  );

  farmbotStore.getPlantsforFields(farmbotStore.width, farmbotStore.height);
}

export async function resetPositionForPlanting(farmbotStore: any) {
    farmbotStore.plantPosX = null;
    farmbotStore.plantPosY = null;;
}

export function getRandomValue(min: number, max: number): number {
  console.log("max, min", max, min);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



export async function waterAllOfOneField() {
  const farmbotStore = useFarmbotStore();
  const ConnectionStore = useConnectionStore();

  let currentid = farmbotStore.curentPlantid;
  //console.log(currentid);
  const { data } = useAuth();

  //   const socket = io();
  const message = {
    type: "waterAll",
    data: {
      x: currentid,
      y: 0,
      z: 0,
    },
    name: data.value?.user?.name,
    plant: "",
  };

  ConnectionStore.socket.emit("farmbot", message);
  const currentDate = new Date().toISOString();
  const plants = await $fetch(`/api/FarmBot/REST/${currentid}/group`);

  //console.log(plants, 'plants');
  const pointIds = plants.point_ids;

  pointIds.forEach(async (id: any) => {
        const body = {
        id: id,
        meta: {
            last_watered: currentDate,
        },
        };
        try {
          const response = await $fetch("/api/FarmBot/REST/point", {
            method: "put",
            body: body,
          });
          console.log(response, 'response');
        } catch (error) {
          console.error(error);
        }
        // don't manually update the todo count, it will be updated in the farmbotstore already
        // if this function works, then the todo count will be updated accordingly --> otherwise check here why the data is not updated correctly
        // farmbotStore.todobadget = farmbotStore.todobadget - farmbotStore.waterTodo;
        // farmbotStore.waterTodo = 0;
  });
}

export async function waterSelected(selectedIds: any) {
  const farmbotStore = useFarmbotStore();
  const ConnectionStore = useConnectionStore();
  const { data } = useAuth();

  const message = {
    type: "waterAll",
    data: selectedIds,
    name: data.value?.user?.name,
  };

  ConnectionStore.socket.emit("farmbotList", message); //als Listen übergabe

  selectedIds.forEach(async (id: any) => {
    //console.log(`ID: ${id}`);

    const t2 = await $fetch(`/api/FarmBot/REST/${id}/pointid`);
    //console.log(t2,'t2');
    let timediff = await longert2Days(t2.meta.last_watered);
    //console.log(timediff);

    if (timediff) {
      farmbotStore.waterTodo = farmbotStore.waterTodo - 1;
      farmbotStore.todobadget = farmbotStore.todobadget - 1;
    }

    const currentDate2 = new Date().toISOString();

    const body = {
      id: id,
      meta: {
        last_watered: currentDate2,
      },
    };

    const t = await $fetch("/api/FarmBot/REST/point", {
      method: "put",
      body: body,
    });
  });
}

async function longert2Days(meta: string | number | Date) {
  const currentDate = new Date();
  const lastWateredDate = new Date(meta);
  const diffInMilliseconds = currentDate.getTime() - lastWateredDate.getTime();
  const diffInDays = diffInMilliseconds / (1000 * 3600 * 24);
  if (diffInDays >= 2) return true;
  return false;
}

export function weedSimple(ids: any[]) {
  const farmbotStore = useFarmbotStore();
  const ConnectionStore = useConnectionStore();
  const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000; // Millisekunden in zwei Wochen
  const currentDate = new Date();
  const cutPoints: string[] = [];
  const hackPoints: string[] = [];
  ids.forEach(async (id: any) => {
    const plants = await $fetch(`/api/FarmBot/REST/${id}/pointid`);
    //console.log(plants,'plants');
    if (plants && plants.created_at) {
      const currentDate = new Date();
      const twoWeeksInMilliseconds = 14 * 24 * 60 * 60 * 1000; // Millisekunden in zwei Wochen

      const createdAtDate = new Date(plants.created_at);
      const dateDifference = currentDate.getTime() - createdAtDate.getTime();
      //console.log(dateDifference, 'datediff');

      if (dateDifference <= twoWeeksInMilliseconds) {
        hackPoints.push(id);
      } else {
        cutPoints.push(id);
      }
    }
  });

  //console.log('weedselected', hackPoints, cutPoints);
  const { data } = useAuth();

  const message = {
    type: "hack",
    data: hackPoints,

    name: data.value?.user?.name,
  };
  ConnectionStore.socket.emit("farmbotList", message);

  const message2 = {
    type: "rotary",
    data: cutPoints,
    name: data.value?.user?.name,
  };
  ConnectionStore.socket.emit("farmbotList", message2);

  ids.forEach(async (id: any) => {
    const body = {
      id: id,
      plant_stage: "removed",
    };

    const t = await $fetch("/api/FarmBot/REST/point", {
      method: "put",
      body: body,
    });
  });
  farmbotStore.todobadget = farmbotStore.todobadget.value - ids.length;
  farmbotStore.weedTodo = ids.length;
}

export async function weed(ids: any[], type: String) {
  const { data } = useAuth();
  const farmbotStore = useFarmbotStore();
  const ConnectionStore = useConnectionStore();
  const message2 = {
    type: type,
    data: ids,
    name: data.value?.user?.name,
  };

  ConnectionStore.socket.emit("farmbotList", message2);

  ids.forEach(async (id: any) => {
    const body = {
      id: id,
      plant_stage: "removed",
    };

    const t = await $fetch("/api/FarmBot/REST/point", {
      method: "put",
      body: body,
    });
  });
  farmbotStore.todobadget = farmbotStore.todobadget.value - ids.length;
  farmbotStore.weedTodo = ids.length;
}


