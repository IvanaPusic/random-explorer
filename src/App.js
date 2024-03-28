import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useRef, useState } from 'react';
import CategoriesModal from './components/CategoriesModal';
import ChangeCategoriesModal from './components/ChangeCategoriesModal';
import LanguageModal from './components/LanguageModal';
import { allLanguages, categories, listOfLandmarks } from './data';

function App() {
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [city, setCity] = useState(localStorage.getItem('city'))
  const [isLanguageModalOpen,setIsLanguageModalOpen] = useState(false);
  const [directionsDisplay, setDirectionsDisplay] = useState(null);
  const [destination, setDestination] = useState(null);
  const [map, setMap] = useState(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [languages, setLanguages] = useState(allLanguages);
  const [language, setLanguage] = useState(localStorage.getItem('language'));
  const [allCategories, setAllCategories] = useState(categories);
  const [checkboxValue, setCheckboxValue] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [updatedCategories,setUpdatedCategories] = useState([]);
  const [localStorageCategories, setLocalStorageCategories] = useState(localStorage.getItem('categories'))
  const [landmarks, setLandmarks] = useState(JSON.parse(localStorage.getItem(localStorage.getItem('city'))));
  const [markers, setMarkers] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isDark,setIsDark] = useState(false);
  const [isUpdateCategories, setIsUpdateCategories] = useState(false);
  const googleMapRef = useRef(null);
  const searchInput = useRef(null); 

  const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    version: 'weekly',
    libraries: ['places', 'routes'],
  });


    const convertTextToSpeech = (info) => {
  
    let value = new SpeechSynthesisUtterance(info);
    window.speechSynthesis.speak(value);
 
  };

  const createMarker = (waypoints) => {
    // Remove markers that are not on the route
    markers.forEach(marker => {
        const isOnRoute = waypoints.some(waypoint => {
            return waypoint.latitude === marker.getPosition().lat() && 
                   waypoint.longitude === marker.getPosition().lng();
        });
        if (!isOnRoute) {
            marker.setMap(null);
        }
    });

    // Clear the markers array
    setMarkers([]);

    // Create markers for waypoints on the route
    waypoints.forEach(waypoint => {
        const marker = new window.google.maps.Marker({
            position: new window.google.maps.LatLng(waypoint.latitude, waypoint.longitude),
            map: map,
        });

        setMarkers(prevMarkers => [...prevMarkers, marker]);

          const markerInfo = waypoint.description;
      const infowindow = new window.google.maps.InfoWindow({
        content: markerInfo,
        ariaLabel: "Uluru",
      });

       window.google.maps.event.addListener(marker, 'click', async () => {
        console.log('Marker clicked at position:', marker.getPosition(), 'Waypoint name:', waypoint.name);
        infowindow.open({
          anchor: marker,
          map,
        });
        convertTextToSpeech(markerInfo)
      });
    });
};
 
  const handleCategories = () => {
    console.log('handleCategories');
    setIsUpdateCategories(true)
  }

  const getLandmarks = () => {
    // save landmarks in local storage with the city
    localStorage.setItem(city, JSON.stringify(listOfLandmarks));
  }
  const getCity = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&location_type=ROOFTOP&result_type=street_address&key=${process.env.REACT_APP_GOOGLE_API_KEY}`)
      const city = await response.json();
      console.log(city)
      setCity(city.results[0].address_components[2].long_name)
      localStorage.setItem('city',city.results[0].address_components[2].long_name)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if(!language) {
      setIsLanguageModalOpen(true)
    } 
    if(!localStorageCategories) {
      setIsCategoriesModalOpen(true)
    }
    if(!language && !localStorageCategories) {
      setIsCategoriesModalOpen(true);
      setIsLanguageModalOpen(true);
    }
    if(!language && localStorageCategories) {
      getLandmarks()
    }
  },[]);

  useEffect(() => {
    if(currentLocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;
      setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      getCity(latitude,longitude)
    });
    console.log(currentLocation)
  },[]);


  useEffect(() => {
    if (!currentLocation) {
      return;
    }
  
    loader.load().then(() => {
      const map = new window.google.maps.Map(googleMapRef.current, {
        center: currentLocation,
        zoom: 8,
      });

      setMap(map);
      if (!directionsDisplay) {
        console.log('set');
        setDirectionsDisplay(
          new window.google.maps.DirectionsRenderer({ map: map })
        );
      }

      const options = {
        fields: ['formatted_address', 'geometry', 'name'],
        strictBounds: false,
      };

      const autocomplete = new window.google.maps.places.Autocomplete(
        searchInput.current,
        options
      );
      autocomplete.bindTo('bounds', map);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }
        setDestination(place);

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });
    });
  }, [currentLocation]);

   useEffect(() => {
    if (!currentLocation || !destination || !landmarks || !directionsDisplay || !map) {
      return;
    }

    markers.forEach((marker) => {
      marker.setMap(null);
    });

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
        destination: new window.google.maps.LatLng(destination.geometry.location.lat(), destination.geometry.location.lng()),
        avoidTolls: true,
        avoidHighways: true,
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (response, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const route = response.routes[0];
          const steps = route.legs.flatMap(leg => leg.steps);
          const waypoints = [];
          const radius = 300;
          console.log(landmarks)
          landmarks.forEach((waypoint) => {
            const distances = steps.map(step => {
              return window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(waypoint.latitude, waypoint.longitude),
                new window.google.maps.LatLng(step.end_location.lat(), step.end_location.lng()),
              );
            });

            const minDistance = Math.min(...distances);

            if (minDistance <= radius) {
              waypoints.push(waypoint)
            
            }
          });

          // const placesService = new window.google.maps.places.PlacesService(map);

          // waypoints.forEach((waypoint) => {
          //   const placesRequest = {
          //     location: new window.google.maps.LatLng(waypoint.latitude, waypoint.longitude),
          //     radius: 5,
          //     type: ['museum', 'park', 'church', 'point_of_interest'],
          //   };

          //   placesService.nearbySearch(placesRequest, (results, status) => {
          //     if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          //       let places = [...new Set(results)];
          //       for (const place of places) {
                  // console.log('Place', place.name, place.geometry.location.lat(), place.geometry.location.lng());
          //       }
          //     }
          //   });
          // });

          const request = {
            origin: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
            destination: new window.google.maps.LatLng(destination.geometry.location.lat(), destination.geometry.location.lng()),
            waypoints: waypoints.map(waypoint => ({
              location: new window.google.maps.LatLng(waypoint.latitude, waypoint.longitude),
              stopover: true
            })),
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.WALKING,
          };

          directionsService.route(request, (updatedRoute, updatedStatus) => {
            if (updatedStatus === 'OK') {
              directionsDisplay.setDirections(updatedRoute);
              createMarker(waypoints)
            } else {
              window.alert('Directions request failed due to ' + updatedStatus);
            }
          });
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  }, [currentLocation, destination, landmarks, directionsDisplay, map]);
  return (
    <main className= 'py-6 bg-primary'>
      {isUpdateCategories && <ChangeCategoriesModal language={language} getLandmarks={getLandmarks} setIsUpdateCategories={setIsUpdateCategories} updatedCategories={updatedCategories} setUpdatedCategories={setUpdatedCategories} allCategories={allCategories} setAllCategories={setAllCategories} checkboxValue={checkboxValue} setCheckboxValue={setCheckboxValue}/>}
      {isLanguageModalOpen && <LanguageModal localStorageCategories={localStorageCategories} setIsLanguageModalOpen={setIsLanguageModalOpen} languages={languages} language={language} setLanguage={setLanguage} setIsCategoriesModalOpen={setIsCategoriesModalOpen}/>}
      {isCategoriesModalOpen && <CategoriesModal language={language} getLandmarks={getLandmarks} setIsCategoriesModalOpen={setIsCategoriesModalOpen} categories = {categories} isChecked={isChecked} setIsChecked={setIsChecked} selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} allCategories={allCategories} setAllCategories={setAllCategories} checkboxValue={checkboxValue} setCheckboxValue={setCheckboxValue}/>}
      <header className={isDark ? 'dark:bg-dark flex  pt-6 pb-16 px-6 justify-between align-middle text-lg': 'flex  pt-6 pb-16 px-6 justify-between align-middle text-lg'}>
        <h3 className={isDark ? 'font-bold text-accentDark flex gap-1' :'font-bold text-dark flex gap-1'}>
          <span>Random</span>
          <span className={isDark ? 'text-accentLight' : 'text-accentDark'}>Explorer</span>
        </h3>
        <div className='flex gap-4'>
        {/* <button onClick = {() => setIsDark(!isDark)}>
          <img src={isDark ? sun : moon} alt="" />
        </button> */}
        <button onClick = {handleCategories}>
         <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-menu-2" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke={isDark ? "#fede9d" : "#121212"} fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M4 6l16 0" />
          <path d="M4 12l16 0" />
          <path d="M4 18l16 0" />
        </svg>
        </button>
        </div>
      </header>
      <div className='flex justify-center align-middle pb-5'>
          <input ref={searchInput} className="border-2 border-accentDark w-[75vw] placeholder:text-secondary text-secondary py-2 px-10 rounded-lg outline-none focus:outline-none focus:accentLight  ring-accentLight focus:ring-2 sm:text-sm md:text-md lg:text-lg" placeholder="Enter destination" type="text" name="search" />
      </div>
      <div id='map_canvas' className=' mx-auto rounded-lg mt-5 lg:w-[75vw] h-[75vh]' ref={googleMapRef}></div>
    </main>
  );
}

export default App;
