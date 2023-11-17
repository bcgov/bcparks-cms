import React, { useState, useEffect, useRef } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Typeahead, ClearButton, Menu, MenuItem } from "react-bootstrap-typeahead"
import { Form } from "react-bootstrap"
import PermissionToast from "./permissionToast"
import NearMeIcon from "@mui/icons-material/NearMe"
import "react-bootstrap-typeahead/css/Typeahead.css"

const HighlightText = ({ city, input }) => {
  const words = city.split(" ")
  return (
    words.map((word, index) => {
      if (word.toLowerCase() === input) {
        return <span key={index}> {word} </span>
      } else {
        return <b key={index}> {word} </b>
      }
    })
  )
}

const CityNameSearch = ({
  isCityNameLoading, showPosition, currentLocation, optionLimit, selectedItems, setSelectedItems, handleChange, handleClick
}) => {
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
  const [cityText, setCityText] = useState("")
  const [hasResult, setHasResult] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasBeenDenied, setHasBeenDenied] = useState(false)
  const cities = data?.allStrapiSearchCity?.nodes || []
  const typeaheadRef = useRef(null)

  // functions
  const cityOptions = (optionLimit) => {
    const cityTextLower = cityText.toLowerCase()
    const filteredCities = cities.filter(city =>
      city.cityName.toLowerCase().startsWith(cityTextLower) || city.cityName.toLowerCase().includes(` ${cityTextLower}`)
    )
    const sortedCities = filteredCities.slice().sort((a, b) => {
      if (a.cityName.toLowerCase().startsWith(cityTextLower) && !b.cityName.toLowerCase().startsWith(cityTextLower)) {
        return -1
      } else if (!a.cityName.toLowerCase().startsWith(cityTextLower) && b.cityName.toLowerCase().startsWith(cityTextLower)) {
        return 1
      } else if (b.rank !== a.rank) {
        return b.rank > a.rank ? -1 : 1
      } else {
        return a.cityName.localeCompare(b.cityName)
      }
    })
    return cityText ? sortedCities.slice(0, optionLimit) : []
  }
  const checkResult = (text) => {
    const cityTextLower = text.toLowerCase()
    const results = cities.filter(city =>
      city.cityName.toLowerCase().startsWith(cityTextLower) || city.cityName.toLowerCase().includes(` ${cityTextLower}`)
    )
    if (results.length > 0) {
      setHasResult(true)
    } else {
      setHasResult(false)
    }
  }
  const showError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setHasPermission(false)
        if (!hasPermission) {
          setHasBeenDenied(true)
        } else {
          setHasBeenDenied(false)
        }
        // clear input field if user denies current location
        setSelectedItems([])
        console.log("User denied the request for Geolocation.")
        break
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break
      case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break
      default:
        console.log("An unspecified error occurred.")
    }
  }

  // event handlers
  const handleInputChange = (text) => {
    setCityText(text)
    checkResult(text)
  }
  const handleClickGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError)
    } else {
      console.log("Geolocation is not supported by your browser")
    }
  }
  const handleKeyDownGetLocation = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClickGetLocation()
    }
  }
  const handleFocusInput = () => {
    setIsDropdownOpen(true)
  }
  // select an option with arrow keys and search parks with enter key 
  const handleKeyDownInput = (e) => {
    const optionsLength = hasResult ? cityOptions(optionLimit).length + 1 : 2
    let activeIndex = typeaheadRef.current.state.activeIndex
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (e.key === 'ArrowUp') {
        activeIndex = (activeIndex - 1 + optionsLength) % optionsLength
      } else if (e.key === 'ArrowDown') {
        activeIndex = (activeIndex + 1) % optionsLength
      }
      typeaheadRef.current.setState({ activeIndex })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const activeOption = cityOptions(optionLimit)[activeIndex]
      if (activeOption !== undefined) {
        setSelectedItems([activeOption])
        setIsDropdownOpen(false)
      } else {
        setSelectedItems([currentLocation])
        handleKeyDownGetLocation(e)
        setIsDropdownOpen(false)
      }
    }
  }

  // useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeaheadRef.current && !typeaheadRef.current.inputNode.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.body.addEventListener("click", handleClickOutside)
    return () => {
      document.body.removeEventListener("click", handleClickOutside)
    }
  }, [])
  useEffect(() => {
    // clear input field if text does not exist in options
    if (!isDropdownOpen && cityText.length > 0 && !hasResult) {
      setCityText("")
    }
    // search parks if a user's input is the same as one of the options
    if (cityText.length > 0 && hasResult) {
      const enteredCity = cities.filter(city => city.cityName.toLowerCase() === cityText.toLowerCase())
      if (enteredCity.length > 0) {
        setSelectedItems(enteredCity)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropdownOpen, cityText, hasResult])

  return (
    <>
      {!hasPermission && <PermissionToast hasBeenDenied={hasBeenDenied} />}
      <Typeahead
        ref={typeaheadRef}
        id="city-search-typehead"
        minLength={1}
        isLoading={isCityNameLoading}
        labelKey={city => `${city.cityName}`}
        options={cityOptions(optionLimit)}
        selected={selectedItems}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onFocus={handleFocusInput}
        open={isDropdownOpen}
        onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
        placeholder=" "
        className={`has-text--${(selectedItems.length > 0 || cityText.length > 0) ? 'true' : 'false'
          } is-dropdown-open--${isDropdownOpen ? 'true' : 'false'
          } city-search-typeahead`}
        renderInput={({ inputRef, referenceElementRef, ...inputProps }) => {
          return (
            <Form.Group controlId="city-search-typeahead">
              <Form.Control
                {...inputProps}
                value={selectedItems.length > 0 ? selectedItems[0].cityName : cityText}
                ref={(node) => {
                  inputRef(node)
                  referenceElementRef(node)
                }}
                onKeyDown={handleKeyDownInput}
              />
              <label htmlFor="city-search-typeahead">
                Near a city
              </label>
            </Form.Group>
          )
        }}
        renderMenu={cities => (
          <Menu id="city-search-typeahead">
            {cities.map((city, index) => (
              <MenuItem option={city} position={index} key={index}>
                <HighlightText
                  city={city.cityName}
                  input={cityText}
                />
              </MenuItem>
            ))}
            {(!hasResult && cityText) &&
              <MenuItem
                tabIndex={-1}
                position={cities.length}
                key={cities.length}
                className="no-suggestion-text"
              >
                No suggestions, please check your spelling or try a larger city in B.C.
              </MenuItem>
            }
            <MenuItem
              option={currentLocation}
              position={hasResult ? cities.length : cities.length + 1}
              key={hasResult ? cities.length : cities.length + 1}
              onClick={handleClickGetLocation}
              onKeyDown={handleKeyDownGetLocation}
              className="current-location-text"
            >
              <NearMeIcon />{currentLocation.cityName}
            </MenuItem>
          </Menu>
        )}
      >
        {({ onClear, selected }) =>
          (!!selected.length || cityText?.length > 0) && (
            <div className="rbt-aux">
              <ClearButton
                onClick={() => {
                  onClear()
                  handleClick()
                  setCityText("")
                  setIsDropdownOpen(false)
                }}
              />
            </div>
          )
        }
      </Typeahead>
    </>
  )
}

export default CityNameSearch