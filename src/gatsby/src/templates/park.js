import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { sortBy, truncate } from "lodash"
import { graphql, Link as GatsbyLink, navigate } from "gatsby"
import loadable from '@loadable/component'

import {
  Container,
  Grid,
  CssBaseline,
  Breadcrumbs,
} from "@mui/material"

import useScrollSpy from "react-use-scrollspy"

import { capitalizeFirstLetter, isNullOrWhiteSpace } from "../utils/helpers";
import { loadAdvisories } from '../utils/advisoryHelper';

import Footer from "../components/footer"
import Header from "../components/header"
import PageMenu from "../components/pageContent/pageMenu"

import About from "../components/park/about"
import AdvisoryDetails from "../components/park/advisoryDetails"
import CampingDetails from "../components/park/campingDetails"
import NatureAndCulture from "../components/park/natureAndCulture"
import Reconciliation from "../components/park/reconciliation"
import ParkActivity from "../components/park/parkActivity"
import ParkDates from "../components/park/parkDates"
import ParkFacility from "../components/park/parkFacility"
import ParkHeader from "../components/park/parkHeader"
import ParkMapDetails from "../components/park/parkMapDetails"
import ParkOverview from "../components/park/parkOverview"
import ParkPhotoGallery from "../components/park/parkPhotoGallery"
import SafetyInfo from "../components/park/safetyInfo"
import SpecialNote from "../components/park/specialNote"
import Spacer from "../components/park/spacer"
import ScrollToTop from "../components/scrollToTop"
import Seo from "../components/seo"

import "../styles/parks.scss"
import { PARK_NAME_TYPE, StyledGrid } from "../utils/constants";

const qs = require('qs')
const AsyncMapLocation =  loadable(() => import("../components/park/mapLocation"));

const loadProtectedArea = (apiBaseUrl, orcsId) => {
  const params = qs.stringify({
    filters: {
      orcs: {
        $eq: orcsId
      }
    },
    fields: ['hasCampfireBan']
  }, {
    encodeValuesOnly: true,
  })

  return axios.get(`${apiBaseUrl}/protected-areas?${params}`)
}

export default function ParkTemplate({ data }) {
  const apiBaseUrl = `${data.site.siteMetadata.apiURL}/api`

  const park = data.strapiProtectedArea
  const parkType = park.type ?? "park"
  const operations = park.parkOperation || {}
  const photos = [...data.featuredPhotos.nodes, ...data.regularPhotos.nodes]

  const description = park.description.data.description
  const safetyInfo = park.safetyInfo.data.safetyInfo
  const specialNotes = park.specialNotes.data.specialNotes
  const locationNotes = park.locationNotes.data.locationNotes
  const natureAndCulture = park.natureAndCulture.data.natureAndCulture
  const reconciliationNotes = park.reconciliationNotes.data.reconciliationNotes
  const maps = park.maps.data.maps

  const activeActivities = sortBy(
    park.parkActivities.filter(
      activity => activity.isActive && activity.activityType?.isActive
    ),
    ["activityType.rank", "activityType.activityName"],
    ["asc"]
  )
  const activeFacilities = sortBy(
    park.parkFacilities.filter(
      facility => facility.isActive && facility.facilityType?.isActive
    ),
    ["facilityType.rank", "facilityType.facilityName"],
    ["asc"]
  )

  const campingActivities = 
    activeActivities.filter(
      activity => activity.activityType.isCamping
    )
  const campingFacilities = 
    activeFacilities.filter(
      facility => facility.facilityType.isCamping
    )
  const nonCampingActivities = 
    activeActivities.filter(
      activity => !activity.activityType.isCamping
    )
  const nonCampingFacilities = 
    activeFacilities.filter(
      facility => !facility.facilityType.isCamping
    )
  const activeCampings = campingActivities.concat(campingFacilities).sort((a, b) => {
    if ((a.activityType?.activityName || a.facilityType?.facilityName) < (b.activityType?.activityName || b.facilityType?.facilityName)) {
      return -1;
    }
    if ((a.activityType?.activityName || a.facilityType?.facilityName) > (b.activityType?.activityName || b.facilityType?.facilityName)) {
      return 1;
    }
    return 0
  })

  const hasReservations = operations.hasReservations
  const hasDayUsePass = operations.hasDayUsePass

  const menuContent = data?.allStrapiMenu?.nodes || []

  const [advisoryLoadError, setAdvisoryLoadError] = useState(false)
  const [isLoadingAdvisories, setIsLoadingAdvisories] = useState(true)
  const [advisories, setAdvisories] = useState([])
  const [protectedAreaLoadError, setProtectedAreaLoadError] = useState(false)
  const [isLoadingProtectedArea, setIsLoadingProtectedArea] = useState(true)
  const [hasCampfireBan, setHasCampfireBan] = useState(false)

  useEffect(() => {
    setIsLoadingAdvisories(true)
    loadAdvisories(apiBaseUrl, park.orcs)
      .then(response => {
        if (response.status === 200) {
          setAdvisories(response.data.data)
          setAdvisoryLoadError(false)
        } else {
          setAdvisories([])
          setAdvisoryLoadError(true)
        }
      })
      .finally(() => {
        setIsLoadingAdvisories(false)
      })
    setIsLoadingProtectedArea(true)
    loadProtectedArea(apiBaseUrl, park.orcs)
      .then(response => {
        if (response.status === 200) {
          const park = response.data?.data?.length ? response.data.data[0] : {};
          setHasCampfireBan(park?.attributes?.hasCampfireBan || false)
          setProtectedAreaLoadError(false)
        } else {
          setHasCampfireBan(false)
          setProtectedAreaLoadError(true)
        }
      })
      .finally(() => {
        setIsLoadingProtectedArea(false)
      })
  }, [apiBaseUrl, park.orcs])

  useEffect(() => {
    if (window.location.hash && !isLoadingProtectedArea && !isLoadingAdvisories) {
      const href = window.location.href
      window.location.replace(href)
    }
  }, [isLoadingProtectedArea, isLoadingAdvisories])

  const parkOverviewRef = useRef("")
  const accessibilityRef = useRef("")
  const advisoryRef = useRef("")
  const parkDatesRef = useRef("")
  const safetyRef = useRef("")
  const specialRef = useRef("")
  const campingRef = useRef("")
  const facilityRef = useRef("")
  const activityRef = useRef("")
  const mapLocationRef = useRef("")
  const activityMapRef = useRef("")
  const aboutRef = useRef("")
  const natureAndCultureRef = useRef("")
  const reconciliationRef = useRef("")

  const sectionRefs = [
    parkOverviewRef,
    accessibilityRef,
    advisoryRef,
    parkDatesRef,
    safetyRef,
    specialRef,
    campingRef,
    facilityRef,
    activityRef,
    mapLocationRef,
    activityMapRef,
    aboutRef,
    natureAndCultureRef,
    reconciliationRef,
  ]

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    defaultValue: 0,
    offsetPx: -100,
  })

  const menuItems = [
    {
      sectionIndex: 0,
      display: capitalizeFirstLetter(`${parkType} overview`),
      link: "#park-overview-container",
      visible: !isNullOrWhiteSpace(description),
    },
    {
      // Depricated, also delete the section if removing
      sectionIndex: 1,
      display: "Accessibility",
      link: "#accessibility-details-container",
      visible: false
      // visible: park.accessibility,
    },
    {
      sectionIndex: 2,
      display:
        !isLoadingAdvisories && !advisoryLoadError
          ? `Advisories (${advisories.length})`
          : "Advisories",
      link: "#park-advisory-details-container",
      visible: true,
    },
    {
      sectionIndex: 3,
      display: "Dates of operation",
      link: "#park-dates-container",
      visible: park.parkOperation,
    },
    {
      sectionIndex: 4,
      display: "Safety info",
      link: "#park-safety-info-container",
      visible: !isNullOrWhiteSpace(safetyInfo),
    },
    {
      sectionIndex: 5,
      display: "Special notes",
      link: "#park-special-notes-container",
      visible: !isNullOrWhiteSpace(specialNotes),
    },
    {
      sectionIndex: 6,
      display: "Camping",
      link: "#park-camping-details-container",
      visible: activeCampings.length > 0,
    },
    {
      sectionIndex: 7,
      display: "Facilities",
      link: "#park-facility-container",
      visible: nonCampingFacilities.length > 0,
    },
    {
      sectionIndex: 8,
      display: "Activities",
      link: "#park-activity-container",
      visible: nonCampingActivities.length > 0,
    },
    {
      sectionIndex: 9,
      display: "Location",
      link: "#park-maps-location-container",
      visible: (park.latitude && park.longitude) || !isNullOrWhiteSpace(locationNotes),
    },
    {
      sectionIndex: 10,
      display: capitalizeFirstLetter(`${parkType} and activity maps`),
      link: "#park-map-details-container",
      visible: !isNullOrWhiteSpace(maps),
    },
    {
      sectionIndex: 11,
      display: capitalizeFirstLetter(`Learn about this ${parkType}`),
      link: "#park-about-container",
      visible:
        park.totalArea ||
        park.establishedDate ||
        !isNullOrWhiteSpace(park.parkContact.data.parkContact)
    },
    {
      sectionIndex: 12,
      display: "Nature and culture",
      link: "#park-nature-and-culture-container",
      visible: !isNullOrWhiteSpace(natureAndCulture),
    },
    {
      sectionIndex: 13,
      display: "Reconciliation with Indigenous Peoples",
      link: "#park-reconciliation-container",
      visible: !isNullOrWhiteSpace(reconciliationNotes),
    },
  ]

  const mapData = {
    latitude: park.latitude,
    longitude: park.longitude,
    mapZoom: park.mapZoom,
    parkOrcs: park.orcs
  }

  const parkName = park.protectedAreaName;

  const breadcrumbs = [
    <GatsbyLink key="1" to="/" underline="hover">
      Home
    </GatsbyLink>,
    <GatsbyLink
      key="2"
      to="/find-a-park/"
      underline="hover"
      onClick={(e) => {
        if (sessionStorage.getItem("prevPath").includes('find-a-park')) {
          e.preventDefault();
          navigate(-1);
        } else if (sessionStorage.getItem("lastSearch")) {
          e.preventDefault();
          navigate('/find-a-park/' + sessionStorage.getItem("lastSearch"))
        }
      }}>
      Find a park
    </GatsbyLink>,
    <div key="3" className="breadcrumb-text">
      {parkName}
    </div>,
  ]

  return (
    <div className="grey-background">
      <Header mode="internal" content={menuContent} />
      <ScrollToTop />
      <CssBaseline />
      <div className="park-header-container d-flex flex-wrap d-md-block pb-4 pb-lg-0">
        <div className="container parks-container order-2">
          <div id="sr-content" className="park-info-container pt-4">
                <Breadcrumbs
                  separator="›"
                  aria-label="breadcrumb"
                  className="p20t"
                >
                  {breadcrumbs}
                </Breadcrumbs>
              </div>
              {!isLoadingProtectedArea && !protectedAreaLoadError && (
                <div>
                  <ParkHeader
                    slug={park.slug}
                    parkName={parkName}
                    hasReservations={hasReservations}
                    hasDayUsePass={hasDayUsePass}
                    hasCampfireBan={hasCampfireBan}
                    isLoadingAdvisories={isLoadingAdvisories}
                    advisoryLoadError={advisoryLoadError}
                    advisories={advisories}
                  />
                </div>
              )}
        </div>

        <div className="page-menu--mobile d-block d-lg-none mb-4 mb-md-0 order-3">
            <PageMenu
              pageSections={menuItems}
              activeSection={activeSection}
              menuStyle="select"
            />
        </div>
        
        <div className="container parks-container gallery-container order-1">
          <div className="park-info-container">
            <ParkPhotoGallery photos={photos} />
            </div>
        </div>

      </div>

      <div className="container parks-container">
        <Container className="park-info-container" maxWidth={false}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              md={3}
              lg={3}
              className="page-menu--desktop d-none d-lg-block"
            >
              <PageMenu
                pageSections={menuItems}
                activeSection={activeSection}
                menuStyle="nav"
              />
            </Grid>
            <StyledGrid
              item
              xs={12}
              sm={12}
              md={9}
              lg={9}
            >
              {menuItems[0].visible && (
                <div ref={parkOverviewRef} className="w-100">
                  <ParkOverview data={description} type={parkType} />
                </div>
              )}
              {menuItems[1].visible && (
                <div ref={accessibilityRef} className="w-100">
                  
                </div>
              )}
              {menuItems[2].visible && (
                <div ref={advisoryRef} className="w-100">
                  {isLoadingAdvisories && (
                    <div className="mb-5">
                      <h2 className="section-heading">{`Advisories`}</h2>
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && advisoryLoadError && (
                    <div className="mb-5">
                      <div className="alert alert-danger" role="alert">
                        An error occurred while loading current public
                        advisories.
                      </div>
                    </div>
                  )}
                  {!isLoadingAdvisories && !advisoryLoadError && (
                    <AdvisoryDetails advisories={advisories} />
                  )}
                </div>
              )}
              {menuItems[3].visible && (
                <div ref={parkDatesRef} className="w-100">
                  <ParkDates
                    data={{
                      parkOperation: park.parkOperation,
                      subAreas: park.parkOperationSubAreas,
                      advisories: advisories,
                      marineProtectedArea: park.marineProtectedArea
                    }}
                  />
                </div>
              )}
              {menuItems[4].visible && (
                <div ref={safetyRef} className="w-100">
                  <SafetyInfo safetyInfo={safetyInfo} />
                </div>
              )}
              {menuItems[5].visible && (
                <div ref={specialRef} className="w-100">
                  <SpecialNote specialNotes={specialNotes} />
                </div>
              )}
              {menuItems[6].visible && (
                <div ref={campingRef} className="w-100">
                  <CampingDetails
                    data={{
                      activeCampings: activeCampings,
                      reservations: park.reservations,
                      hasDayUsePass: hasDayUsePass,
                      hasReservations: hasReservations,
                      parkOperation: park.parkOperation,
                      subAreas: park.parkOperationSubAreas,
                    }}
                  />
                </div>
              )}
              {menuItems[7].visible && (
                <div ref={facilityRef} className="w-100">
                  <ParkFacility data={nonCampingFacilities} />
                </div>
              )}
              {menuItems[8].visible && (
                <div ref={activityRef} className="w-100">
                  <ParkActivity data={nonCampingActivities} />
                </div>
              )}
              {menuItems[9].visible && (
                <div ref={mapLocationRef} className="w-100">
                  <div id="park-maps-location-container" className="anchor-link">
                    <AsyncMapLocation data={mapData} />
                    {locationNotes && (
                      <>
                        <div id="park-location-notes-container" 
                          dangerouslySetInnerHTML={{
                            __html: locationNotes,
                          }}
                        ></div>
                        <Spacer />
                        </>
                    )}
                  </div>
                </div>
              )}
              {menuItems[10].visible && (
                <div ref={activityMapRef} className="w-100">
                  <ParkMapDetails data={maps} type={parkType} />
                </div>
              )}
              {menuItems[11].visible && (
                <div ref={aboutRef} className="w-100">
                  <About park={park} />
                </div>
              )}
              {menuItems[12].visible && (
                <div ref={natureAndCultureRef} className="w-100">
                  <NatureAndCulture data={natureAndCulture} />
                </div>
              )}
              {menuItems[13].visible && (
                <div ref={reconciliationRef} className="w-100">
                  <Reconciliation data={reconciliationNotes} />
                </div>
              )}
            </StyledGrid>
          </Grid>
        </Container>
      </div>

      <Footer />

    </div>
  )
}

export const Head = ({data}) => {
  const park = data.strapiProtectedArea
  const seo = park.seo
  const description = park.description.data.description
  const parkDescription = description.replace(/(<([^>]+)>)/ig, '');
  const parkDescriptionShort = truncate(parkDescription, { length: 160 });
  const photos = [...data.featuredPhotos.nodes, ...data.regularPhotos.nodes]
  const photoUrl = photos[0]?.imageUrl

  return (
    <Seo
      title={seo?.metaTitle || park.protectedAreaName}
      description={seo?.metaDescription || parkDescriptionShort}
      keywords={seo?.metaKeywords}
      image={photoUrl}
    />
  )
}

export const query = graphql`
  query ProtectedAreaDetails($orcs: Int) {
    strapiProtectedArea(orcs: {eq: $orcs}) {
      slug
      protectedAreaName
      description {
        data {
          description
        }
      }
      status
      orcs
      marineArea
      type
      typeCode
      hasCampfireBan
      locationNotes {
        data {
          locationNotes
        }
      }
      reconciliationNotes {
        data {
          reconciliationNotes
        }
      }
      safetyInfo {
        data {
          safetyInfo
        }
      }
      specialNotes {
        data {
          specialNotes
        }
      }
      parkContact {
        data {
          parkContact
        }
      }
      natureAndCulture {
        data {
          natureAndCulture
        }
      }
      reservations {
        data {
          reservations
        }
      }
      maps {
        data {
          maps
        }
      }
      latitude
      longitude
      mapZoom
      totalArea
      uplandArea
      marineArea
      establishedDate
      marineProtectedArea
      seo {
        metaDescription
        metaKeywords
        metaTitle
      }
      parkActivities {
        isActive
        isActivityOpen
        hideStandardCallout
        description {
          data
        }
        activityType {
          activityName
          activityCode
          isActive
          isCamping
          icon
          iconNA
          rank
          defaultDescription {
            data
          }
          appendStandardCalloutText {
            data
          }
        }
      }
      parkFacilities {
        isActive
        isFacilityOpen
        hideStandardCallout
        description {
          data
        }
        facilityType {
          facilityName
          facilityCode
          isActive
          isCamping
          icon
          iconNA
          rank
          defaultDescription {
            data
          }
          appendStandardCalloutText {
            data
          }
        }
      }
      parkOperation {
        openDate
        closeDate
        isActive
        hasReservations
        hasBackcountryReservations
        hasBackcountryPermits
        hasDayUsePass
        hasFirstComeFirstServed
        reservationUrl
        backcountryPermitUrl
        dayUsePassUrl
        hasParkGate
        offSeasonUse
        totalCapacity
        frontcountrySites
        reservableSites
        nonReservableSites
        vehicleSites
        vehicleSitesReservable
        doubleSites
        pullThroughSites
        rvSites
        rvSitesReservable
        electrifiedSites
        longStaySites
        walkInSites
        walkInSitesReservable
        groupSites
        groupSitesReservable
        backcountrySites
        wildernessSites
        boatAccessSites
        horseSites
        cabins
        huts
        yurts
        shelters
        boatLaunches
        openNote
        serviceNote
        reservationsNote
        offSeasonNote
        generalNote
        adminNote
      }
      parkOperationSubAreas {
        parkSubArea
        orcsSiteNumber
        isActive
        isOpen
        hasReservations
        hasBackcountryReservations
        hasBackcountryPermits
        hasFirstComeFirstServed
        parkAccessUnitId
        isCleanAirSite
        totalCapacity
        frontcountrySites
        reservableSites
        nonReservableSites
        vehicleSites
        vehicleSitesReservable
        doubleSites
        pullThroughSites
        rvSites
        rvSitesReservable
        electrifiedSites
        longStaySites
        walkInSites
        walkInSitesReservable
        groupSites
        groupSitesReservable
        backcountrySites
        wildernessSites
        boatAccessSites
        horseSites
        cabins
        huts
        yurts
        shelters
        boatLaunches
        openNote
        serviceNote
        reservationNote
        offSeasonNote
        adminNote
        parkOperationSubAreaDates {
          isActive
          operatingYear
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
          isActive
          subAreaType
          subAreaTypeCode
          iconUrl
        }
        facilityType {
          facilityName
          facilityNumber
          isActive
          icon
          rank
          isCamping
        }
      }
      biogeoclimaticZones {
        zone
      }
      marineEcosections {
        marineEcosection
      }
      terrestrialEcosections {
        terrestrialEcosection
      }
    }
    featuredPhotos: allStrapiParkPhoto(
      filter: {
        orcs: {eq: $orcs},
        isFeatured: {eq: true},
        isActive: {eq: true}
      }
      sort: [
        {sortOrder: ASC},
        {dateTaken: DESC},
        {strapi_id: DESC}
      ]
    ) {
      nodes {
        imageUrl
        caption
      }
    }
    regularPhotos: allStrapiParkPhoto(
      filter: {
        orcs: {eq: $orcs},
        isFeatured: {ne: true},
        isActive: {eq: true}
      }
      sort: [
        {sortOrder: ASC},
        {dateTaken: DESC},
        {strapi_id: DESC}
      ]
    ) {
      nodes {
        imageUrl
        caption
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
        strapi_children {
          id
          title
          url
          order
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
`
