const Notes = () => {
  return (
    <div className="bg-gray-700/70 rounded-sm absolute p-2 border-1 border-black/30 text-gray-200">
      <p className="font-bold">Notes</p>
      <p className="font-bold">Lighting:</p>
      <p>
        I used a directional light, an ambient light, and a hemisphere light.
      </p>
      <p className="font-bold">For the extras:</p>
      <ul>
        <li>
          1. I added Fog, which is a bit subtle, you can see it in the distance.
        </li>
        <li>2. I added a secondary topdown camera, use 't' to toggle it.</li>
        <li>
          3. I added picking which overlays a transparent block onto the terrain
          and uses a raycaster.
        </li>
      </ul>
      <p className="font-bold">Other notes:</p>
      <p>
        Instead of using orbit controls, I used pointer lock controls for first
        person.
      </p>
    </div>
  );
};

export default Notes;
