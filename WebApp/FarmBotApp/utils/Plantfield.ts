import { useFarmbotStore } from '~/stores/farmbotStore';
const farmbotStore = useFarmbotStore();
// PlantField.ts
export default class PlantField {
   /* private fieldData: { [key: number]: { x: number; y: number; x2: number; y2: number; id: number}[] } = {
      1: [],
      2: [],
      3: [],
      4:[]
    };*/
    private fieldData: { [key: number]: { x: number; y: number; x2: number; y2: number; id: number}[] } = {};

    constructor() {
      const numberOfFields = farmbotStore.numberofFields;
      for (let i = 1; i <= numberOfFields; i++) {
        this.fieldData[i] = [];
      }
    }
    addPlant(currentField: number, x: number, y: number, x2: number, y2:number,id: number): void {
      this.fieldData[currentField].push({ x, y, x2, y2, id });
      console.log ('aded plant');
    }
  
    getPlants(currentField: number, x: number, y: number): number {
        const plants = this.fieldData[currentField];
        const plant = plants.find(plant => {
            return plant.x <= x && plant.x2 >= x && plant.y <= y && plant.y2 >= y;
        });
        return plant ? plant.id : -1;
    }
    removePlant(currentField: number, plantId: number): void {
        const plants = this.fieldData[currentField];
        const index = plants.findIndex(plant => plant.id === plantId);
        if (index !== -1) {
            this.removePlant(currentField, index);
        }
    }
  }
  