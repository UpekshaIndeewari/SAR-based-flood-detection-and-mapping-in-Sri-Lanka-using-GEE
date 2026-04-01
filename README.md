# SAR based flood detection and mapping in Sri Lanka using GEE
## 1. Abstract

This project presents a Synthetic Aperture Radar (SAR)-based flood detection analysis conducted over Sri Lanka for the late November to early December 2025 flood event. The analysis was performed using Google Earth Engine with Sentinel-1 C-band SAR imagery.

A change detection approach was applied by comparing pre-event (25–27 Nov 2025) and post-event (30 Nov – 3 Dec 2025) backscatter values. Nine Areas of Interest (AOIs) were analyzed. Rainfall data from Global Precipitation Measurement IMERG was used for validation.

Outputs include flood extent maps, flooded area estimates, and rainfall time-series.

## 2.Tools & Technologies

![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-34A853?style=for-the-badge&logo=googleearth&logoColor=white)
![SAR](https://img.shields.io/badge/SAR-Synthetic_Aperture_Radar-1E90FF?style=for-the-badge)
![Google Earth JS API](https://img.shields.io/badge/Google_Earth_JS_API-4285F4?style=for-the-badge&logo=googleearth&logoColor=white)
![Google Earth JS API](https://img.shields.io/badge/Google_Earth_JS_API-4285F4?style=for-the-badge&logo=googleearth&logoColor=white)
![ArcGIS Pro](https://img.shields.io/badge/ArcGIS_Pro-2C7AC3?style=for-the-badge&logo=esri&logoColor=white)

## 3.Introduction

### 3.1 Background

Flooding in Sri Lanka is mainly driven by monsoon systems. Optical satellite imagery is often limited due to cloud cover, making SAR a reliable alternative for flood detection.

SAR enables:

* All-weather imaging
* Day/night acquisition
* Reliable flood mapping

### 3.2 Objectives

- To acquire and pre-process Sentinel-1 SAR imagery over flood-affected regions in Sri Lanka.
- To perform SAR-based change detection between pre-flood and post-flood acquisition windows.
- To identify and map inundated areas by applying backscatter difference thresholding.
- To quantify the total flooded area across nine defined AOIs.
- To validate the SAR flood signal using satellite-derived precipitation data from NASA GPM IMERG.

## 4. SAR Theory

### 4.1 SAR Principles

Synthetic Aperture Radar (SAR) is an active sensor that emits microwave signals and measures backscatter.

Key characteristics:

* Frequency: ~5.405 GHz (C-band)
* Sensitive to surface roughness
* Water surfaces → low backscatter
* Land surfaces → higher backscatter

### 4.2 Flood Detection Logic

* Water: very low backscatter (< -15 dB)
* Land: higher backscatter (-10 to 0 dB)
* Flooding → decrease in backscatter

## 5. Study Area

The study covers nine AOIs across Sri Lanka, selected based on flood vulnerability and river systems such as:

* Kelani River
* Kalu River
* Mahaweli River

## 6. Data Sources

### 6.1 Sentinel-1 SAR

* Dataset: COPERNICUS/S1_GRD
* Mode: IW (Interferometric Wide Swath)
* Polarization: VV
* Resolution: ~10 m

### 6.2 GPM IMERG

* Dataset: NASA/GPM_L3/IMERG_V07
* Resolution: ~0.1°
* Temporal: 30-minute

### 6.3 Water Mask

Used to remove permanent water bodies:

* JRC Global Surface Water
* Dynamic World

## 7. Methodology

### 7.1 Workflow

Folloiwng shows the work flow of the project
<p align="center">
  <img src="https://github.com/UpekshaIndeewari/SAR-based-flood-detection-and-mapping-in-Sri-Lanka-using-GEE/blob/main/Workflow.png" alt="GeoNLP Workflow" width="700">
</p>

1. Define AOIs
2. Acquire SAR data
3. Create mosaics
4. Perform change detection
5. Apply threshold
6. Remove noise
7. Calculate flooded area

### 7.2 Change Detection

```{r}
# Conceptual formula (pseudo representation)
Change = Pre_Event - Post_Event
```

* High positive values → flooding

### 7.3 Thresholding

* Threshold: 3 dB
* Removes non-significant changes

### 7.4 Noise Reduction

* Connected pixel filtering
* Focal smoothing

### 7.5 Area Calculation

```{r}
# Conceptual
Flood_Area = sum(pixel_area * flooded_pixels)
```

## 8. Results

### 8.1 Flood Extent

Folloiwng shows the flood detection area
<p align="center">
  <img src="https://github.com/UpekshaIndeewari/SAR-based-flood-detection-and-mapping-in-Sri-Lanka-using-GEE/blob/main/Map.png" alt="GeoNLP Workflow" width="700">
</p>

Flooding observed mainly in:

* Western Province
* Eastern Province
* Northwestern regions

### 8.2 Flooded Area

**Estimated Total Flooded Area: ~798.67 km²**

### 8.3 Rainfall Validation

GPM data shows:

* Heavy rainfall from 25–30 Nov
* Peak during flood period
* Decline after Dec 1

## 9. Discussion

### 9.1 Strengths

* Works in cloudy conditions
* Near real-time analysis
* Scalable in GEE
* Free datasets

### 9.2 Limitations

* Speckle noise
* Urban flood underestimation
* Fixed threshold limitations
* Vegetation masking effects

### 9.3 Improvements

* Use adaptive threshold (Otsu)
* Apply speckle filtering
* Fix water mask bug
* Integrate optical data

## 10. Conclusion

This study demonstrates an effective SAR-based flood detection workflow using Google Earth Engine and Sentinel-1 data.

The approach provides:

* Reliable flood mapping
* Rapid analysis capability
* Scalable methodology

With improvements, it can support operational flood monitoring in Sri Lanka.

## 11. References

* Chini et al. (2017)
* ESA Sentinel-1 Documentation
* Gorelick et al. (2017) – GEE
* Huffman et al. (2020) – GPM IMERG
* Pekel et al. (2016) – JRC Water
  
## 11. LICENSE
Use a standard license such as:
MIT License (recommended for research projects)
