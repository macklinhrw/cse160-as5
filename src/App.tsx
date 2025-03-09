import { useEffect, useState } from "react";
import { THREE_CANVAS_ID, World } from "./lib/world";
import Notes from "./notes";

// Chicken by jeremy [CC-BY] via Poly Pizza

function App() {
  const [showNotes, setShowNotes] = useState(true);

  useEffect(() => {
    const world = new World();

    return () => world.destroy();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="absolute p-2 top-1 right-1">
        <div className="flex flex-col">
          <button
            className="bg-blue-400/70 p-2 border-1 border-black/30 hover:bg-blue-500 hover:cursor-pointer rounded-sm"
            onClick={() => setShowNotes(!showNotes)}
          >
            Notes to grader
          </button>
          {showNotes && (
            <div className="mt-2 -ml-20">
              <Notes />
            </div>
          )}
        </div>
      </div>
      <div className="absolute p-2 top-1 left-1 text-gray-200 bg-gray-700/70 rounded-sm">
        <p>
          <span className="font-bold">Controls:</span>
          <br />
          <span className="font-bold">W, A, S, D</span>: movement
          <br />
          <span className="font-bold">Space and shift</span>: vertical movement
          <br />
          <span className="font-bold">T</span>: Toggle topdown camera
          <br />
          <span className="font-bold">Esc</span>: Toggle pointer lock
        </p>
      </div>

      <canvas id={THREE_CANVAS_ID} className="bg-blue-400" />
    </div>
  );
}

export default App;
