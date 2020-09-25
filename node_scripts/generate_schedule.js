const fs = require('fs');
const path = require('path');

const dataFolder = '../src/assets/data/';

// Input data
const routesPath = path.join(__dirname, dataFolder, 'data.json');
// const stationsPath = path.join(__dirname, dataFolder, 'stations.json');

// Output data
const schedulePath = path.join(__dirname, dataFolder, 'schedule.json');

const routesJson = fs.readFileSync(routesPath);
const routes = JSON.parse(routesJson);
// const stationsJson = fs.readFileSync(stationsPath);
// const stations = JSON.parse(stationsJson);
// console.log('stations:', stations);

const schedule = [];
routes.forEach(route => {
  const scheduleItem = {
    ...route,
    ending_stations: []
  };

  route.ending_stations.forEach(station => {
    const stationSchedule = {
      id: station.id,
      workday_trips: makeTrips(station.workday_trips),
      dayoff_trips: makeTrips(station.dayoff_trips)
    };

    scheduleItem.ending_stations.push(stationSchedule);
  });
  
  schedule.push(scheduleItem);
});

function makeTrips(tripsStr) {
  // tripsStr = "5:48, 6:12, ... , 15:12, 15:24 (ДО ДЕПО), ... , 22:48, 23:26 (ДО ДЕПО)"
  const text = tripsStr;
  const departure_time = [];
  const to_depot = [];

  const trips = tripsStr.split(',');
  trips.forEach((value, index) => {
    let tripStr = value.trim();
    const innerSpaceIndex = tripStr.indexOf(' ');

    if (innerSpaceIndex !== -1) {
      // '15:24 (ДО ДЕПО)'
      tripStr = tripStr.substring(0, innerSpaceIndex);
      to_depot.push(index);
    }

    const timeSeparatorIndex = tripStr.indexOf(':');
    const hours = Number(tripStr.substring(0, timeSeparatorIndex));
    const minutes = Number(tripStr.substring(timeSeparatorIndex + 1));

    departure_time.push(hours * 60 + minutes);
  });

  return { text, departure_time, to_depot };
}

// console.log('schedule:', schedule);
fs.writeFile(schedulePath, JSON.stringify(schedule), (err) => {
  if (err) throw err;
  console.log('File \x1b[36m%s\x1b[0m is created successfully.', schedulePath);
});
