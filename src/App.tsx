import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

enum SortingDirection {
  UNSORTED = "UNSORTED",
  ACENDING = "ACENDING",
  DECENDING = "DECENDING"
}

const fetchData = () => {
  return axios
    .get(`https://randomuser.me/api/?results=20`)
    .then((res) => {
      const { results } = res.data;
      // console.log(results)
      return results;
    })
    .catch((ex) => console.error(ex));
};

const extractObjectKeys = (object: any) => {
  let objectKeys: string[] = [];
  Object.keys(object).forEach((objectKey) => {
    const value = object[objectKey];
    if (typeof value !== "object") {
      objectKeys.push(objectKey);
    } else {
      objectKeys = [...objectKeys, ...extractObjectKeys(value)];
    }
  });
  return objectKeys;
};

const sortData = (
  data: any,
  sortKey: string,
  sortingDirection: SortingDirection
) => {
  data.sort((a: any, b: any) => {
    const relevantValueA = a[sortKey];
    const relevantValueB = b[sortKey];
    if (
      sortingDirection === SortingDirection.UNSORTED ||
      sortingDirection === SortingDirection.ACENDING
    ) {
      if (relevantValueA < relevantValueB) return -1;
      if (relevantValueA > relevantValueB) return 1;
      return 0;
    } else {
      if (relevantValueA > relevantValueB) return -1;
      if (relevantValueA < relevantValueB) return 1;
      return 0;
    }
  });
};

const flatternLocation = (locations: any) => {
  const location = locations[0];
  // console.log(locations);
  const data = [];
  for (const { street, coordinates, timezone, ...rest } of locations) {
    data.push({
      ...rest,
      StreetNumber: street.number,
      StreetName: street.name,
      Latitude: coordinates.latitude,
      Longitude: coordinates.longitude,
      Offset: timezone.offset,
      Des: timezone.description
    });
  }
  const flatternHeaders = extractObjectKeys(data[0]);
  // console.log(flatternHeaders);
  return { headers: flatternHeaders, data };
};

const getNextSortingDirection = (sortingDirection: SortingDirection) => {
  if (
    sortingDirection === SortingDirection.UNSORTED ||
    sortingDirection === SortingDirection.ACENDING
  ) {
    return SortingDirection.DECENDING;
  }
  return SortingDirection.ACENDING;
};

const getFilteredRows = (rows: any[], filterKey: string) => {
  return rows.filter((rows: any) =>
    JSON.stringify(rows).toLowerCase().includes(filterKey)
  );
};

export default function App() {
  const [people, setPeople] = useState([]);
  const [locations, setLocations] = useState({ headers: [], data: [] });
  const [sortingDirections, setSortingDirections] = useState({});
  const [inputValue, setInputValue] = useState("");

  const sortColumn = (sortKey) => {
    const newLocations = {
      ...locations,
      data: locations.data
    };
    const currentSortingDirection = sortingDirections[sortKey];

    sortData(newLocations.data, sortKey, currentSortingDirection);
    const nextSortingDirection = getNextSortingDirection(
      currentSortingDirection
    );
    const newSortingDirections = { ...sortingDirections };
    newSortingDirections[sortKey] = nextSortingDirection;
    setLocations(newLocations);
    setSortingDirections(newSortingDirections);
  };

  useEffect(() => {
    fetchData().then((apiPeople) => {
      setPeople(apiPeople);
      const ourLocations = flatternLocation(
        apiPeople.map(({ location }) => location)
      );
      setLocations(ourLocations);
      const { headers } = ourLocations;
      for (const header of headers) {
        ourLocations[header] = SortingDirection.UNSORTED;
      }

      setSortingDirections(ourLocations);
    });
  }, []);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search here..."
      />
      <table>
        <tr>
          {locations.headers.map((locationString: string, locationId) => (
            <th
              key={locationId}
              onClick={() => {
                sortColumn(locationString);
              }}
            >
              {locationString}
            </th>
          ))}
        </tr>
        <tbody>
          {getFilteredRows(locations.data, inputValue).map(
            (dataString, dataId) => (
              <tr key={dataId}>
                {locations.headers.map((header, headerId) => (
                  <td key={headerId}>{dataString[header]}</td>
                ))}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
