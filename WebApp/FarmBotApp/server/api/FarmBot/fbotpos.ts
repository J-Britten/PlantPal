
import {Farmbot} from "farmbot";
export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
      let bot = new Farmbot({ token: useRuntimeConfig().farmbotApi })

      bot.connect()
      let arr: { x: any; y: any; z: any; } = { x: null, y: null, z: null }; 

      bot.on("status", (status: { location_data: { position: any; }; }) => {
          const pos = status.location_data.position;
        //  console.log(`FarmBot Position: (${pos.x}, ${pos.y}, ${pos.z})`);
          arr.x = pos.x;
          arr.y = pos.y;
          arr.z = pos.z;
          resolve(arr); 
      });

  });
});

