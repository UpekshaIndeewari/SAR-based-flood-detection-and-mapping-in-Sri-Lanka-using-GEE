// ----------------------------
// 1. Define AOIs
// ----------------------------
var aois = [
  ee.Geometry.Polygon([
    [[79.80493249194532,6.729642150854826],
     [80.14825524585157,6.729642150854826],
     [80.14825524585157,7.059574863894694],
     [79.80493249194532,7.059574863894694],
     [79.80493249194532,6.729642150854826]]
  ]),
  ee.Geometry.Polygon([
    [[79.78175820605722,7.069625121535838],
     [80.25417031543222,7.069625121535838],
     [80.25417031543222,7.434722199452536],
     [79.78175820605722,7.434722199452536],
     [79.78175820605722,7.069625121535838]]
  ]),
  ee.Geometry.Polygon([
    [[80.32665448149277,8.183130086177075],
     [80.58002667387558,8.183130086177075],
     [80.58002667387558,8.435201213682745],
     [80.32665448149277,8.435201213682745],
     [80.32665448149277,8.183130086177075]]
  ]),
  ee.Geometry.Polygon([
    [[81.37781083306223,7.3895501808142665],
     [81.87768876274973,7.3895501808142665],
     [81.87768876274973,7.861866375861265],
     [81.37781083306223,7.861866375861265],
     [81.37781083306223,7.3895501808142665]]
  ]),
  ee.Geometry.Polygon([
    [[80.00196082641364,6.560581347429805],
     [80.10907752563239,6.560581347429805],
     [80.10907752563239,6.666303175966012],
     [80.00196082641364,6.666303175966012],
     [80.00196082641364,6.560581347429805]]
  ]),
  ee.Geometry.Polygon([
    [[79.96520519723421,6.8538758445328725],
     [80.1293134736014,6.8538758445328725],
     [80.1293134736014,6.993270856180094],
     [79.96520519723421,6.993270856180094],
     [79.96520519723421,6.8538758445328725]]
  ]),
  ee.Geometry.Polygon([
    [[79.8908619720805,7.026587710972172],
     [80.0450138885844,7.026587710972172],
     [80.0450138885844,7.15979949242824],
     [79.8908619720805,7.15979949242824],
     [79.8908619720805,7.026587710972172]]
  ]),
  ee.Geometry.Polygon([
    [[79.77481696118721,7.3263813069090284],
     [80.01651617993721,7.3263813069090284],
     [80.01651617993721,7.552428523137032],
     [79.77481696118721,7.552428523137032],
     [79.77481696118721,7.3263813069090284]]
  ]),
  ee.Geometry.Polygon([
    [[81.39690184378756,7.655965157652468],
     [81.70795225882662,7.655965157652468],
     [81.70795225882662,7.946448917096393],
     [81.39690184378756,7.946448917096393],
     [81.39690184378756,7.655965157652468]]
  ])
];

// Convert AOIs array to a FeatureCollection (it can be used in Earth Engine operations like filtering, clipping, and reduction)
var aoiCollection = ee.FeatureCollection(aois);
Map.centerObject(aoiCollection, 11);
Map.addLayer(aoiCollection, {color: 'red'}, 'All AOIs');

// ----------------------------
// 2. Date ranges (pre and post event dates)
// ----------------------------
var date2_start = '2025-11-25';
var date2_end   = '2025-11-27';
var date3_start = '2025-11-30';
var date3_end   = '2025-12-03';

// ----------------------------
// 3. Function to get Sentinel-1 mosaic (VV)
// ----------------------------
function getMosaicS1(start, end) {
  var col = ee.ImageCollection('COPERNICUS/S1_GRD')
    .filterBounds(aoiCollection)
    .filterDate(start, end)
    .filter(ee.Filter.eq('instrumentMode', 'IW')) //Interferometric Wide
    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
    .select('VV'); //Uses VV polarization, which is sensitive to surface water (water appears dark).

  return col.mosaic().clip(aoiCollection); //Combines multiple images into a single mosaic and clips to AOI
}

// Get mosaics for each date range
var img2 = getMosaicS1(date2_start, date2_end);
var img3 = getMosaicS1(date3_start, date3_end);

// Visualize SAR images
Map.addLayer(img2, {min:-25, max:0}, 'SAR Image 2 (Nov 26)');
Map.addLayer(img3, {min:-25, max:0}, 'SAR Image 3 (Dec 2)');

// Print for inspection
print("Image 2", img2);
print("Image 3", img3);

// ----------------------------
// 4. Change detection (Nov-Dec)
// ----------------------------
// computes pixel-wise difference
var change = img2.subtract(img3);
Map.addLayer(change, {min:-5, max:5}, 'SAR Change Nov-Dec');

// ----------------------------
// 5. Water mask (use FeatureCollection)
// ----------------------------
// Create a mask of permanent water bodies. Used to avoid false flood detection in permanent lakes/rivers
var water_mask = imageCollection.select('label')
  .filterDate('2024','2025')
  .filterBounds(aoiCollection)
  .mode()
  .eq(0).not();

// Threshold for change
var thr = change.gt(3).updateMask(water_mask); //Keeps pixels where SAR backscatter dropped significantly (> 3 dB)
Map.addLayer(thr.clip(aoiCollection), [], 'SAR Change >3', false);

// Remove small patches
// Removes small isolated pixel clusters, Applies a spatial smoothing filter (majority filter)
var thr_clean = thr.updateMask(thr.connectedPixelCount(10, true).gte(5));
var thr_smooth = thr_clean.focal_mode(1);
Map.addLayer(thr_smooth.clip(aoiCollection), [], 'SAR Change_clean >3', false);

// Extract flooded areas
// Combines threshold + smoothing result produces final flood mask
var flooded = thr.updateMask(thr_smooth);
Map.addLayer(flooded.clip(aoiCollection), {palette:['blue']}, 'Flooded', false);

// ----------------------------
// 6. Flooded area calculation
// ----------------------------
var area_img = flooded.multiply(ee.Image.pixelArea().divide(1e6)); // km²
var flood_area  = area_img.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: aoiCollection,
  scale: 10,
  maxPixels: 1e13
});
print("Flooded area (km²):", flood_area);

// ----------------------------
// 7. Precipitation chart (GPM)
// ----------------------------
// Loads precipitation data from NASA GPM IMERG and generates a time series chart to shows average precipitation over AOIs across time
var pr = ee.ImageCollection("NASA/GPM_L3/IMERG_V07")
  .select('precipitation')
  .filterDate('2025-11-24','2025-12-03');

print(
  ui.Chart.image.series(pr, aoiCollection, ee.Reducer.mean(), 10000, 'system:time_start')
);
