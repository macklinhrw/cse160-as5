import * as THREE from "three";

let textureAtlas: THREE.Texture | null = null;

// Make a textured box mesh from a texture atlas
export const makeTexAtlasBoxMesh = (
  loader: THREE.TextureLoader,
  textureX: number,
  textureY: number
) => {
  if (!textureAtlas) {
    textureAtlas = loader.load("./textures/14w25a_textures.webp");
  }

  const textureWidth = 32;
  const textureHeight = 32;
  const textureResolution = 16;

  const atlasWidth = textureResolution * textureWidth;
  const atlasHeight = textureResolution * textureHeight;
  const pixelInset = 1; // 1 pixel inset

  const pixelSizeU = pixelInset / atlasWidth;
  const pixelSizeV = pixelInset / atlasHeight;

  textureAtlas.magFilter = THREE.NearestFilter;
  textureAtlas.minFilter = THREE.NearestFilter;
  textureAtlas.colorSpace = THREE.SRGBColorSpace;

  // Calculate uv coords with pixel inset
  const uMin = textureX / textureWidth + pixelSizeU;
  const uMax = (textureX + 1) / textureWidth - pixelSizeU;
  const vMin = 1 - (textureY + 1) / textureHeight + pixelSizeV;
  const vMax = 1 - textureY / textureHeight - pixelSizeV;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const uvAttribute = geometry.attributes.uv;

  // Iterate over each face and set uv coords at each index
  for (let face = 0; face < 6; face++) {
    const i = face * 4;

    uvAttribute.setXY(i, uMin, vMin);
    uvAttribute.setXY(i + 1, uMax, vMin);
    uvAttribute.setXY(i + 2, uMin, vMax);
    uvAttribute.setXY(i + 3, uMax, vMax);
  }

  const material = new THREE.MeshPhongMaterial({
    map: textureAtlas,
  });
  return new THREE.Mesh(geometry, material);
};
