let treemap;
let depth;

window.onload = function () {
  const jsonFileInput = document.querySelector("#jsonfile");
  const depthInput = document.querySelector("#depth");
  depth = Number(depthInput.value);

  jsonFileInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const json = JSON.parse(e.target.result);
      const startTime = performance.now();
      treemap = generateTree(json, startTime);
      drawChart(treemap, depth, startTime);
    };
    reader.readAsText(file);
  });

  depthInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const newVal = event.target.value;
      if (newVal === "") {
        return;
      }

      const numNewVal = Number(newVal);
      if (Number.isNaN(numNewVal)) {
        return;
      }

      depth = numNewVal;
      const startTime = performance.now();
      drawChart(treemap, depth, startTime);
    }
  });
};

function generateTree(json, startTime) {
  console.log("reading json");

  const treemap = [];
  const data = { name: "JSON", children: [] };
  treemap.push(data);

  const children = data.children;
  recursiveGenerateTree(children, json);

  const treeEndTime = performance.now();
  console.log("treemap is constructed in ", treeEndTime - startTime, treemap);

  return treemap;
}

function recursiveGenerateTree(children, json) {
  for (const key in json) {
    const value = json[key];

    if (isPrimitive(value)) {
      children.push({ name: key, value: JSON.stringify(value).length });
      continue;
    }

    if (Array.isArray(value) && value.length > 0 && isPrimitive(value[0])) {
      children.push({ name: key, value: JSON.stringify(value).length });
      continue;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      Object.values(value).every((v) => isPrimitive(v))
    ) {
      children.push({ name: key, value: JSON.stringify(value).length });
      continue;
    }

    const child = { name: key, children: [] };
    children.push(child);
    recursiveGenerateTree(child.children, value);
  }
}

function drawChart(treemap, depth, startTime) {
  console.log("drawing the chart");

  // Clear the content of the container.
  const container = document.querySelector("#container");
  container.innerHTML = "";

  const chart = anychart.treeMap(treemap, "as-tree");
  chart.title("Contents of the JSON file");
  chart.sort("asc");
  chart.maxDepth(depth);
  chart.container("container");
  chart.draw();

  const endTime = performance.now();
  console.log("total time taken", endTime - startTime);
}

function isPrimitive(test) {
  return test !== Object(test);
}
