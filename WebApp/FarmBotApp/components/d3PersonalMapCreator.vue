<template>
  <div ref="mapContainer" class="map-container" id="mp" @click="handleMapClick"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps, onBeforeUnmount } from "vue";
import * as d3 from "d3";

import robotImage from "@/assets/robot64.png";
import lettuceImage from "@/assets/lettuce.png";
import marigoldImage from "@/assets/marigold.png";
import cornflowerImage from "@/assets/cornflower.png";
import radishImage from "@/assets/radish.png";
import blackCuminImage from "@/assets/black_cumin.png";
import weedingImage from "@/assets/weeding.png";
import { useFarmbotStore } from "~/stores/farmbotStore";
const farmbotStore = useFarmbotStore();
import { botPosSmall } from '../utils/fieldHelper';
import { useConnectionStore } from "~/stores/clientSocketStore";

const connectionStore = useConnectionStore();

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const robotPosition = ref<{ x: number; y: number } | undefined>(undefined);
const height = ref();
const width = ref();
const weeds = ref<any[]>([]);
const plants = ref<any[]>([]);
const mapContainer = ref(null);
const cross = ref<{ x: number; y: number } | null>(null);
const playGif = ref(false);

const getPlantImage = (name: any) => {
  switch (name) {
    case "lettuce":
      return lettuceImage;
    case "Lettuce":
      return lettuceImage;
    case "marigold":
      return marigoldImage;
    case "Marigold":
      return marigoldImage;
    case "burpee-best-french-marigold":
      return marigoldImage;
    case "french-breakfast-radish":
      return radishImage;
    case "Radish":
      return radishImage;
    case "Cornflower":
      return cornflowerImage;
    case "Cumin":
      return blackCuminImage;
    case "black_cumin":
      return blackCuminImage;
    default:
      return "";
  }
};

const calculateImageSize = (date: string | number | Date) => {
  const currentDate = new Date();
  const eventDate = new Date(date);
  const diffTime = Math.abs(currentDate.getTime() - eventDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(24, 24 + diffDays), 45);
};

const drawBaseMap = (dataURL: string) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = viewportWidth * 0.971;
  const bedWidth = viewportWidth;
  const bedHeight = viewportHeight*0.75;
  farmbotStore.personalFieldWidth = bedWidth;
  farmbotStore.personalFieldHeight = bedHeight;

const svg = d3.select(mapContainer.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', bedHeight)
    .attr('viewBox', `0 0 ${bedWidth} ${bedHeight}`)
    .attr('preserveAspectRatio', 'xMinYMin meet');

  // const defs = svg.append('defs');
  // const pattern = defs.append('pattern')
  //   .attr('id', 'earthTexture')
  //   .attr('patternUnits', 'objectBoundingBox')
  //   .attr('width', 1)
  //   .attr('height', 1);

  // pattern.append('image')
  //   .attr('href', dataURL)
  //   .attr('width', bedWidth)
  //   .attr('height', bedHeight)
  //   .attr('preserveAspectRatio', 'xMidYMid slice');

  svg.append('rect')
    .attr('width', bedWidth)
    .attr('height', bedHeight)
    .attr('fill', 'rgb(150, 75, 0, 0.8)')
    .attr('stroke', '#FFF')
    .attr('stroke-width', 2);

    
  return { svg, bedWidth, bedHeight };
};

const updateRobotPosition = (svg: any, bedWidth: number, bedHeight: number) => {
  const robotImageSelection = svg.selectAll('.robot');
  const robotSize = 64;

  if (props.filters.toggle3 && robotPosition.value !== undefined) {
    if (robotImageSelection.empty()) {
      svg.append('image')
        .attr('class', 'robot')
        .attr('href', robotImage)
        .attr('x', robotPosition.value.x - robotSize / 2)
        .attr('y', robotPosition.value.y*0.75 - robotSize / 2)
        .attr('width', robotSize)
        .attr('height', robotSize);
    } else {
      robotImageSelection
        .raise()
        .attr('x', robotPosition.value.x*0.75 - robotSize / 2)
        .attr('y', robotPosition.value.y - robotSize / 2);
    }
  } else {
    robotImageSelection.remove();
  }
};

const updatePlantsAndWeeds = (svg: any) => {
  if(!svg.selectAll('.plant').empty()){
    svg.selectAll('.plant').remove();
  }
  if(!svg.selectAll('.weed').empty()){
    svg.selectAll('.weed').remove();
  }


  if (props.filters.toggle2) {
    weeds.value.forEach(weed => {
      const weedSize = calculateImageSize(weed.detectedDate);
      svg.append('image')
        .attr('class', 'weed')
        .attr('href', weedingImage)
        .attr('x', weed.x)
        .attr('y', weed.y*0.75)
        .attr('width', 20)
        .attr('height', 20);
    });

    plants.value.forEach(plant => {
      const plantSize = calculateImageSize(plant.datePlanted);
      const plantGroup = svg.append('g')
        .attr('transform', `translate(${plant.x - plantSize / 2}, ${(plant.y - plantSize / 2)*0.75})`);

      plantGroup.append('image')
        .attr('class', 'plant')
        .attr('href', getPlantImage(plant.name))
        .attr('width', plantSize)
        .attr('height', plantSize);

      plantGroup.append('title')
        .text(`Name: ${plant.name}\nPlanted: ${plant.datePlanted}\nLast Watered: ${plant.lastWatered}`);
    });
  }
};

const updateDistances = (svg: any) => {
  if(!svg.selectAll('.plant_distances').empty()){
  svg.selectAll('.plant_distances').remove();
  }

  if (props.filters.toggle4) {
    plants.value.forEach(plant => {
      svg.append('circle')
        .attr('class', 'plant_distances')
        .attr('cx', plant.x)
        .attr('cy', (plant.y)*0.75)
        .attr('r', plant.radius)
        .attr('fill', 'rgba(255, 255, 255, 0.1)')
        .attr('stroke', 'rgba(255, 255, 255, 0.3)')
        .attr('stroke-width', 2);
    });
  }
};

const updateTimeLapse = (svg: any, bedWidth: number, bedHeight: number) => {
  svg.selectAll('.plant').remove();
  svg.selectAll('.weed').remove();
  svg.selectAll('.robot').remove();

  const timeLapseGroup = svg.selectAll('.time-lapse');
  if (props.filters.toggle5 && playGif.value) {
    if (timeLapseGroup.empty()) {
      svg.append('image')
        .attr('class', 'time-lapse')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', bedWidth)
        .attr('height', bedHeight)
        .attr('preserveAspectRatio', 'xMidYMid slice');
        //this goes through all images and shows them one by one

        if (farmbotStore.myTimeLapseStack.length > 0) {
          for (let i = 0; i < farmbotStore.myTimeLapseStack.length; i++) {
            const imageUrl = farmbotStore.myTimeLapseStack[i];
            setTimeout(() => {
              svg.select('.time-lapse')
                .attr('href', imageUrl);
            }, i * 200);
          }
        }
    }
  } else {
    timeLapseGroup.remove();
  }
};

const renderBaseMap = () => {
  let imageOverlay = "./earth-texture.png"; 
  if(farmbotStore.myCurrentFieldImage && props.filters.toggle1){
    imageOverlay = farmbotStore.myCurrentFieldImage;
  }
  console.log('imageOverlay', imageOverlay);
  //getImageDataUrl(imageOverlay, (dataURL) => {
    const { svg, bedWidth, bedHeight } = drawBaseMap(imageOverlay);

    updatePlantsAndWeeds(svg);
    updateRobotPosition(svg, bedWidth, bedHeight);
    updateDistances(svg);
    updateTimeLapse(svg, bedWidth, bedHeight); // Ensure the GIF is updated on base map render
  //});
};

const loadData = async () => {
  await farmbotStore.getPlantsforFields(window.innerWidth, window.innerWidth * 0.971);
  plants.value = farmbotStore.PlantsOfoneField;
  weeds.value = farmbotStore.WeedsOfoneField;
  robotPosition.value = botPosSmall(window.innerWidth, window.innerWidth * 0.971);

  const svg = d3.select(mapContainer.value).select('svg');
  updateRobotPosition(svg, window.innerWidth, window.innerWidth * 0.971);
  updatePlantsAndWeeds(svg);
  updateDistances(svg);
  updateTimeLapse(svg, window.innerWidth, window.innerWidth * 0.971); // Ensure the GIF is updated after data load
};

const stopTimelapse = async () => {
  // Implement the logic to load time-lapse images
  // This should set the farmbotStore.myTimeLapseImages array or a similar variable
  // For example:
  // farmbotStore.myTimeLapseImages = await farmbotStore.fetchTimeLapseImages();
  playGif.value = false;
};

const handleMapClick = (event: any) => {
  const svgElement = d3.select(mapContainer.value).select("svg").node();
  if (!svgElement) return;

  const bbox = svgElement.getBoundingClientRect();
  farmbotStore.width = bbox.width;
  farmbotStore.height = bbox.height;

  const point = d3.pointer(event, svgElement);
  const x = point[0];
  const y = farmbotStore.personalFieldHeight-point[1];
  console.log(`Click at: ${x}, ${y}`);
  console.log('SpotforPlantingVariable', farmbotStore.SpotforPlanting)
  if (farmbotStore.SpotforPlanting) {
    cross.value = { x: point[0], y: point[1] };
    farmbotStore.CrossClicked = true;
    farmbotStore.plantPosX = x;
    farmbotStore.plantPosY = y;

    console.log(`Cross at: ${cross.value.x}, ${cross.value.y}`);


    // Update cross without re-rendering the whole map
    const svg = d3.select(mapContainer.value).select("svg");
    svg.selectAll('.cross').remove();

    svg.append("line")
      .attr("x1", cross.value.x - 15)
      .attr("y1", cross.value.y)
      .attr("x2", cross.value.x + 15)
      .attr("y2", cross.value.y)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "cross");

    svg.append("line")
      .attr("x1", cross.value.x)
      .attr("y1", cross.value.y - 15)
      .attr("x2", cross.value.x)
      .attr("y2", cross.value.y + 15)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "cross");
  }
  else{
    const svg = d3.select(mapContainer.value).select("svg");
    cross.value = null;
    farmbotStore.CrossClicked = false;
    svg.selectAll('.cross').remove();
  }
};

const handleResize = () => {
  d3.select(mapContainer.value).select('svg').remove();
  renderBaseMap();
  loadData();
};

watch(cross, (newValue) => {
  if (newValue) {
    const svg = d3.select(mapContainer.value).select("svg");
    svg.selectAll('.cross').remove();

    svg.append("line")
      .attr("x1", newValue.x - 15)
      .attr("y1", newValue.y)
      .attr("x2", newValue.x + 15)
      .attr("y2", newValue.y)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "cross");

    svg.append("line")
      .attr("x1", newValue.x)
      .attr("y1", newValue.y - 15)
      .attr("x2", newValue.x)
      .attr("y2", newValue.y + 15)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "cross");
  }
}, { deep: true });

const automatedClick = () => {
    console.log('automatedClick');
    const svg = d3.select(mapContainer.value).select("svg");
    const cross_auto = farmbotStore.automatedPlantingPoint;
    svg.append("line")
      .attr("x1", cross_auto.x - 15)
      .attr("y1", cross_auto.y)
      .attr("x2", cross_auto.x + 15)
      .attr("y2", cross_auto.y)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "automated-click");

    svg.append("line")
      .attr("x1", cross_auto.x)
      .attr("y1", cross_auto.y - 15)
      .attr("x2", cross_auto.x)
      .attr("y2", cross_auto.y + 15)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("class", "automated-click");
    // Remove the circle after a certain duration
    setTimeout(() => {
      svg.selectAll(".automated-click").remove();
    }, 5000);
};


watch(() => connectionStore.farmbotPosition, () => {
  stopTimelapse();
  robotPosition.value = botPosSmall(window.innerWidth, (window.innerWidth * 0.971)*0.75);
  const svg = d3.select(mapContainer.value).select('svg');
  updateRobotPosition(svg, window.innerWidth, (window.innerWidth * 0.971)*0.75);
});

watch(() => farmbotStore.automatedPlantingPoint, () => {
  automatedClick();
});

watch(() => props.filters.toggle3, () => {
  stopTimelapse();
  const svg = d3.select(mapContainer.value).select('svg');
  updateRobotPosition(svg, window.innerWidth, (window.innerWidth * 0.971)*0.75);
});

watch(() => props.filters.toggle2, () => {
  stopTimelapse();
  const svg = d3.select(mapContainer.value).select('svg');
  updatePlantsAndWeeds(svg);
});

watch(() => plants.value, () => {
  stopTimelapse();
  if (props.filters.toggle2){
    const svg = d3.select(mapContainer.value).select('svg');
    updatePlantsAndWeeds(svg);
  }
});

watch(() => props.filters.toggle4, () => {
  stopTimelapse();
  const svg = d3.select(mapContainer.value).select('svg');
  updateDistances(svg);
});

watch(() => farmbotStore.resyncRequired, () => {
  //renderBaseMap();
  loadData();
});

watch(() => props.filters.toggle1, () => {
  stopTimelapse();
  //this watcher replaces the background texture in the map with an image found at farmbotStore.myCurrentFieldImage
  
  console.log('toggle1', props.filters.toggle1);
  if (props.filters.toggle1) {
    props.filters.toggle2 = false;
    props.filters.toggle3 = false;
    props.filters.toggle4 = false;
    props.filters.toggle5 = false;

    const svg = d3.select(mapContainer.value).select('svg');
    svg.append('image')
    .attr('class', 'photoOverlay')
    .attr('href', farmbotStore.myCurrentFieldImage)
    .attr('width', window.innerWidth)
    .attr('height', (window.innerWidth * 0.971) * 0.75)
    .attr('preserveAspectRatio', 'xMidYMid slice');
  } else {
    const svg = d3.select(mapContainer.value).select('svg');
    svg.selectAll('.photoOverlay').remove();
  }
});

watch(() => props.filters.toggle5, async (newVal) => {
  if (newVal) {
    // Turn off all other toggles when toggle5 is turned on
    props.filters.toggle1 = false;
    props.filters.toggle2 = false;
    props.filters.toggle3 = false;
    props.filters.toggle4 = false;

    // Load images and create a GIF
    // await loadTimeLapseImages();
    playGif.value = true;
  } else {
    // Reset the GIF URL when toggle5 is turned off
    props.filters.toggle1 = false;
    props.filters.toggle2 = true;
    props.filters.toggle3 = false;
    props.filters.toggle4 = false;
    playGif.value = false;
  }

  const svg = d3.select(mapContainer.value).select('svg');
  updateTimeLapse(svg, window.innerWidth, (window.innerWidth * 0.971) * 0.75);
});

onMounted(() => {
  farmbotStore.SpotforPlanting = false;
  farmbotStore.automatedPlantingPoint = { x: 0, y: 0 };
  renderBaseMap();
  loadData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>



<style scoped>
.map-container {
  width: 100%;
  position: relative;
}

.map-container img.time-lapse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>