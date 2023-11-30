import React, { useState, useEffect } from "react"
import { navigate, graphql, useStaticQuery } from "gatsby"
import { Button } from "@mui/material"
import ParkNameSearch from "./parkNameSearch"
import CityNameSearch from "./cityNameSearch"
import { useScreenSize } from "../../utils/helpers"
import "../../styles/search.scss"
const qs = require('qs');

const MainSearch = ({ hasCityNameSearch }) => {
  const data = useStaticQuery(graphql`
    query {
      allStrapiSearchCity(
        sort: {rank: ASC},
        filter: {rank: {lte: 4}}
      ) {
        nodes {
          strapi_id
          cityName
          latitude
          longitude
          rank
        }
      }
    }
  `)

  // useState and constants
  const screenSize = useScreenSize()
  const searchCities = data?.allStrapiSearchCity?.nodes || []
  const [inputText, setInputText] = useState("")
  const [searchText, setSearchText] = useState("")
  const [cityText, setCityText] = useState("")
  const [isCityNameLoading, setIsCityNameLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState([])
  const [hasPermission, setHasPermission] = useState(false)
  const [isMatched, setIsMatched] = useState(false)
  const [currentLocation, setCurrentLocation] = useState({
    strapi_id: 0,
    cityName: "Current location",
    latitude: 0,
    longitude: 0,
    rank: 1
  })

  // functions
  const searchParkFilter = (clickedCity) => {
    let findAPark = "/find-a-park/";
    let queryText = searchText || inputText;
    const queryString = qs.stringify({
      l: clickedCity?.length ? clickedCity[0].strapi_id : selectedCity[0]?.strapi_id,
      q: queryText.length ? queryText : undefined
    })
    if (queryString.length) {
      findAPark += `?${queryString}`
    }
    navigate(findAPark, {
      state: {
        "qsCity": selectedCity
      },
    })
  }
  const showPosition = (position) => {
    setHasPermission(true)
    setCurrentLocation(currentLocation => ({
      ...currentLocation,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }))
  }

  // event handlers
  const handleSearchNameChange = (selected) => {
    if (selected.length) {
      setSearchText(selected[0]?.protectedAreaName)
    }
  }
  const handleSearchNameInputChange = (text) => {
    setInputText(text)
  }
  const handleCityNameInputChange = (text) => {
    setCityText(text)
    // check if the entered city exists in the list
    const enteredCity = searchCities.filter(city =>
      city.cityName.toLowerCase() === text.toLowerCase())
    if (enteredCity) {
      setSelectedCity(enteredCity)
      setIsMatched(true)
    }
  }
  const handleKeyDownSearchPark = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchParkFilter()
    }
  }
  const handleClickClearPark = () => {
    setInputText("")
    setSearchText("")
  }
  const handleClickClearCity = () => {
    setCityText("")
    setSelectedCity([])
  }

  // useEffect
  useEffect(() => {
    if (searchText) {
      setInputText(searchText)
      searchParkFilter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])
  useEffect(() => {
    if (selectedCity.length > 0 && !isMatched) {
      searchParkFilter()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, isMatched])
  useEffect(() => {
    if (selectedCity.length > 0) {
      if (selectedCity[0].latitude === 0 || selectedCity[0].longitude === 0) {
        setIsCityNameLoading(true)
        searchParkFilter()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity])

  return (
    <div className="parks-search-wrapper">
      <h1 className="text-white">Find a park</h1>
      <div className="parks-search-field">
        <ParkNameSearch
          optionLimit={screenSize.width > 767 ? 7 : 4}
          searchText={inputText}
          handleChange={handleSearchNameChange}
          handleInputChange={handleSearchNameInputChange}
          handleKeyDownSearch={handleKeyDownSearchPark}
          handleClick={handleClickClearPark}
        />
        {hasCityNameSearch && (
          <>
            <span className="or-span">or</span>
            <CityNameSearch
              isCityNameLoading={hasPermission && isCityNameLoading}
              hasPermission={hasPermission}
              setHasPermission={setHasPermission}
              showPosition={showPosition}
              currentLocation={currentLocation}
              optionLimit={screenSize.width > 767 ? 7 : 4}
              selectedItems={selectedCity}
              setSelectedItems={setSelectedCity}
              cityText={cityText}
              setCityText={setCityText}
              handleInputChange={handleCityNameInputChange}
              handleKeyDownSearch={handleKeyDownSearchPark}
              handleClick={handleClickClearCity}
              handleSearch={searchParkFilter}
            />
          </>
        )}
        <Button
          className="parks-search-button"
          onClick={searchParkFilter}
        >
          Search
        </Button>
      </div>
    </div>
  )
}

export default MainSearch
