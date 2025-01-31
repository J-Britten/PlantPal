/**
 * Using the gridArea and photogrid area values (which are fixed until someone changes something in the calibration)
 * 
 * this generates a map returning the the ID of which photo intersects with which field
 */

export default () => {

type Point = { x: number; y: number };
type Area = { min: Point; max: Point; number: number };

const gridAreas = generateGridAreas(256,49, 907,873, 3, 6, "row")
  
const photoGridAreas  = generateGridAreas(0,0,369.968,506.624, 6,16, "column")


  // Example usage
const intersections = findIntersections(gridAreas, photoGridAreas);

return intersections;

  function generateGridAreas(startX: number, startY: number, cellWidth: number, cellHeight: number, rows: number, columns: number, order: "row" | "column"): Area[] {
    const areas: Area[] = [];
  
    let counter = 1; // Initialize counter to start at 1
  
    if (order === "row") {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const min: Point = {
            x: startX + col * cellWidth,
            y: startY + row * cellHeight,
          };
          const max: Point = {
            x: min.x + cellWidth,
            y: min.y + cellHeight,
          };
          areas.push({ min, max, number: counter++ }); // Increment counter with each generated area
        }
      }
    } else { // Generate by column with every 2nd column counting backwards
      for (let col = 0; col < columns; col++) {
        if (col % 2 === 0) { // Even column (0-indexed), count forwards
          for (let row = 0; row < rows; row++) {
            const min: Point = { x: startX + col * cellWidth, y: startY + row * cellHeight };
            const max: Point = { x: min.x + cellWidth, y: min.y + cellHeight };
            areas.push({ min, max, number: counter++ });
          }
        } else { // Odd column, count backwards
          for (let row = rows - 1; row >= 0; row--) {
            const min: Point = { x: startX + col * cellWidth, y: startY + row * cellHeight };
            const max: Point = { x: min.x + cellWidth, y: min.y + cellHeight };
            areas.push({ min, max, number:counter++ });
          }
        }
      }
      // Adjust counter after filling all areas
    }
  
    return areas;
  }
  
  // Step 1: Define the Intersection Logic
  function intersects(area1, area2) {
    // Check if one rectangle is to the left of the other
    if (area1.max.x < area2.min.x || area2.max.x < area1.min.x) return false;
    // Check if one rectangle is above the other
    if (area1.max.y < area2.min.y || area2.max.y < area1.min.y) return false;
    return true;
  }
  
  // Step 2 & 3: Iterate Over gridAreas and photoGridAreas and Store Intersection Information
  function findIntersections(gridAreas, photoGridAreas) {
    const intersections = new Map(); // Key: gridArea number, Value: Array of intersecting photoGridAreas numbers
  
    gridAreas.forEach((gridArea) => {
      const intersectingAreas = [];
  
      photoGridAreas.forEach((photoArea) => {
        if (intersects(gridArea, photoArea)) {
          intersectingAreas.push(photoArea.number);
        }
      });
  
      intersections.set(gridArea.number, intersectingAreas);
    });
  
    return intersections;
  }
  
  
  
}
