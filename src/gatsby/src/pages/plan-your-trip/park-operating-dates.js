import React, { useState, useEffect } from "react"
import { graphql, useStaticQuery, Link } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircleChevronRight } from "@fortawesome/free-solid-svg-icons"

import Breadcrumbs from "../../components/breadcrumbs"
import Header from "../../components/header"
import Footer from "../../components/footer"
import Seo from "../../components/seo"
import ScrollToTop from "../../components/scrollToTop"
import ParkAccessStatus from "../../components/park/parkAccessStatus"
import StaticIcon from "../../components/park/staticIcon"
import NoSearchResults from "../../components/search/noSearchResults"
import { datePhrase, processDateRanges, groupSubAreaDates } from "../../utils/parkDatesHelper"
import { loadAllAdvisories, WINTER_FULL_PARK_ADVISORY, WINTER_SUB_AREA_ADVISORY } from "../../utils/advisoryHelper"
import "../../styles/listPage.scss"

const ParkLink = ({ park, advisories, advisoryLoadError, isLoadingAdvisories }) => {
  const thisYear = new Date().getFullYear()
  const parkOperation = park.parkOperation
  const parkOperationDates = park.parkOperationDates.find(d => d.operatingYear === +thisYear) || {}
  const subAreas = park.parkOperationSubAreas.filter(a => a.isActive) || []
  const [parkAccessStatus, setParkAccessStatus] = useState({})
  const [addedSeasonalAdvisory, setAddedSeasonalAdvisory] = useState(false)

  // Overall operating dates for parks, to display above subareas
  let fmt = "MMM D, yyyy"
  let yr = "year-round"
  let parkDates = datePhrase(parkOperationDates.gateOpenDate, parkOperationDates.gateCloseDate, fmt, yr, " to ", "from ")

  if (parkDates !== yr && !parkDates.includes(thisYear)) {
    parkDates = ""
  }

  // ---- Subarea Dates -----
  yr = "Year-round"
  fmt = "MMM D"

  for (let idx in subAreas) {
    let subArea = subAreas[idx]
    const facilityType = subArea.parkSubAreaType?.facilityType || {}
    const campingType = subArea.parkSubAreaType?.campingType || {}
    subArea.typeIcon = facilityType.icon || campingType.icon || "";
    subArea = groupSubAreaDates(subArea)

    // get distinct date ranges sorted chronologically
    subArea.operationDates = processDateRanges(subArea.operationDates, fmt, yr, "–")
    subArea.serviceDates = processDateRanges(subArea.serviceDates, fmt, yr, "–")
    subArea.resDates = processDateRanges(subArea.resDates, fmt, yr, "–")
    subArea.offSeasonDates = processDateRanges(subArea.offSeasonDates, fmt, yr, "–")

    // add a placeholder if no dates are available for the current year
    if (subArea.serviceDates.length === 0
      && subArea.resDates.length === 0
      && subArea.offSeasonDates.length === 0) {
      subArea.serviceDates.push(`${new Date().getFullYear()}: Dates unavailable`)
    }
  }

  if (!addedSeasonalAdvisory) {
    if (advisories.some(a => a.accessStatus?.hidesSeasonalAdvisory)) {
      setAddedSeasonalAdvisory(true)
    }
    if (parkAccessStatus?.mainGateClosure) {
      advisories.push(WINTER_FULL_PARK_ADVISORY)
      setAddedSeasonalAdvisory(true)
    }
    else if (parkAccessStatus?.areaClosure) {
      advisories.push(WINTER_SUB_AREA_ADVISORY)
      setAddedSeasonalAdvisory(true)
    }
  }

  return (
    <div className="park-list operating-dates-list">
      <div className="d-md-flex justify-content-between mb-2">
        <h2 className="mb-0">
          <Link to={`/${park.slug}`}>
            {park.protectedAreaName}
            <FontAwesomeIcon icon={faCircleChevronRight} className="park-heading-icon" />
          </Link>
        </h2>
      </div>
      <div className="mb-3">
        <>
          <span className="me-1">
            {(!isLoadingAdvisories && !advisoryLoadError) &&
              <ParkAccessStatus
                advisories={advisories}
                slug={park.slug}
                subAreas={park.parkOperationSubAreas}
                operationDates={park.parkOperationDates}
                onStatusCalculated={setParkAccessStatus}
                punctuation="."
              />
            }
          </span>
          {parkDates && (
            <span className="gate-text">The {park.type.toLowerCase()} {parkOperation.hasParkGate !== false && "gate"} is open {parkDates}.</span>
          )}
        </>
      </div>
      {/* display table list if the screen size is bigger than 768 px */}
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th scope="col">Facility</th>
            <th scope="col">Operating season</th>
            <th scope="col">Winter season</th>
            <th scope="col">Booking available</th>
          </tr>
        </thead>
        <tbody>
          {subAreas.map((subArea, index) => (
            <tr key={index}>
              <td>
                <div className="subarea-name">
                  <StaticIcon name={subArea.typeIcon} size={32} />
                  {subArea.parkSubArea}
                </div>
                {subArea.isCleanAirSite &&
                  <>
                    <br />
                    {"("}Clean air site{")"}
                  </>
                }
              </td>
              <td>
                <ul>
                  {subArea.serviceDates.map((dateRange, index) =>
                    <li key={index}>{dateRange}</li>
                  )}
                </ul>
              </td>
              <td>
                {subArea.offSeasonDates.length > 0 ? (
                  <ul>
                    {subArea.offSeasonDates.map((dateRange, index) =>
                      <li key={index}>{dateRange}</li>
                    )}
                  </ul>
                ) : (
                  subArea.operationDates.length > 0 ? (
                    <>
                      {subArea.operationDates[0].toLowerCase().includes("year-round") ?
                        "Limited services" : "No services"}
                    </>
                  ) : (
                    <>Not known</>
                  )
                )}
              </td>
              <td>
                {subArea.resDates.length > 0 ? (
                  <ul>
                    {subArea.resDates.map((dateRange, index) =>
                      <li key={index}>{dateRange}</li>
                    )}
                  </ul>
                ) : (
                  <>No {"("}first come, first served{")"}</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* display table list if the screen size is bigger than 768 px */}
      <div className="card border-secondary">
        {subAreas.map((subArea, index) => (
          <div className="card-body" key={index}>
            <div className="card-title">
              <div className="subarea-name">
                <StaticIcon name={subArea.typeIcon} size={32} />
                <h4>{subArea.parkSubArea}</h4>
              </div>
              {subArea.isCleanAirSite &&
                <h5 className="mt-2">{"("}Clean air site{")"}</h5>
              }
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <div className="list-group-item--container">
                  <b>Operating season</b>
                  <ul>
                    {subArea.serviceDates.map((dateRange, index) =>
                      <li key={index}>{dateRange}</li>
                    )}
                  </ul>
                </div>
                <div className="list-group-item--container">
                  <b>Winter season</b>
                  {subArea.offSeasonDates.length > 0 ? (
                    <ul>
                      {subArea.offSeasonDates.map((dateRange, index) =>
                        <li key={index}>{dateRange}</li>
                      )}
                    </ul>
                  ) : (
                    subArea.operationDates.length > 0 ? (
                      <>
                        <br />{subArea.operationDates[0].includes("Year-round") ? "Limited services" : "No services"}
                      </>
                    ) : (
                      <>
                        <br />Not known
                      </>
                    )
                  )}
                </div>
                <div className="list-group-item--container">
                  <b>Booking available</b>
                  {subArea.resDates.length > 0 ? (
                    <ul>
                      {subArea.resDates.map((dateRange, index) =>
                        <li key={index}>{dateRange}</li>
                      )}
                    </ul>
                  ) : (
                    <>
                      <br />No {"("}first come, first served{")"}
                    </>
                  )}
                </div>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

const ParkOperatingDatesPage = () => {
  const queryData = useStaticQuery(graphql`
    query {
      allStrapiProtectedArea(
        sort: {slug: ASC}
        filter: {
          isDisplayed: {eq: true},
          parkOperation: {isActive: {eq: true}},
          parkOperationSubAreas: {elemMatch: {isActive: {eq: true}}}
        }
      ) {
        nodes {
          orcs
          slug
          protectedAreaName
          marineProtectedArea
          type
          parkOperation {
            hasParkGate
          }
          parkOperationSubAreas {
            isOpen
            isCleanAirSite
            parkSubArea
            isActive
            closureAffectsAccessStatus
            parkOperationSubAreaDates {
              operatingYear
              isActive
              openDate
              closeDate
              serviceStartDate
              serviceEndDate
              reservationStartDate
              reservationEndDate
              offSeasonStartDate
              offSeasonEndDate
            }
            parkSubAreaType {
              closureAffectsAccessStatus
              facilityType {
                 icon
              }
              campingType {
                 icon
              }
            }
          }
          parkOperationDates {
            operatingYear
            gateOpenDate
            gateCloseDate
          }
        }
      }
      allStrapiMenu(
        sort: {order: ASC},
        filter: {show: {eq: true}}
      ) {
        nodes {
          strapi_id
          title
          url
          order
          id
          show
          strapi_children {
            id
            title
            url
            order
            show
          }
          strapi_parent {
            id
            title
          }
        }
      }
      site {
        siteMetadata {
          apiURL
        }
      }
    }
  `)

  // constants
  const apiBaseUrl = `${queryData.site.siteMetadata.apiURL}/api`
  const menuContent = queryData?.allStrapiMenu?.nodes || []
  const parks = queryData?.allStrapiProtectedArea?.nodes || []
  const filters = [
    "All", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
  ]

  // states
  const [advisories, setAdvisories] = useState([])
  const [advisoryLoadError, setAdvisoryLoadError] = useState(false)
  const [isLoadingAdvisories, setIsLoadingAdvisories] = useState(true)
  const [currentFilter, setCurrentFilter] = useState("All")

  // functions
  const handleClick = (e) => {
    setCurrentFilter(e.target.value)
  }
  const filtering = (char) =>
    parks.filter(park => park.slug.charAt(0).toUpperCase() === char)
  const hasResult = filtering(currentFilter).length > 0 
  const filterAdvisoriesByOrcs = (orcs) => {
    return advisories.filter(advisory => 
      advisory.protectedAreas.some(protectedArea => protectedArea.orcs === orcs)
    )
  }
  const fetchAdvisories = () => {
    setIsLoadingAdvisories(true)
    loadAllAdvisories(apiBaseUrl)
      .then(response => {
        setAdvisories(response.data.data)
        setAdvisoryLoadError(false)
      })
      .catch(error => {
        setAdvisories([])
        setAdvisoryLoadError(true)
        console.error("Error fetching advisories:", error)
      })
      .finally(() => {
        setIsLoadingAdvisories(false)
      })
  }

  // effects
  useEffect(() => {
    fetchAdvisories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl])

  // components
  const breadcrumbs = [
    <Link key="1" to="/">
      Home
    </Link>,
    <Link key="2" to="/plan-your-trip">
      Plan your trip
    </Link>,
    <div key="3" className="breadcrumb-text">
      Park operating dates
    </div>,
  ]

  return (
    <div className="list-page">
      <div className="max-width-override">
        <Header mode="internal" content={menuContent} />
      </div>
      <div id="main-content" tabIndex={-1} className="static-content--header unique-page--header page-breadcrumbs">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <div className="static-content-container">
        <h1 className="header-title">
          Park operating dates
        </h1>
      </div>
      <div className="static-content-container">
        <div className="intro-text-container">
          <p>
            This page provides a list of planned operating dates for BC Parks and their facilities.
            All dates are subject to change without notice. Be sure to <Link to="/find-a-park">check the park page</Link>
            {" "}or the <Link to="/active-advisories">active advisories page</Link> for warnings and closures.
          </p>
          <ul>
            <li>
              <b>Operating season: </b>
              During these dates, the facility is open, services are provided, and fees may be charged.
              Outside of these dates, there are no services provided, there are no fees, and access may not be available.
              Each park has different services, fees, and access,
              so <Link to="/find-a-park">check the park page</Link> for details.
            </li>
            <li>
              <b>Winter season: </b>
              These dates indicate when a frontcountry campground offers camping with reduced fees and services in their shoulder season.
              {" "}<Link to="/find-a-park">Check the park page</Link> for winter rates and details. 
            </li>
            <li>
              <b>Booking available: </b>
              During these dates, either <Link to="/reservations">reservations</Link> are available,
              or <Link to="/reservations/backcountry-camping/permit-registration">backcountry permit registration</Link> is required.
              To find out which booking you need, <Link to="/find-a-park">check the park page</Link>.
              If a reservable campground is open outside of these dates, sites are available on a first come, first served basis.
            </li>
          </ul>
        </div>
      </div>

      <div className="static-content-container">
        <div className="page-content-wrapper">
          <div>
            <h2 className="sub-heading">Filter by park name</h2>
            <div className="filters">
              {filters.map((filter, index) => (
                <button
                  key={index}
                  value={filter}
                  aria-label={filter}
                  onClick={(e) => handleClick(e, filter)}
                  className={
                    `btn btn-selected--${currentFilter === filter ? 'true' : 'false'
                    }`
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="lists">
            {currentFilter === "All" ? (
              filters.map((filter, index) => (
                <div key={index} className="list">
                  {filtering(filter).map((park, index) => (
                    <ParkLink 
                      key={index}
                      park={park}
                      advisories={filterAdvisoriesByOrcs(park.orcs)}
                      advisoryLoadError={advisoryLoadError}
                      isLoadingAdvisories={isLoadingAdvisories}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="list">
                {hasResult ? 
                  filtering(currentFilter).map((park, index) => (
                    <ParkLink
                      key={index}
                      park={park}
                      advisories={filterAdvisoriesByOrcs(park.orcs)}
                      advisoryLoadError={advisoryLoadError}
                      isLoadingAdvisories={isLoadingAdvisories}
                    />
                  ))
                  : <NoSearchResults page="park-operating-dates" />
                }
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-width-override">
        <ScrollToTop />
        <Footer />
      </div>
    </div>
  )
}

export default ParkOperatingDatesPage

export const Head = () => (
  <Seo
    title="Park operating dates"
    description="This page provides a list of planned operating dates for BC Parks and their facilities."
  />
)