# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

## Layered tile maps and tileset atlases

The renderer supports multiple map layers and variable‑sized assets from a tileset atlas JSON.

- **Backward compatible**: existing maps with a single `tiles` array still work. Internally they are treated as a single `below` layer.
- **Layers**: define an array of layers; each layer may use its own `tileset` and optional `tilesetAtlas`. Use `z: "below" | "above"` to render before/after the player (useful for stairs, bridges, tree canopies, etc.).
- **Cells**: each cell in a layer can be either a number (grid tile index, size = `tileWidth` x `tileHeight`) or a string (asset id looked up in the layer's atlas JSON). Strings enable variable‑sized sprites aligned to the grid cell using anchors.
- **Collisions**: numeric tiles use the map's `solidTiles` list. Atlas assets can set `solid: true` in the atlas to participate in collisions.

### Map JSON (excerpt)
```json
{
  "id": "house",
  "name": "House",
  "tileWidth": 16,
  "tileHeight": 16,
  "width": 18,
  "height": 12,
  "background": "#2b2621",
  "outsideSolid": true,
  "solidTiles": [1],
  "layers": [
    { "name": "ground", "z": "below", "tileset": "/game/tilesets/house.png", "tiles": [[0,0,1], [0,0,0]] },
    { "name": "stairs", "z": "above", "tileset": "/game/tilesets/house.png", "tilesetAtlas": "/game/tilesets/house.atlas.json", "tiles": [["stair_top", 0, 0], [0,0,0]] }
  ]
}
```

### Tileset atlas JSON
```json
{
  "image": "/game/tilesets/house.png",
  "assets": {
    "stair_top": { "x": 128, "y": 64, "w": 32, "h": 24, "anchorX": 0.5, "anchorY": 1, "solid": false },
    "tree_large": { "x": 256, "y": 0, "w": 64, "h": 96, "anchorX": 0.5, "anchorY": 1, "solid": true }
  }
}
```

- `x,y,w,h`: source rectangle within the tileset image.
- `anchorX, anchorY` (0..1): where the asset attaches to the grid cell. Defaults to `(0.5, 1)` so the bottom center of the sprite sits on the cell.
- `offsetX, offsetY` (px): fine‑tune placement relative to the anchored position.
- `solid`: when true the cell is treated as collidable for movement.
