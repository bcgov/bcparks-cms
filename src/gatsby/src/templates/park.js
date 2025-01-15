import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import { sortBy, truncate } from "lodash"
import { graphql, Link as GatsbyLink, navigate } from "gatsby"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import useScrollSpy from "react-use-scrollspy"

import { isNullOrWhiteSpace } from "../utils/helpers";
import { loadAdvisories, WINTER_FULL_PARK_ADVISORY, WINTER_SUB_AREA_ADVISORY } from '../utils/advisoryHelper';
import { preProcessSubAreas, combineCampingTypes, combineFacilities } from '../utils/subAreaHelper';

import About from "../components/park/about"
import AdvisoryDetails from "../components/park/advisoryDetails"
import Breadcrumbs from "../components/breadcrumbs"
import CampingDetails from "../components/park/campingDetails"
import Contact from "../components/park/contact"
import Footer from "../components/footer"
import Header from "../components/header"
import MapLocation from "../components/park/mapLocation"
import NearbyParks from "../components/park/nearbyParks"
import PageMenu from "../components/pageContent/pageMenu"
import ParkActivity from "../components/park/parkActivity"
import ParkFacility from "../components/park/parkFacility"
import ParkHeader from "../components/park/parkHeader"
import ParkOverview from "../components/park/parkOverview"
import ParkPhotoGallery from "../components/park/parkPhotoGallery"
import Reconciliation from "../components/park/reconciliation"
import ReservationsRequired from "../components/park/reservationsRequired"
import SafetyInfo from "../components/park/safetyInfo"
import ScrollToTop from "../components/scrollToTop"
import Seo from "../components/seo"
import SpecialNote from "../components/park/specialNote"
import VisitResponsibly from "../components/park/visitResponsibly"
import VisitorGuidelines from "../components/park/visitorGuidelines"

import parksLogo from "../images/park-card.png"
import "../styles/parks.scss"

export default function ParkTemplate({ data }) {
  const apiBaseUrl = `${data.site.siteMetadata.apiURL}/api`

  const park = data.strapiProtectedArea
  const parkType = park.type.toLowerCase() ?? "park"
  const operations = park.parkOperation || {}
  const photos = [...data.featuredPhotos.nodes, ...data.regularPhotos.nodes]

  const description = park.description.data.description
  const safetyInfo = park.safetyInfo.data.safetyInfo
  const specialNotes = park.specialNotes.data.specialNotes
  const locationNotes = park.locationNotes.data.locationNotes
  const conservation = park.conservation.data.conservation
  const culturalHeritage = park.culturalHeritage.data.culturalHeritage
  const history = park.history.data.history
  const wildlife = park.wildlife.data.wildlife
  const reconciliationNotes = park.reconciliationNotes.data.reconciliationNotes
  const maps = park.maps.data.maps
  const contact = park.parkContact.data.parkContact
  const hasNearbyParks = park.nearbyParks?.length > 0
  const nearbyParks = park.nearbyParks
  const hasParkGuidelines = park.parkGuidelines?.length > 0
  const managementAreas = park.managementAreas || []
  const searchArea = managementAreas[0]?.searchArea || {}

  const activeActivities = sortBy(
    park.parkActivities.filter(
      activity => activity.isActive && activity.activityType?.isActive
    ),
    ["activityType.rank", "activityType.activityName"],
    ["asc"]
  )

  const subAreas = preProcessSubAreas(park.parkOperationSubAreas)
  const activeFacilities = combineFacilities(park.parkFacilities, data.allStrapiFacilityType.nodes, subAreas);
  const activeCampings = combineCampingTypes(park.parkCampingTypes, data.allStrapiCampingType.nodes, subAreas);

  const hasReservations = operations.hasReservations
  const hasDayUsePass = operations.hasDayUsePass

  const menuContent = data?.allStrapiMenu?.nodes || []

  const [advisoryLoadError, setAdvisoryLoadError] = useState(false)
  const [isLoadingAdvisories, setIsLoadingAdvisories] = useState(true)
  const [advisories, setAdvisories] = useState([])
  const [protectedAreaLoadError, setProtectedAreaLoadError] = useState(false)
  const [isLoadingProtectedArea, setIsLoadingProtectedArea] = useState(true)
  const [hasCampfireBan, setHasCampfireBan] = useState(false)
  const [parkAccessStatus, setParkAccessStatus] = useState(null)
  const [addedSeasonalAdvisory, setAddedSeasonalAdvisory] = useState(false)

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
    axios.get(`${apiBaseUrl}/protected-areas/${park.orcs}?fields=hasCampfireBan`)
      .then(response => {
        if (response.status === 200) {
          setHasCampfireBan(response.data.hasCampfireBan)
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
      const id = window.location.hash.replace("#", "")
      const element = document.getElementById(id) || document.querySelector(window.location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [isLoadingProtectedArea, isLoadingAdvisories])

  const handleAccessStatus = function (statusObj) {
    setParkAccessStatus(statusObj);
  };

  const parkOverviewRef = useRef(null)
  const knowBeforeRef = useRef(null)
  const mapLocationRef = useRef(null)
  const campingRef = useRef(null)
  const activityRef = useRef(null)
  const facilityRef = useRef(null)
  const aboutRef = useRef(null)
  const reconciliationRef = useRef(null)
  const contactRef = useRef(null)

  const sectionRefs = [
    parkOverviewRef,
    knowBeforeRef,
    mapLocationRef,
    campingRef,
    activityRef,
    facilityRef,
    aboutRef,
    reconciliationRef,
    contactRef,
  ]

  const activeSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    defaultValue: 0,
    offsetPx: -100,
  })

  const menuItems = [
    {
      sectionIndex: 0,
      display: `Highlights in this ${parkType}`,
      link: "#highlights",
      visible: !isNullOrWhiteSpace(description),
    },
    {
      sectionIndex: 1,
      display: "Know before you go",
      link: "#know-before-you-go",
      visible: true,
    },
    {
      sectionIndex: 2,
      display: "Maps and location",
      link: "#maps-and-location",
      visible: !isNullOrWhiteSpace(maps) || !isNullOrWhiteSpace(locationNotes)
    },
    {
      sectionIndex: 3,
      display: "Camping",
      link: "#camping",
      visible: activeCampings.length > 0,
    },
    {
      sectionIndex: 4,
      display: "Things to do",
      link: "#things-to-do",
      visible: activeActivities.length > 0,
    },
    {
      sectionIndex: 5,
      display: "Facilities",
      link: "#facilities",
      visible: activeFacilities.length > 0,
    },
    {
      sectionIndex: 6,
      display: `About this ${parkType}`,
      link: "#about-this-park",
      visible: !isNullOrWhiteSpace(conservation) || 
        !isNullOrWhiteSpace(culturalHeritage) ||
        !isNullOrWhiteSpace(history) || !isNullOrWhiteSpace(wildlife)
    },
    {
      sectionIndex: 7,
      display: "Reconciliation with Indigenous Peoples",
      link: "#reconciliation",
      visible: !isNullOrWhiteSpace(reconciliationNotes),
    },
    {
      sectionIndex: 8,
      display: `Contact`,
      link: "#contact",
      visible: true
    }
  ]

  const parkName = park.protectedAreaName;

  if (!addedSeasonalAdvisory) {
    // suppress any seasonal advisories if another advisory overrides them.
    // usually this is due to some sort of full park closure event.
    if (advisories.some(a => a.accessStatus?.hidesSeasonalAdvisory)) {
      setAddedSeasonalAdvisory(true);
    }
    // add park-level seasonal advisory
    if (parkAccessStatus?.mainGateClosure) {
      advisories.push(WINTER_FULL_PARK_ADVISORY);
      setAddedSeasonalAdvisory(true);
    }
    // add subarea seasonal advisory
    else if (parkAccessStatus?.areaClosure) {
      advisories.push(WINTER_SUB_AREA_ADVISORY);
      setAddedSeasonalAdvisory(true);
    }
  }

  const breadcrumbs = [
    <GatsbyLink key="1" to="/">
      Home
    </GatsbyLink>,
    <GatsbyLink
      key="2"
      to="/find-a-park/"
      onClick={(e) => {
        if (sessionStorage.getItem("prevPath").includes('find-a-park')) {
          e.preventDefault();
          navigate(-1);
        } else if (sessionStorage.getItem("lastSearch")) {
          e.preventDefault();
          navigate('/find-a-park/' + sessionStorage.getItem("lastSearch"))
        }
      }}
    >
      Find a park
    </GatsbyLink>,
    <div key="3" className="breadcrumb-text">
      {parkName}
    </div>,
  ]

  return (
    <div>
      <Header mode="internal" content={menuContent} />
      <div className="park-header-container d-flex flex-wrap d-md-block">
        <div className="parks-container bg-brown">
          <div id="main-content" tabIndex={-1} className="park-info-container breadcrumb-container">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
          <ParkHeader
            orcs={park.orcs}
            slug={park.slug}
            parkName={parkName}
            parkType={parkType}
            mapZoom={park.mapZoom}
            latitude={park.latitude}
            longitude={park.longitude}
            campings={activeCampings}
            facilities={activeFacilities}
            hasCampfireBan={hasCampfireBan}
            hasDayUsePass={hasDayUsePass}
            hasReservations={hasReservations}
            advisories={advisories}
            advisoryLoadError={advisoryLoadError}
            isLoadingAdvisories={isLoadingAdvisories}
            protectedAreaLoadError={protectedAreaLoadError}
            isLoadingProtectedArea={isLoadingProtectedArea}
            searchArea={searchArea}
            parkOperation={park.parkOperation}
            operationDates={park.parkOperationDates}
            subAreas={park.parkOperationSubAreas}
            onStatusCalculated={handleAccessStatus}
          />
        </div>
        <div className={`parks-container gallery-container has-photo--${photos.length > 0}`}>
          {photos.length > 0 && (
            <div className="background-container bg-brown"></div>
          )}
          <div className="park-info-container">
            <ParkPhotoGallery photos={photos} />
          </div>
        </div>
      </div>
      <div className="parks-container main-container">
        <div className="page-menu--mobile d-block d-md-none">
          <PageMenu
            pageSections={menuItems}
            activeSection={activeSection}
            menuStyle="select"
          />
        </div>
        <div className="row g-0 park-info-container">
          <div className="page-menu--desktop d-none d-md-block col-12 col-md-4">
            <PageMenu
              pageSections={menuItems}
              activeSection={activeSection}
              menuStyle="nav"
            />
          </div>
          <div className={`page-content has-nearby-parks--${hasNearbyParks} col-12 col-md-8`}>
            {menuItems[0].visible && (
              <div ref={parkOverviewRef} className="w-100">
                <ParkOverview description={description} type={parkType} audio={park.parkNameAudio} />
              </div>
            )}
            {menuItems[1].visible && (
              <div ref={knowBeforeRef} className="w-100">
                <div id="know-before-you-go" className="anchor-link">
                  <h2 className="section-heading">Know before you go</h2>
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
                    <AdvisoryDetails advisories={advisories} parkType={parkType} parkAccessStatus={parkAccessStatus} />
                  )}
                  {hasParkGuidelines &&
                    <Row>
                      <Col>
                        <VisitorGuidelines
                          guidelines={park.parkGuidelines}
                          trailReports={park.trailReports}
                        />
                      </Col>
                    </Row>
                  }
                  {(!isNullOrWhiteSpace(safetyInfo) && !hasParkGuidelines) &&
                    <SafetyInfo safetyInfo={safetyInfo} />
                  }
                  {(!isNullOrWhiteSpace(specialNotes) && !hasParkGuidelines) &&
                    <SpecialNote specialNotes={specialNotes} />
                  }
                  <blockquote className="callout-box mb-4">
                    <p>
                      Review the detailed guides under visit responsibly for more information
                      on staying safe and preserving our natural spaces.
                    </p>
                  </blockquote>
                  <Row>
                    <Col xs={12} md={6}>
                      <VisitResponsibly
                        campings={activeCampings}
                        activities={activeActivities}
                        marineProtectedArea={park.marineProtectedArea}
                      />
                    </Col>
                    <Col xs={12} md={6}>
                      <ReservationsRequired operations={operations} />
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {menuItems[2].visible && (
              <div ref={mapLocationRef} className="w-100">
                <MapLocation maps={maps} locationNotes={locationNotes} />
              </div>
            )}
            {menuItems[3].visible && (
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
            {menuItems[4].visible && (
              <div ref={activityRef} className="w-100">
                <ParkActivity
                  data={activeActivities}
                  slug={park.slug}
                  hasDiscoverParksLink={park.hasDiscoverParksLink}
                />
              </div>
            )}
            {menuItems[5].visible && (
              <div ref={facilityRef} className="w-100">
                <ParkFacility
                  data={activeFacilities}
                  groupPicnicReservationUrl={park.parkOperation?.groupPicnicReservationUrl}
                />
              </div>
            )}
            {menuItems[6].visible && (
              <div ref={aboutRef} className="w-100">
                <About
                  parkType={parkType}
                  conservation={conservation}
                  culturalHeritage={culturalHeritage}
                  history={history}
                  wildlife={wildlife}
                  biogeoclimaticZones={park.biogeoclimaticZones}
                  terrestrialEcosections={park.terrestrialEcosections}
                  marineEcosections={park.marineEcosections}
                />
              </div>
            )}
            {menuItems[7].visible && (
              <div ref={reconciliationRef} className="w-100">
                <Reconciliation data={reconciliationNotes} />
              </div>
            )}
            {menuItems[8].visible && (
              <div ref={contactRef} className="w-100">
                <Contact
                  contact={contact}
                  parkContacts={park.parkContacts}
                  operations={operations}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {hasNearbyParks &&
        <NearbyParks parks={nearbyParks} />
      }
      <ScrollToTop />
      <Footer />
    </div>
  )
}

export const Head = ({ data }) => {
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
      image={photoUrl || parksLogo}
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
      hasDiscoverParksLink
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
      conservation {
        data {
          conservation
        }
      }
      culturalHeritage {
        data {
          culturalHeritage
        }
      }
      history {
        data {
          history
        }
      }
      wildlife {
        data {
          wildlife
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
          facilityCode
        }
      }
      parkCampingTypes {
        isActive
        isCampingOpen
        hideStandardCallout
        description {
          data
        }
        campingType {
          campingTypeCode
        }
      }
      parkGuidelines {
        isActive
        rank
        title
        description {
          data {
            description
          }
        }
        guidelineType {
          icon
          hasTrailReport
          defaultRank
          defaultTitle
          defaultDescription {
            data {
              defaultDescription 
            }
          }
        }
      }
      parkOperation {
        isActive
        hasReservations
        hasBackcountryReservations
        hasBackcountryPermits
        hasDayUsePass
        hasFirstComeFirstServed
        reservationUrl
        dayUsePassUrl
        frontcountryReservationUrl
        frontcountryGroupReservationUrl
        frontcountryCabinReservationUrl
        backcountryReservationUrl
        backcountryPermitUrl
        backcountryGroupReservationUrl
        backcountryWildernessReservationUrl
        backcountryShelterReservationUrl
        canoeCircuitReservationUrl
        groupPicnicReservationUrl
        hasParkGate
        offSeasonUse
        openNote {
          data {
            openNote
          }
        }
        gateOpenTime
        gateCloseTime
        gateOpensAtDawn
        gateClosesAtDusk
        gateOpen24Hours
        hasGroupPicnicReservations
        hasCanoeCircuitReservations
        hasFrontcountryReservations
        hasFrontcountryGroupReservations
        hasFrontcountryCabinReservations
        hasBackcountryGroupReservations
        hasBackcountryShelterReservations
        hasBackcountryWildernessReservations
        customReservationLinks {
          content {
            data {
              content
            }
          }
        }
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
        serviceNote {
          data {
            serviceNote
          }
        }
        reservationNote {
          data {
            reservationNote
          }
        }
        offSeasonNote {
          data {
            offSeasonNote
          }
        }
        closureAffectsAccessStatus
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
          subAreaType
          subAreaTypeCode
          closureAffectsAccessStatus
          facilityType {
            facilityCode
          }
          campingType {
            campingTypeCode
          }
        }
      }
      parkOperationDates {
        operatingYear
        gateOpenDate
        gateCloseDate
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
      nearbyParks {
        orcs
        slug
        protectedAreaName
        parkPhotos {
          isActive
          isFeatured
          sortOrder
          imageUrl
        }
        parkActivities {
          isActive
          activityType {
            activityNumber
            activityCode
            isActive
          }
        }
        parkFacilities {
          isActive
          facilityType {
            facilityNumber
            facilityCode
            isActive
          }
        }
        parkCampingTypes {
          isActive
          campingType {
            campingTypeNumber
            campingTypeCode
            isActive
          }
        }
      }
      managementAreas {
        searchArea {
          searchAreaName
        }
      }
      trailReports {
        title
        reportUrl
        reportDate
      }
      parkContacts {
        rank
        isActive
        title
        description {
          data {
            description
          }
        }
        contactInformation {
          contactType
          contactText
          contactUrl
        }
        parkOperatorContact {
          facilityOperatorName
          defaultTitle
          defaultDescription {
            data {
              defaultDescription
            }
          }
          defaultContactInformation {
            contactType
            contactText
            contactUrl
          }
        }
      }
      parkNameAudio {
        title
        url
        credit
        transcript
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
        caption {
          data {
            caption
          }
        }
        photographer
        showPhotoCredit
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
        caption {
          data {
            caption
          }
        }
        photographer
        showPhotoCredit
      }
    }
    allStrapiCampingType {
      nodes {
        appendStandardCalloutText {
          data {
            appendStandardCalloutText
          }
        }
        defaultDescription {
          data {
            defaultDescription
          }
        }
        campingTypeCode
        campingTypeName
        icon
        isActive
        rank
        pluralName
      }
    }
    allStrapiFacilityType {
      nodes {
        appendStandardCalloutText {
          data {
            appendStandardCalloutText
          }
        }
        defaultDescription {
          data {
            defaultDescription
          }
        }
        facilityCode
        facilityName
        icon
        isActive
        rank
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
`
