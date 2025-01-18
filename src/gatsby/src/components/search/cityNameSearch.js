import React, { useState, useEffect, useRef } from "react"
import { graphql, useStaticQuery } from "gatsby"
import { Typeahead, ClearButton, Menu, MenuItem } from "react-bootstrap-typeahead"
import { Form } from "react-bootstrap"
import PermissionToast from "./permissionToast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons"
import "react-bootstrap-typeahead/css/Typeahead.css"

let permissionDeniedCount = 0

const HighlightText = ({ city, input }) => {
  const regex = new RegExp(input, 'gi')
  const highlightedText = city.replace(regex, match => `<b>${match}</b>`)
  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
}

const CityNameSearch = ({
  acquiringGeolocation,
  hasPermission,
  setHasPermission,
  showPosition,
  currentLocation,
  optionLimit,
  selectedItems,
  setSelectedItems,
  cityText,
  setCityText,
  handleInputChange,
  handleKeyDownSearch,
  handleClear,
  handleSearch
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isToastOpen, setIsToastOpen] = useState(false)
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
    return [...(cityText ? sortedCities.slice(0, optionLimit) : []), ...[currentLocation]]
  }
  const hasResult = (text) => {
    const cityTextLower = text.toLowerCase()
    const results = cities.filter(city =>
      city.cityName.toLowerCase().startsWith(cityTextLower) || city.cityName.toLowerCase().includes(` ${cityTextLower}`)
    )
    return results.length > 0;
  }
  const showError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setIsToastOpen(true)
        setHasPermission(false)
        permissionDeniedCount += 1
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
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError, { maximumAge: 600000 })
    } else {
      console.log("Geolocation is not supported by your browser")
    }
  }

  // event handlers
  const handleFocusInput = () => {
    setIsDropdownOpen(true)
  }
  const handleOnChange = (selected) => {
    if (selected.length > 0 && selected[0].strapi_id === 0) {
      // select and search current location only if user allows
      if (hasPermission) {
        handleSearch(selected)
      }
      setSelectedItems(selected)
      getLocation()
    } else {
      handleSearch(selected)
      setSelectedItems(selected)
    }
  }
  // select an option with arrow keys and search parks with enter key 
  const handleKeyDownInput = (e) => {
    const optionsLength = typeaheadRef.current.items.length;
    let activeIndex = typeaheadRef.current.state.activeIndex
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (e.key === 'ArrowUp') {
        activeIndex = activeIndex - 1
      } else if (e.key === 'ArrowDown') {
        activeIndex = activeIndex + 1
      }
      if (activeIndex > optionsLength) {
        activeIndex = -1; // go to the text input
      }
      if (activeIndex < -1) {
        activeIndex = optionsLength - 1; // go to the last item
      }
      typeaheadRef.current.setState({ activeIndex })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const activeOption = cityOptions(optionLimit)[activeIndex]
      if (activeOption !== undefined) {
        handleOnChange([activeOption])
      } else {
        handleSearch()
      }
      setIsDropdownOpen(false)
    } else if (e.key === 'Tab') {
      setIsDropdownOpen(false)
    } else if (e.key === 'Backspace' && cityText.length <= 1) {
      handleClear()
    }
  }

  // useEffect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeaheadRef.current && !typeaheadRef.current.inputNode.contains(e.target)) {
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
    if (!isDropdownOpen && cityText.length > 0 && !hasResult(cityText)) {
      setCityText("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDropdownOpen, cityText])
  useEffect(() => {
    if (cityText && !selectedItems.length) {
      setIsDropdownOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityText, selectedItems])
  useEffect(() => {
    if (selectedItems.length > 0 && selectedItems[0].strapi_id !== 0 && cityText !== selectedItems[0].cityName) {
      setCityText(selectedItems[0].cityName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems])
  useEffect(() => {
    // check for location permission when the component mounts
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'granted') {
          setHasPermission(true)
        } else {
          setHasPermission(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {(isToastOpen && !hasPermission) &&
        <PermissionToast
          isToastOpen={isToastOpen}
          setIsToastOpen={setIsToastOpen}
          permissionDeniedCount={permissionDeniedCount}
        />
      }
      <Typeahead
        ref={typeaheadRef}
        id="city-search-typehead"
        minLength={1}
        isLoading={acquiringGeolocation}
        labelKey={city => `${city.cityName}`}
        filterBy={() => true}
        options={cityOptions(optionLimit)}
        selected={selectedItems}
        onChange={(selected) => { handleOnChange(selected) }}
        onInputChange={handleInputChange}
        onKeyDown={handleKeyDownSearch}
        onFocus={handleFocusInput}
        open={isDropdownOpen}
        onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
        placeholder=" "
        className={`has-text--${(selectedItems.length > 0 || cityText.length > 0) ? 'true' : 'false'
          } is-dropdown-open--${isDropdownOpen ? 'true' : 'false'
          } city-search-typeahead`}
          inputProps={{
            'aria-controls': 'city-search-typehead'
          }}
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
                enterKeyHint="search"
                aria-describedby="city-search-error-message"
              />
              <label htmlFor="city-search-typeahead">
                Near a city
              </label>
              {(cityOptions(optionLimit).length === 1 && cityText) && 
                <span
                  key={cityText}
                  id="city-search-error-message"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  className="visually-hidden"
                >
                  No match. Please check your spelling or try a larger city in B.C.
                </span>
              }
            </Form.Group>
          )
        }}
        renderMenu={results => (
          <Menu id="city-search-typeahead-menu">
            {(results.length === 1 && cityText) &&
              <MenuItem
                tabIndex={-1}
                key={results.length}
                className="no-suggestion-text"
              >
                No match. Please check your spelling or try a larger city in B.C.
              </MenuItem>
            }
            {results.map((city, index) => {
              return city.strapi_id !== 0 ?
                <MenuItem option={city} position={index} key={index}>
                  <HighlightText
                    city={city.cityName}
                    input={cityText}
                  />
                </MenuItem>
                : <MenuItem option={city} position={index} key={index}
                  className="current-location-text"
                >
                  <FontAwesomeIcon icon={faLocationArrow} className="location-icon" />
                  {currentLocation.cityName}
                </MenuItem>
            }
            )}
          </Menu>
        )}
      >
        {({ onClear, selected }) =>
          (!!selected.length || cityText?.length > 0) && (
            <div className="rbt-aux">
              <ClearButton
                onClick={() => {
                  onClear()
                  handleClear()
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