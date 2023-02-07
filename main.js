let json;
let depth;

window.onload = function () {
  const jsonFileInput = document.querySelector("#jsonfile");
  const depthInput = document.querySelector("#depth");
  depth = Number(depthInput.value);

  jsonFileInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      json = JSON.parse(event.target.result);
      readAndDrawChart(json, depth);
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
      if (numNewVal === NaN) {
        return;
      }
      depth = numNewVal;
      readAndDrawChart(json, depth);
    }
  });
};

function readAndDrawChart(json, depth) {
  console.log("reading json");
  // Clear the content of the container.
  const container = document.querySelector("#container");
  container.innerHTML = "";

  const dataSet = [];
  const data = { name: "JSON", children: [] };
  dataSet.push(data);
  const children = data.children;

  const start = performance.now();
  recursiveGenerateTree(children, json);
  const treeEnd = performance.now();
  console.log("dataset is constructed in ", treeEnd - start, dataSet);

  const chart = anychart.treeMap(dataSet, "as-tree");
  chart.title("Size of the JSON content");
  chart.sort("asc");
  chart.maxDepth(depth);
  chart.container("container");
  chart.draw();

  const end = performance.now();
  console.log("total time taken", end - start);
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

function isPrimitive(test) {
  return test !== Object(test);
}
