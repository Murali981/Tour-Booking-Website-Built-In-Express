/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFwYm94LW5pc2hhYW5rIiwiYSI6ImNtMXVpcXdrNDAxaXMyanNmNm93cDB4N28ifQ.lkwF_9FvRfmkPD1qEqeXIA";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox-nishaank/cm1ujelin015p01pifviddnuc",
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds(); // We will get access to this mapboxgl object as we have included mapbox
  // library at the beginning of the tour.pug  file where we have included the script tag. This bounds object is basically
  // the area that will be displayed on the map. We will now extend this map with all the locations that are in our
  // locations array.

  locations.forEach((loc) => {
    // We want to add a marker here , Basically in the below step we are creating a marker
    const el = document.createElement("div");
    el.className = "marker";

    // Adding a marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom", // Here it is the bottom of the pin which is going to be located at the exact GPS location
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Adding a popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extends the map bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    // The padding should be in the fitBounds() function which is in the end this fitBounds() function will execute the moving
    // and the zooming
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
