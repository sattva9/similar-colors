import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import ColorPicker from "react-color-picker-wheel";

function App() {
  const [color, setColor] = useState({ r: 255, g: 0, b: 0 });
  const [similarColors, setSimilarColors] = useState(Array());

  async function similar_colors(new_color) {
    let query = [new_color["r"], new_color["g"], new_color["b"]];
    setSimilarColors(await invoke("similar_colors", { query }));
  }

  return (
    <main className="container">
      <h1>Pick a color</h1>

      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "40%",
            padding: "2%",
            justifyContent: "center",
          }}
        >
          <ColorPicker
            initialColor={color}
            onChange={(new_color) => {
              similar_colors(new_color["rgb"]);
              setColor(new_color["rgb"]);
            }}
            style={{ width: "500px", height: "500px", marginLeft: "0" }}
            size={300}
          />
        </div>

        <div style={{ width: "60%", padding: "2%" }}>
          <div
            style={{
              width: "100%",
              margin: "1%",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <div
              style={{
                height: "50px",
                width: "50px",
                backgroundColor:
                  "rgb(" +
                  color["r"] +
                  "," +
                  color["g"] +
                  "," +
                  color["b"] +
                  ")",
              }}
            ></div>
          </div>

          <div style={{ padding: "1%" }}>
            {"rgb(" + color["r"] + "," + color["g"] + "," + color["b"] + ")"}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              width: "100%",
              margin: "1%",
              justifyContent: "center",
            }}
          >
            {similarColors.map((c, index) => (
              <div
                id={c}
                key={index}
                style={{
                  height: "50px",
                  width: "50px",
                  backgroundColor: c,
                  // margin: "5px",
                }}
                onClick={(event) => {
                  let color_list = event.target.id.slice(4, -1).split(",");
                  let new_color = {
                    r: Number(color_list[0]),
                    g: Number(color_list[1]),
                    b: Number(color_list[2]),
                  };

                  similar_colors(new_color);
                  setColor(new_color);
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
