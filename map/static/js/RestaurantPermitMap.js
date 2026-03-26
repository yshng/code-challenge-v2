import React, { useEffect, useState } from "react"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
  // Filter by the permit issue year for each restaurant
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })
  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)

  const yearlyDataEndpoint = `/map-data/?year=${year}`

  useEffect(() => {
    fetch(yearlyDataEndpoint)
      .then((res) => res.json())
      .then((data) => {
        setCurrentYearData(data)
      })
      .catch((error) => {
        console.error("Failed to fetch map data", error)
      })
  }, [yearlyDataEndpoint])

  // Basic calculations with count-only array
  const permitCounts = currentYearData.map(({ num_permits }) => num_permits)
  const { totalNumPermits, maxNumPermits } = permitCounts.reduce(
    (acc, val) => ({
      totalNumPermits: acc.totalNumPermits + val,
      maxNumPermits: val > acc.maxNumPermits ? val : acc.maxNumPermits,
    }),
    { totalNumPermits: 0, maxNumPermits: 0 }
  )

  const maxPercentage = maxNumPermits / totalNumPermits

  // Set maxPercentage as darkest and use it as the basis of breakpoints
  // Don't want to pin breakpoints to actual distribution, e.g. quartiles
  // Want to reflect skewing, not control for it
  function getColor(percentageOfPermits) {
    if (percentageOfPermits < 0.25 * maxPercentage) {
      return communityAreaColors[0]
    }
    if (percentageOfPermits < 0.5 * maxPercentage) {
      return communityAreaColors[1]
    }
    if (percentageOfPermits < 0.75 * maxPercentage) {
      return communityAreaColors[2]
    }
    return communityAreaColors[3]
  }

  const areaById = Object.fromEntries(
    currentYearData.map(({ area_id, ...rest }) => [area_id, rest])
  )
    
  function setAreaInteraction(feature, layer) {
    const areaData = areaById[feature.properties.area_num_1]
    if (!areaData) return

    const num_permits = areaData.num_permits
    const percentageOfPermits = num_permits / totalNumPermits

    layer.setStyle({
      color: "#bbb",
      weight: 1,
      fillColor: getColor(percentageOfPermits),
      fillOpacity: 1,
    })

    if (num_permits === 0) {
      // Setting { fill: false } will fail to trigger mouse events
      layer.setStyle({ fillOpacity: 0 })
    }

    const percentageForPopup = (percentageOfPermits * 100).toFixed(2)
    layer.on("mouseover", () => {
      layer.bindPopup(`${areaData.name}: ${num_permits} <br>
                          (${percentageForPopup}% of all permits issued in ${year})`)
      layer.openPopup()
    })
    layer.on("mouseout", () => {
      layer.closePopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {totalNumPermits}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area: {maxNumPermits}
      </p>
      <MapContainer id="restaurant-map" center={[41.88, -87.62]} zoom={10}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={maxNumPermits}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
