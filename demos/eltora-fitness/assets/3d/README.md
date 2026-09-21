# 3D assets

There are no separate 3D model files in this project, on purpose. The hero
dumbbell and the three pieces in the equipment viewer (kettlebell, plate,
dumbbell) are built from primitive geometry in `script.js`:

- **Dumbbell:** bevelled hexagonal heads (`ExtrudeGeometry`), a knurled handle
  (bump-mapped cylinder), chrome collars and a lime ring.
- **Kettlebell:** a sphere with a flattened base, a swept tube handle and a lime
  grip band.
- **Plate:** lathe-turned rubber disc, chrome hub and lime ring.
- **Branding:** the "ELTORA 20 KG" end plates are drawn to a canvas at runtime
  and applied as textures. They use the site's web font and redraw once it loads.
- **Reflections:** an environment map generated from Three.js `RoomEnvironment`.

Because everything is generated, the whole 3D layer costs no extra downloads
and works offline and from `file://`.

To use your own model instead (for example a GLB of your actual equipment),
load it with Three.js `GLTFLoader` and replace the `buildDumbbell`,
`buildKettlebell` or `buildPlate` call in `script.js`. Put the file in this
folder. `GLTFLoader` needs the site to be served over http (not `file://`).
