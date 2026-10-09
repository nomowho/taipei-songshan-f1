# Taipei landmark geometry

`landmarks.js` provides static, original interpretive models of Miramar's rooftop wheel and the Grand Hotel. They share the existing east +X / north +Z map projection. The models are architectural approximations, not surveyed CAD or photogrammetry.

## API and integration

Load `landmarks.js` before the main scene script. Its browser global is `CircuitLandmarks`; CommonJS exports the same `{places, build}` object.

```js
CircuitLandmarks.build(objects); // Appends both landmarks, returns the supplied mesh.
const wheel = CircuitLandmarks.places.miramar;
const hotel = CircuitLandmarks.places.grandHotel;
```

The builder requires only `mesh.quad(a,b,c,d,color,type)` and `mesh.tri(a,b,c,color,type)`. All local transforms, boxes and tubes become these primitives. A Canvas2D adapter can therefore use the same geometry. There is no WebGL, DOM, animation or external runtime dependency in this module. Materials are 0 solid, 8 metal, 10 glass, and 12 night LED; the scene's existing theme shader controls illumination.

Each place has `name`, `lon`, `lat`, projected `x`/`z`, and `exclude: {osmIds, bounds}`. Bounds use **[minimum X, minimum Z, maximum X, maximum Z]** in metres. Before building the city, remove only the matching OSM building IDs from the city geometry in both rendering modes. Bounds are a fallback for datasets without IDs, not a reason to erase every nearby street, park or hotel outbuilding.

- Miramar: exclude building way **155816458**. Its mapped geographic bounds are longitude 121.5566439–121.5582749, latitude 25.082784–25.0837817. The module includes an approximate mall volume because the wheel must stand on a roof.
- Grand Hotel: exclude main building way **25202548** only. Its mapped bounds are longitude 121.5256799–121.5269049, latitude 25.0781821–25.0790551. Hotel area way 557039975 and site relation 7659663 are supporting location references; surrounding buildings remain separate.

The projection is `x=(lon-121.55250715)*111320*cos(25.06959915°)` and `z=(lat-25.06959915)*111320+100`; scene ground is y=-8.

## Verified references and deliberate estimates

| Feature | Source facts | Model decision / uncertainty |
|---|---|---|
| Miramar mall location | [Tourism Administration](https://www.tad.gov.tw/m1.aspx?id=10207&sNo=0001016) gives 121.55725, 25.083341 and identifies the wheel as a hundred-metre landmark with night lighting. | This is the mall's tourism pin, not the wheel centre. The wheel uses the more specific OSM rooftop point below. |
| Wheel rooftop position | OSM node [5121602758](https://www.openstreetmap.org/node/5121602758), also present in `work/taipei-small-2-3.xml`, gives 121.5577156, 25.082807 and floor 5. | No authoritative axle survey is available. Node precision must not be mistaken for centimetre accuracy; ring orientation along the east–west axis is an interpretive choice. |
| Wheel diameter and cabins | [Taipei City audio guide](https://www.travel.taipei/zh-tw/media/audio-guide/details/209) describes 48 cabins, including two transparent-bottom cabins, and 100 m overall height. [Taipei City publication](https://www.travel.taipei/file/1761/) describes a 70 m diameter. | Ring diameter 69.2 m; maximum visible elevation approximately 101 m above scene ground, including structural tube radius. The centre, deck, cabin dimensions, spoke count, ring separation and support geometry are estimated. Two cabins use lighter glazing as a simplified visual distinction. |
| Grand Hotel location | OSM main footprint [25202548](https://www.openstreetmap.org/way/25202548) has 14 levels and sits inside hotel area [557039975](https://www.openstreetmap.org/way/557039975). | Uses approximate map pin 121.5263883, 25.0787252 within the main footprint, not a claimed surveyed building centroid. Facade angle of -22° is estimated from the mapped diagonal outline. |
| Hotel character | [Grand Hotel official site](https://www.grand-hotel.org/TW/official/main.aspx?gh=tp) describes its fourteen-storey palace architecture, red columns and gold tiles on the hillside. | Fourteen 4.5 m facade modules, red columns on all four faces, projecting balconies, and gold roof geometry. The room count, exact facade bay count and architectural ornament are not replicated. |
| Hotel dimensions and hill | No surveyed vertical section or roof dimensions were supplied. | Core 126×58 m, main roof 154×82 m, roof eave y=95.7 and ridge approximately y=112.2; floor podium y=32. These dimensions and the three sloping green terraces are compositional estimates. The hill is not elevation data. |

The wheel has two spaced structural rings, spokes on both faces, an axle, four A-frame legs, cross ties and 48 upright glazed cabins. Static six-colour perimeter lights preserve the recognizable night silhouette. The hotel uses a curved hip roof with raised corners and a short ridge, rather than a flat pyramid; small gold roofs over the entrance and side wings reinforce the palace silhouette from oblique views. Warm LED strips follow fourteen balcony levels.

OSM geographic references retain the project's existing OpenStreetMap contributor attribution and ODbL obligations. Original generated architectural meshes do not claim a licence to reproduce official logos or a sanctioned racing event.

## Verification

`node --test tests/landmarks.test.cjs` exercises the actual renderer mesh. It checks finite coordinates, normalized normals, bounded mesh cost, mapped geographic extents, day/night material presence, 48 independent glazed cabins, rooftop clearance, fourteen balcony light levels, roof coverage and upward lighting normals. The output is approximately 95,850 vertices / 31,950 triangles. Integration was checked in the full scene through the dedicated landmark presets, day/night switching and the shared 2D adapter. Real-device iPhone Safari validation remains outstanding.
