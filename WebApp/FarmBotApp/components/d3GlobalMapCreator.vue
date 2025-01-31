<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, defineProps } from 'vue';
import * as d3 from 'd3';
import robotImage from '@/assets/robot64.png';
import { getAllPlantsandWeeds, farmbotPosition } from '../utils/fieldHelper';
import { useFarmbotStore } from '~/stores/farmbotStore';
import { useConnectionStore } from '~/stores/clientSocketStore';
import lettuceImage from "@/assets/lettuce.png";
import marigoldImage from "@/assets/marigold.png";
import cornflowerImage from "@/assets/cornflower.png";
import radishImage from "@/assets/radish.png";
import blackCuminImage from "@/assets/black_cumin.png";
import weedingImage from "@/assets/weeding.png";

const farmbotStore = useFarmbotStore();
const connectionStore = useConnectionStore();

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

let robotPosition = { x: 0, y: 0 };
let plants = [];
let weeds = [];

const mapContainer = ref(null);

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




const drawBaseMap = (dataURL: string) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const bedWidth = viewportWidth;
  const bedHeight = viewportHeight / 4;

  const svg = d3.select(mapContainer.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', bedHeight)
    .attr('viewBox', `0 0 ${bedWidth} ${bedHeight}`)
    .attr('preserveAspectRatio', 'xMinYMin meet');

  const zoomGroup = svg.append('g')
    .attr('class', 'zoom-group');

  if (props.filters.toggle1) {
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'mapTexture')
      .attr('patternUnits', 'objectBoundingBox')
      .attr('width', 1)
      .attr('height', 1);

    pattern.append('image')
      .attr('href', dataURL)
      .attr('width', bedWidth)
      .attr('height', bedHeight)
      .attr('preserveAspectRatio', 'xMidYMid slice');

    zoomGroup.append('rect')
      .attr('width', bedWidth)
      .attr('height', bedHeight)
      .attr('fill', 'url(#mapTexture)')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);
  }

  const rows = 3;
  const cols = 6;
  const cellWidth = bedWidth / cols;
  const cellHeight = bedHeight / rows;

  let count = 1;
  for (let row = rows - 1; row >= 0; row--) {
    for (let col = 0; col < cols; col++) {
      const fieldGroup = zoomGroup.append('g')
        .attr('transform', `translate(${col * cellWidth}, ${row * cellHeight})`)
        .attr('class', `field field-${count}`)
        .on('mouseover', function() {
          d3.select(this).select('rect')
            .attr('fill', 'rgba(150, 75, 0, 0.5)')
            .attr('text', count);
        })
        .on('mouseout', function() {
          d3.select(this).select('rect').attr('fill', 'rgba(150, 75, 0, 0.8)');
        });
      if (col === farmbotStore.myI-1 && row === (rows - farmbotStore.myJ) - 1) {
        fieldGroup.append('rect')
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('fill', props.filters.toggle1 ? 'none' : 'rgba(150, 75, 0, 0.8)')
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
          .attr('class', 'my-field');
      } else {
        fieldGroup.append('rect')
          .attr('width', cellWidth)
          .attr('height', cellHeight)
          .attr('fill', props.filters.toggle1 ? 'none' : 'rgba(150, 75, 0, 0.8)')
          .attr('stroke', '#FFE')
          .attr('stroke-width', 0.1);
      }

      count++;
    }
  }

  const zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on('zoom', (event) => {
      if (event.transform.k > 1) {
        zoomGroup.attr('transform', event.transform);
      } else {
        zoomGroup.attr('transform', 'translate(0,0) scale(1)');
      }
    });

  svg.call(zoom);
  svg.selectAll('.my-field').raise();

  return { svg, zoomGroup, bedWidth, bedHeight };
};

const updateRobotPosition = (zoomGroup, viewportWidth, viewportHeight) => {
  const robotImageSelection = zoomGroup.selectAll('.robot');
  const robotImageSize = 64;

  if (props.filters.toggle3 && (robotPosition.x !== -1 && robotPosition.y !== -1 || robotPosition.x !== undefined && robotPosition.y !== undefined)) {
    if (robotImageSelection.empty()) {
      zoomGroup.append('image')
        .attr('class', 'robot')
        .attr('href', robotImage)
        .attr('x', robotPosition.x - robotImageSize / 2)
        .attr('y', robotPosition.y - robotImageSize / 2)
        .attr('width', robotImageSize)
        .attr('height', robotImageSize);
    } else {
      robotImageSelection
      .raise()
      .attr('x', robotPosition.x - robotImageSize / 2)
      .attr('y', robotPosition.y - robotImageSize / 2);
    }
  } else {
    robotImageSelection.remove();
  }
};



const updatePlantsAndWeeds = (zoomGroup) => {
  zoomGroup.selectAll('.plant').remove();
  zoomGroup.selectAll('.weed').remove();

  if (props.filters.toggle4) {
    plants.forEach(plant => {
      const image_size = 10;
      zoomGroup.append('image')
        .attr('class', 'plant')
        .attr('href', getPlantImage(plant.name))
        .attr('width', image_size)
        .attr('height', image_size)
        .attr('x', plant.x - image_size / 2)
        .attr('y', plant.y - image_size / 2);
    });

    weeds.forEach(weed => {
      zoomGroup.append('circle')
        .attr('class', 'weed')
        .attr('cx', weed.x)
        .attr('cy', weed.y)
        .attr('r', 3)
        .attr('fill', 'red')
        .attr('fill-opacity', 0.1);
    });
  }
  updateRobotPosition(zoomGroup, window.innerWidth, window.innerHeight / 4);

};

const renderBaseMap = () => {
  try {
    let imageOverlay = "./earth-texture.png";
   // const dataURL = props.filters.toggle1 ? (combinedImageDataUrl || earthTexture) : earthTexture;
    console.log('current combined image', farmbotStore.currentCombinedImage);
    if(farmbotStore.currentCombinedImage !== '' && props.filters.toggle1) {
      console.log('using current combined image');
      imageOverlay = farmbotStore.currentCombinedImage;
    }

   /* if (!combinedImageDataUrl && props.filters.toggle1) {
      //getImageDataUrl(farmbotStore.currentCombinedImage, (processedDataUrl) => {
        combinedImageDataUrl = processedDataUrl;
        const { svg, zoomGroup, bedWidth, bedHeight } = drawBaseMap(processedDataUrl);

        // Initial rendering of dynamic elements if data is already loaded
        updateRobotPosition(zoomGroup, bedWidth, bedHeight);
        updatePlantsAndWeeds(zoomGroup);
      //});
    } else {*/
      const { svg, zoomGroup, bedWidth, bedHeight } = drawBaseMap(imageOverlay);

      // Initial rendering of dynamic elements if data is already loaded
      updatePlantsAndWeeds(zoomGroup);
      updateRobotPosition(zoomGroup, bedWidth, bedHeight);
  //  }
  } catch (error) {
    console.log('Error rendering base map', error);
  }
};

const loadData = async () => {
  await getAllPlantsandWeeds(window.innerWidth, window.innerHeight / 4);
  robotPosition = farmbotPosition(window.innerWidth, window.innerHeight / 4);
  weeds = farmbotStore.allWeeds;
  plants = farmbotStore.allPlantsSimple;

  // Update map with loaded data
  const zoomGroup = d3.select('.zoom-group');
  const bedWidth = window.innerWidth;
  const bedHeight = window.innerHeight / 4;
  updateRobotPosition(zoomGroup, bedWidth, bedHeight);
  updatePlantsAndWeeds(zoomGroup);
};

const handleResize = () => {
  // Remove existing SVG
  d3.select(mapContainer.value).select('svg').remove();

  // Re-render the map and reload data
  renderBaseMap();
  loadData();
};

watch(() => connectionStore.farmbotPosition, () => {
  robotPosition = farmbotPosition(window.innerWidth, window.innerHeight / 4);
  const zoomGroup = d3.select('.zoom-group');
  const bedWidth = window.innerWidth;
  const bedHeight = window.innerHeight / 4;
  updateRobotPosition(zoomGroup, bedWidth, bedHeight);
});

watch(() => props.filters.toggle3, () => {
  const zoomGroup = d3.select('.zoom-group');
  const bedWidth = window.innerWidth;
  const bedHeight = window.innerHeight / 4;
  updateRobotPosition(zoomGroup, bedWidth, bedHeight);
});

watch(() => props.filters.toggle4, () => {
  props.filters.toggle1 = !props.filters.toggle4;
  const zoomGroup = d3.select('.zoom-group');
  updatePlantsAndWeeds(zoomGroup);
});

watch(() => props.filters.toggle1, () => {
  props.filters.toggle4 = !props.filters.toggle1;
  // Remove existing SVG
  d3.select(mapContainer.value).select('svg').remove();
  // Re-render the map with the updated background
  renderBaseMap();
});

watch(() => farmbotStore.resyncRequired, () => {
  //renderBaseMap();
  loadData();
});

onMounted(() => {
  if (!farmbotStore.currentCombinedImage) {
    console.log('fetching latest grid images');
    farmbotStore.fetchLatestGridImages();
  }
  renderBaseMap();
  loadData();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.robot {
  z-index: 1000;
}
</style>
